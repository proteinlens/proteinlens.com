# Stripe Webhook Events Contract

**Feature**: 002-saas-billing  
**Date**: 2025-12-22  
**Purpose**: Define the webhook events we handle and their processing behavior

## Subscribed Events

Configure these events in Stripe Dashboard → Webhooks:

| Event Type | Trigger | Our Action |
|------------|---------|------------|
| `checkout.session.completed` | User completes Pro checkout | Create/update subscription, set plan=PRO |
| `customer.subscription.updated` | Subscription renewed, plan changed | Update currentPeriodEnd, status |
| `customer.subscription.deleted` | Subscription canceled (period ended) | Set plan=FREE, clear subscription fields |
| `invoice.payment_failed` | Recurring payment fails | Set status=past_due, start grace period |

## Event Payloads

### checkout.session.completed

**When**: User successfully completes Stripe Checkout for Pro subscription

```json
{
  "id": "evt_1ABC...",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "object": "checkout.session",
      "client_reference_id": "user-uuid-here",
      "customer": "cus_ABC...",
      "customer_email": "user@example.com",
      "subscription": "sub_ABC...",
      "mode": "subscription",
      "payment_status": "paid",
      "metadata": {
        "userId": "user-uuid-here"
      }
    }
  }
}
```

**Processing**:
```typescript
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  
  // Fetch subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      plan: 'PRO',
      subscriptionStatus: 'active',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  });
  
  // TODO: Send welcome email
}
```

---

### customer.subscription.updated

**When**: Subscription is renewed, payment method updated, or plan changed

```json
{
  "id": "evt_2DEF...",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_ABC...",
      "object": "subscription",
      "customer": "cus_ABC...",
      "status": "active",
      "current_period_end": 1735862400,
      "cancel_at_period_end": false,
      "items": {
        "data": [{
          "price": {
            "id": "price_monthly_or_annual"
          }
        }]
      }
    },
    "previous_attributes": {
      "current_period_end": 1733184000
    }
  }
}
```

**Processing**:
```typescript
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: subscription.customer as string }
  });
  
  if (!user) {
    console.error(`No user found for customer ${subscription.customer}`);
    return;
  }
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: subscription.status as SubscriptionStatus,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      // If canceled at period end, status is still 'active' until period ends
      // We don't downgrade until subscription.deleted event
    }
  });
}
```

---

### customer.subscription.deleted

**When**: Subscription period ended after cancellation OR immediate cancellation

```json
{
  "id": "evt_3GHI...",
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_ABC...",
      "object": "subscription",
      "customer": "cus_ABC...",
      "status": "canceled",
      "ended_at": 1735862400
    }
  }
}
```

**Processing**:
```typescript
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: subscription.customer as string }
  });
  
  if (!user) {
    console.error(`No user found for customer ${subscription.customer}`);
    return;
  }
  
  // Downgrade to Free
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'FREE',
      subscriptionStatus: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null
      // Keep stripeCustomerId for potential re-subscription
    }
  });
  
  // TODO: Send downgrade notification email
}
```

---

### invoice.payment_failed

**When**: Recurring payment fails (card declined, expired, etc.)

```json
{
  "id": "evt_4JKL...",
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_ABC...",
      "object": "invoice",
      "customer": "cus_ABC...",
      "subscription": "sub_ABC...",
      "attempt_count": 1,
      "next_payment_attempt": 1735948800,
      "status": "open"
    }
  }
}
```

**Processing**:
```typescript
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string }
  });
  
  if (!user) {
    console.error(`No user found for customer ${invoice.customer}`);
    return;
  }
  
  // Update status to past_due (grace period starts)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due'
      // Keep plan as PRO during grace period
      // Grace period logic in shouldHaveProAccess() function
    }
  });
  
  // TODO: Send payment failure notification email
}
```

## Idempotency

All webhook processing is idempotent using `stripeEventId`:

```typescript
async function processWebhook(event: Stripe.Event): Promise<{ processed: boolean }> {
  // Check for duplicate
  const existing = await prisma.subscriptionEvent.findUnique({
    where: { stripeEventId: event.id }
  });
  
  if (existing) {
    return { processed: false }; // Already handled
  }
  
  // Store event first (audit trail, prevents duplicates)
  await prisma.subscriptionEvent.create({
    data: {
      stripeEventId: event.id,
      eventType: event.type,
      eventData: event.data.object as any,
      createdAt: new Date()
    }
  });
  
  // Process based on type
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }
  
  // Mark as processed
  await prisma.subscriptionEvent.update({
    where: { stripeEventId: event.id },
    data: { processedAt: new Date() }
  });
  
  return { processed: true };
}
```

## Signature Verification

All webhooks must be verified before processing:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function webhookHandler(request: HttpRequest): Promise<HttpResponseInit> {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  
  if (!signature) {
    return { status: 400, body: 'Missing signature' };
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return { status: 400, body: 'Invalid signature' };
  }
  
  // Process event (idempotent)
  await processWebhook(event);
  
  return { status: 200, jsonBody: { received: true } };
}
```

## Error Handling

| Error | Response | Retry? |
|-------|----------|--------|
| Invalid signature | 400 Bad Request | No (security issue) |
| Duplicate event | 200 OK | No (already processed) |
| Database error | 500 Internal Server Error | Yes (Stripe will retry) |
| Unknown event type | 200 OK | No (ignore gracefully) |

Stripe will retry failed webhooks (5xx responses) for up to 72 hours with exponential backoff.

## Testing

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:7071/api/billing/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```
