# Research: SaaS Billing Implementation

**Feature**: 002-saas-billing  
**Date**: 2025-12-22  
**Purpose**: Resolve technical decisions and best practices for Stripe integration

## 1. Weekly Quota Calculation Method

**Decision**: Rolling 7-day window (not ISO week)

**Rationale**: 
- More intuitive for users ("last 7 days" vs "this week")
- Avoids confusion at week boundaries (user uploads on Sunday, quota resets Monday)
- Provides consistent 7-day value regardless of when user starts using the app
- Simpler to communicate: "5 scans per 7 days" vs "5 scans per week (Monday-Sunday)"

**Alternatives Considered**:
- ISO Week (Monday 00:00 UTC to Sunday 23:59 UTC): Rejected - creates inconsistent value for users who join mid-week
- Calendar month: Rejected - creates very unequal value (28-31 days)

**Implementation**:
```sql
-- Count scans in last 7 days
SELECT COUNT(*) FROM Usage 
WHERE userId = $1 
  AND type = 'MEAL_ANALYSIS' 
  AND createdAt >= NOW() - INTERVAL '7 days'
```

---

## 2. Stripe Checkout vs Stripe Elements

**Decision**: Stripe Checkout (hosted page)

**Rationale**:
- PCI compliance handled entirely by Stripe (no card data touches our servers)
- Mobile-optimized responsive design out of the box
- Built-in support for Apple Pay, Google Pay, Link
- Automatic fraud detection and 3D Secure
- Faster implementation (no custom payment form)
- Handles EU SCA (Strong Customer Authentication) requirements

**Alternatives Considered**:
- Stripe Elements (embedded form): Rejected - requires more frontend work, PCI SAQ-A-EP vs SAQ-A, no benefit for our use case
- Stripe Payment Links: Rejected - less customization, harder to pass customer metadata

**Implementation**:
```typescript
// Backend: Create checkout session
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer_email: user.email,
  client_reference_id: user.id,
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${APP_URL}/settings?billing=success`,
  cancel_url: `${APP_URL}/pricing`,
  metadata: { userId: user.id }
});
return { url: session.url };

// Frontend: Redirect
window.location.href = session.url;
```

---

## 3. Webhook Event Processing Pattern

**Decision**: Idempotent processing with Stripe event ID deduplication

**Rationale**:
- Stripe may deliver webhooks multiple times (retries on network failure)
- Constitution Principle IV requires auditability (store all events)
- Event ID provides natural idempotency key

**Implementation Pattern**:
```typescript
async function handleWebhook(event: Stripe.Event): Promise<void> {
  // 1. Check if already processed
  const existing = await prisma.subscriptionEvent.findUnique({
    where: { stripeEventId: event.id }
  });
  if (existing) {
    console.log(`Event ${event.id} already processed, skipping`);
    return;
  }
  
  // 2. Store event FIRST (audit trail)
  await prisma.subscriptionEvent.create({
    data: {
      stripeEventId: event.id,
      eventType: event.type,
      eventData: event.data.object as any,
      processedAt: new Date()
    }
  });
  
  // 3. Process event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChange(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }
}
```

---

## 4. User Authentication Strategy

**Decision**: Use existing auth provider (treat userId as stable subject)

**Rationale**:
- Existing MVP has authentication infrastructure in place
- userId is already used as foreign key in MealAnalysis table
- No need to change auth system for billing feature

**Implementation**:
- Backend functions extract userId from request (existing pattern)
- Stripe customer is created/linked using userId as `client_reference_id`
- User table extended with stripeCustomerId for reverse lookup

**Alternatives Considered**:
- Implement new auth for billing-only: Rejected - unnecessary complexity
- Use Stripe's customer email as primary key: Rejected - email can change, userId is stable

---

## 5. Subscription Status vs Plan Field

**Decision**: Store both `plan` (FREE/PRO) and `subscriptionStatus` (active/canceled/past_due)

**Rationale**:
- `plan` determines feature access (Free features vs Pro features)
- `subscriptionStatus` tracks billing state (can be past_due but still active)
- Separation allows grace period: status=past_due but plan=PRO for 5 days
- Simplifies quota checks: just check `plan === 'PRO'` for unlimited

**State Transitions**:
```
New User: plan=FREE, subscriptionStatus=null
Subscribe: plan=PRO, subscriptionStatus=active
Payment fails: plan=PRO, subscriptionStatus=past_due (grace period)
Grace ends: plan=FREE, subscriptionStatus=null
Cancel (end of period): plan=FREE, subscriptionStatus=null
```

---

## 6. History Visibility Enforcement

**Decision**: Backend filter at query time (not data deletion)

**Rationale**:
- Constitution Principle VII allows user data deletion, but Free tier restriction is visibility-only
- User who upgrades to Pro should see full history immediately
- User who downgrades keeps data but can't access it until re-subscribing
- No data migration needed when plan changes

**Implementation**:
```typescript
async function getMeals(userId: string, plan: Plan): Promise<Meal[]> {
  const where: Prisma.MealAnalysisWhereInput = { userId };
  
  if (plan === 'FREE') {
    // Only show last 7 days
    where.createdAt = {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };
  }
  // Pro: no date filter, show all
  
  return prisma.mealAnalysis.findMany({ where, orderBy: { createdAt: 'desc' } });
}
```

---

## 7. Atomic Quota Increment

**Decision**: Prisma raw query with `UPDATE ... RETURNING` for atomic increment

**Rationale**:
- Prevents race condition when two uploads happen simultaneously
- Database guarantees atomicity
- Single query instead of SELECT then UPDATE

**Implementation**:
```typescript
async function incrementScanCount(userId: string): Promise<{ success: boolean; count: number }> {
  const weekStart = getWeekStart(); // Monday 00:00 UTC of current week
  
  // Atomic upsert with increment
  const result = await prisma.$executeRaw`
    INSERT INTO "Usage" (id, "userId", "weekStartDate", "scanCount", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${userId}, ${weekStart}, 1, NOW(), NOW())
    ON CONFLICT ("userId", "weekStartDate") 
    DO UPDATE SET "scanCount" = "Usage"."scanCount" + 1, "updatedAt" = NOW()
    WHERE "Usage"."scanCount" < 5
    RETURNING "scanCount"
  `;
  
  // If no rows updated, limit was reached
  if (result === 0) {
    return { success: false, count: 5 };
  }
  
  // Get current count
  const usage = await prisma.usage.findUnique({
    where: { userId_weekStartDate: { userId, weekStartDate: weekStart } }
  });
  
  return { success: true, count: usage?.scanCount ?? 1 };
}
```

**Alternative Approach (for rolling 7 days)**:
```typescript
async function canPerformScan(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const count = await prisma.usage.count({
    where: {
      userId,
      type: 'MEAL_ANALYSIS',
      createdAt: { gte: sevenDaysAgo }
    }
  });
  
  return {
    allowed: count < 5,
    remaining: Math.max(0, 5 - count)
  };
}

