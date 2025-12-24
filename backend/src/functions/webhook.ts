// POST /api/billing/webhook - Handle Stripe webhook events
// Feature: 002-saas-billing, User Story 2

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '../services/stripeService';
import { 
  updateSubscriptionFromWebhook, 
  downgradeToFree, 
  logSubscriptionEvent,
  updateStripeCustomerId,
  Plan,
  SubscriptionStatus,
} from '../services/subscriptionService.js';
import { getPrismaClient } from '../utils/prisma.js';

const prisma = getPrismaClient();

/**
 * POST /api/billing/webhook
 * Handles Stripe webhook events for subscription lifecycle
 */
async function handleWebhook(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('POST /api/billing/webhook - Processing Stripe event');

  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      context.warn('Missing Stripe signature');
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing stripe-signature header' }),
      };
    }

    // T044: Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(rawBody, signature);
    } catch (err) {
      context.error('Webhook signature verification failed:', err);
      return {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    context.log('Processing Stripe event', { 
      type: event.type, 
      id: event.id,
    });

    // T49: Log event for audit trail (idempotent)
    let userId: string | null = null;

    // Handle specific events
    switch (event.type) {
      // T045: Handle checkout.session.completed - New subscription
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        userId = await handleCheckoutCompleted(session, context);
        break;
      }

      // T046: Handle customer.subscription.updated - Plan changes, renewals
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        userId = await handleSubscriptionUpdated(subscription, context);
        break;
      }

      // T047: Handle customer.subscription.deleted - Cancellation
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        userId = await handleSubscriptionDeleted(subscription, context);
        break;
      }

      // T048: Handle invoice.payment_failed - Payment issues
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        userId = await handlePaymentFailed(invoice, context);
        break;
      }

      default:
        context.log(`Unhandled event type: ${event.type}`);
    }

    // Log the event
    await logSubscriptionEvent(
      userId,
      event.type,
      event.id,
      event.data.object as unknown as Record<string, unknown>
    );

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true, eventId: event.id }),
    };
  } catch (error) {
    context.error('Webhook processing error:', error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
}

/**
 * T045: Handle checkout.session.completed
 * Creates/updates user with Pro subscription
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  context: InvocationContext
): Promise<string | null> {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.userId || session.client_reference_id;

  context.log('Checkout completed', { customerId, subscriptionId, userId });

  if (!userId) {
    context.warn('No userId in checkout session metadata');
    return null;
  }

  // Find user by internal ID (from metadata)
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    context.warn('User not found for checkout', { userId });
    return null;
  }

  // Update user with Stripe customer ID and subscription
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan: Plan.PRO,
      subscriptionStatus: SubscriptionStatus.active,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Will be updated by subscription.updated
    },
  });

  context.log('User upgraded to Pro', { userId, customerId });
  return userId;
}

/**
 * T046: Handle customer.subscription.updated
 * Updates subscription status and period end
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  context: InvocationContext
): Promise<string | null> {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);

  context.log('Subscription updated', { customerId, subscriptionId, status });

  const user = await updateSubscriptionFromWebhook(
    customerId,
    subscriptionId,
    status,
    currentPeriodEnd
  );

  if (!user) {
    context.warn('No user found for subscription update', { customerId });
    return null;
  }

  context.log('User subscription updated', { 
    userId: user.id, 
    status,
    currentPeriodEnd: currentPeriodEnd.toISOString(),
  });
  
  return user.id;
}

/**
 * T047: Handle customer.subscription.deleted
 * Downgrades user to Free
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  context: InvocationContext
): Promise<string | null> {
  const customerId = subscription.customer as string;

  context.log('Subscription deleted', { customerId });

  const user = await downgradeToFree(customerId);

  if (!user) {
    context.warn('No user found for subscription deletion', { customerId });
    return null;
  }

  context.log('User downgraded to Free', { userId: user.id });
  return user.id;
}

/**
 * T048: Handle invoice.payment_failed
 * Sets subscription status to past_due
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  context: InvocationContext
): Promise<string | null> {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string;

  context.log('Payment failed', { customerId, subscriptionId });

  if (!subscriptionId) {
    context.log('No subscription associated with failed invoice');
    return null;
  }

  // Find user and update status to past_due
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    context.warn('No user found for payment failure', { customerId });
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: SubscriptionStatus.past_due,
    },
  });

  context.log('User subscription marked past_due', { userId: user.id });
  return user.id;
}

// Register the function
app.http('webhook', {
  methods: ['POST'],
  authLevel: 'anonymous', // Webhooks must be anonymous, secured by signature
  route: 'billing/webhook',
  handler: handleWebhook,
});

export default handleWebhook;
