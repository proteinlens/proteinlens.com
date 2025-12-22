// POST /api/billing/checkout - Create Stripe Checkout session
// Feature: 002-saas-billing, User Story 2

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createCheckoutSession } from '../services/stripeService';
import { getOrCreateUser, updateStripeCustomerId } from '../services/subscriptionService';
import { extractUserId } from '../middleware/quotaMiddleware';

interface CheckoutRequestBody {
  priceId: string;
}

/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout session for subscription
 */
async function createCheckout(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('POST /api/billing/checkout - Creating checkout session');

  try {
    // Extract user ID from request
    const userId = extractUserId(request);
    
    if (!userId) {
      return {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Unauthorized',
          message: 'User ID required. Please include x-user-id header.',
        }),
      };
    }

    // Parse request body
    const body = await request.json() as CheckoutRequestBody;
    const { priceId } = body;

    if (!priceId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Bad Request',
          message: 'priceId is required',
        }),
      };
    }

    // Validate price ID against allowed prices
    const allowedPrices = [
      process.env.STRIPE_PRICE_MONTHLY,
      process.env.STRIPE_PRICE_ANNUAL,
    ].filter(Boolean);

    if (allowedPrices.length > 0 && !allowedPrices.includes(priceId)) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Bad Request',
          message: 'Invalid price ID',
        }),
      };
    }

    // Get or create user record
    const userEmail = request.headers.get('x-user-email') || undefined;
    const user = await getOrCreateUser(userId, userEmail);

    // Create Stripe Checkout session
    const session = await createCheckoutSession(
      user.stripeCustomerId,
      priceId,
      user.id,
      userEmail
    );

    // If this was a new Stripe customer, update the user record
    // The customer ID is embedded in the session
    if (!user.stripeCustomerId && session.sessionId) {
      // Note: We'll get the customerId from the webhook after checkout completes
      context.log('Checkout session created for new customer', { userId: user.id });
    }

    context.log('Checkout session created', { 
      sessionId: session.sessionId,
      userId: user.id,
    });

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.sessionId,
        url: session.url,
      }),
    };
  } catch (error) {
    context.error('Error creating checkout session:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
}

// Register the function
app.http('checkout', {
  methods: ['POST'],
  authLevel: 'anonymous', // TODO: Change to 'function' with auth
  route: 'billing/checkout',
  handler: createCheckout,
});

export default createCheckout;