// Insert usage record only after successful analysis
async function recordScan(userId: string, mealId: string): Promise<void> {
  await prisma.usage.create({
    data: {
      userId,
      type: 'MEAL_ANALYSIS',
      mealId,
    }
  });
}
```

---

## 8. Grace Period Implementation

**Decision**: Use `currentPeriodEnd` from Stripe + 5-day buffer

**Rationale**:
- Stripe provides `current_period_end` timestamp on subscription
- Past-due status triggers grace period countdown
- Backend checks: if past_due AND now < currentPeriodEnd + 5 days, keep PRO access
- After grace period, downgrade to FREE

**Implementation**:
```typescript
function shouldHaveProAccess(user: User): boolean {
  if (user.plan !== 'PRO') return false;
  if (user.subscriptionStatus === 'active') return true;
  
  if (user.subscriptionStatus === 'past_due' && user.currentPeriodEnd) {
    const gracePeriodEnd = new Date(user.currentPeriodEnd.getTime() + 5 * 24 * 60 * 60 * 1000);
    return new Date() < gracePeriodEnd;
  }
  
  return false;
}
```

---

## 9. Environment Variables Required

**Decision**: Use Azure App Settings for secrets (Constitution Principle I)

**Required Variables**:
```env
# Stripe (backend only - NEVER in frontend)
STRIPE_SECRET_KEY=sk_test_...     # API key for Stripe SDK
STRIPE_WEBHOOK_SECRET=whsec_...   # Webhook signature verification
STRIPE_PRICE_MONTHLY=price_...    # Price ID for €9.99/month
STRIPE_PRICE_ANNUAL=price_...     # Price ID for €79/year

# Stripe (frontend - publishable key is safe)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Application URLs
APP_URL=https://proteinlens.com   # For Stripe redirect URLs
```

**Local Development**: Use `.env.local` (gitignored), copy from `.env.example`

---

## 10. Stripe Product Configuration

**Decision**: Create single product with two prices in Stripe Dashboard

**Setup Steps**:
1. Create Product: "ProteinLens Pro"
   - Name: ProteinLens Pro
   - Description: Unlimited meal scans, full history, data export
   
2. Create Prices:
   - Monthly: €9.99/month, recurring
   - Annual: €79/year, recurring (saves 33%)
   
3. Configure Customer Portal:
   - Enable: Payment method updates
   - Enable: Invoice history
   - Enable: Cancel subscription
   - Disable: Quantity changes (not applicable)
   
4. Configure Webhooks:
   - Endpoint URL: `https://api.proteinlens.com/api/billing/webhook`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

---

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| stripe | ^14.x | Stripe Node.js SDK |
| @types/stripe | Bundled | TypeScript types |

**Installation**:
```bash
cd backend && npm install stripe
```

---

## Open Questions Resolved

1. ✅ **Rolling vs ISO week**: Rolling 7-day window chosen
2. ✅ **Checkout vs Elements**: Stripe Checkout chosen
3. ✅ **Webhook idempotency**: Event ID deduplication chosen
4. ✅ **Auth integration**: Use existing userId
5. ✅ **Plan vs status**: Store both for grace period support
6. ✅ **History visibility**: Query-time filter, not deletion
7. ✅ **Atomic quota**: Database-level atomic operations
8. ✅ **Grace period**: currentPeriodEnd + 5 days

All technical decisions documented. Ready for Phase 1 design.
