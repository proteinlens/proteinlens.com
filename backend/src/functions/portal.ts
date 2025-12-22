// POST /api/billing/portal - Create Stripe Customer Portal session
// Feature: 002-saas-billing, User Story 5

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createPortalSession } from '../services/stripeService';
import { getUserPlan } from '../services/subscriptionService';
import { extractUserId } from '../middleware/quotaMiddleware';

/**
 * POST /api/billing/portal
 * Creates a Stripe Customer Portal session for subscription management
 */
async function createPortal(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('POST /api/billing/portal - Creating portal session');

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

    // Get user's billing info
    const userPlan = await getUserPlan(userId);

    if (!userPlan.stripeCustomerId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Bad Request',
          message: 'No billing account found. Please subscribe to Pro first.',
        }),
      };
    }

    // Create Stripe Customer Portal session
    const session = await createPortalSession(userPlan.stripeCustomerId);

    context.log('Portal session created', { 
      userId,
      customerId: userPlan.stripeCustomerId,
    });

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: session.url,
      }),
    };
  } catch (error) {
    context.error('Error creating portal session:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create portal session' }),
    };
  }
}

// Register the function
app.http('portal', {
  methods: ['POST'],
  authLevel: 'anonymous', // TODO: Change to 'function' with auth
  route: 'billing/portal',
  handler: createPortal,
});

export default createPortal;
