// Stripe service for payment processing
// Feature: 002-saas-billing

import Stripe from 'stripe';

// Lazy-loaded Stripe client (initialized on first use)
let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.includes('REPLACE')) {
      throw new Error('STRIPE_SECRET_KEY not configured. Set a valid Stripe secret key in environment.');
    }
    stripe = new Stripe(key, {
      apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
      typescript: true,
    });
  }
  return stripe;
}

/**
 * Create a Stripe Checkout session for subscription
 * @param customerId - Stripe customer ID (create if null)
 * @param priceId - Stripe price ID (monthly or annual)
 * @param userId - Internal user ID for metadata
 * @param userEmail - User email for Stripe customer
 */
export async function createCheckoutSession(
  customerId: string | null,
  priceId: string,
  userId: string,
  userEmail?: string
): Promise<{ sessionId: string; url: string }> {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  // Create customer if doesn't exist
  let stripeCustomerId = customerId;
  if (!stripeCustomerId) {
    const customer = await getStripeClient().customers.create({
      email: userEmail,
      metadata: { userId },
    });
    stripeCustomerId = customer.id;
  }

  const session = await getStripeClient().checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing?canceled=true`,
    subscription_data: {
      metadata: { userId },
    },
    metadata: { userId },
  });

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

/**
 * Create a Stripe Customer Portal session for billing management
 * @param customerId - Stripe customer ID
 */
export async function createPortalSession(
  customerId: string
): Promise<{ url: string }> {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  const session = await getStripeClient().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/settings`,
  });

  return { url: session.url };
}

/**
 * Verify Stripe webhook signature
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  
  return getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Get Stripe customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await getStripeClient().customers.retrieve(customerId);
    if (customer.deleted) return null;
    return customer as Stripe.Customer;
  } catch {
    return null;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await getStripeClient().subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripeClient().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripeClient().subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// Export stripe instance for advanced usage
export { stripe };
