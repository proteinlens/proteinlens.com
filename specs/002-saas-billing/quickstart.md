# Quickstart: SaaS Billing Implementation

**Feature**: 002-saas-billing  
**Date**: 2025-12-22  
**Estimated Time**: 3-4 days

## Prerequisites

Before starting implementation, ensure you have:

- [x] Stripe account (test mode enabled)
- [x] Node.js 20+ installed
- [x] Azure Functions Core Tools installed
- [x] Existing ProteinLens codebase running locally

## Step 1: Stripe Dashboard Setup (30 min)

### 1.1 Create Product and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products) → Products
2. Click "Add product"
   - Name: `ProteinLens Pro`
   - Description: `Unlimited meal scans, full history, data export`
3. Add two prices:
   - **Monthly**: €9.99/month recurring
   - **Annual**: €79.00/year recurring
4. Note the Price IDs (e.g., `price_1ABC...`, `price_2DEF...`)

### 1.2 Configure Customer Portal

1. Go to Settings → Billing → Customer Portal
2. Enable:
   - [x] Payment method updates
   - [x] View invoice history
   - [x] Cancel subscriptions
3. Configure cancellation flow:
   - Cancellation reason: Optional
   - Proration behavior: "Don't prorate"

### 1.3 Set Up Webhook Endpoint (after deployment)

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/billing/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Note the Webhook Signing Secret

## Step 2: Environment Variables (15 min)

### 2.1 Update local.settings.json

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    
    // ... existing settings ...
    
    // Stripe (NEW)
    "STRIPE_SECRET_KEY": "sk_test_...",
    "STRIPE_WEBHOOK_SECRET": "whsec_...",
    "STRIPE_PRICE_MONTHLY": "price_...",
    "STRIPE_PRICE_ANNUAL": "price_...",
    
    // Application
    "APP_URL": "http://localhost:5173"
  }
}
```

### 2.2 Update frontend .env

```env
# Existing
VITE_API_BASE_URL=http://localhost:7071/api

# Stripe (NEW)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 3: Install Dependencies (5 min)

```bash
# Backend
cd backend
npm install stripe

# Frontend (Stripe.js loaded via CDN, no npm package needed)
```

## Step 4: Database Migration (30 min)

### 4.1 Update Prisma Schema

Add to `backend/prisma/schema.prisma`:

```prisma
enum Plan {
  FREE
  PRO
}

enum SubscriptionStatus {
  active
  canceled
  past_due
  trialing
}

enum UsageType {
  MEAL_ANALYSIS
}

// Extend User model (or create if not exists)
model User {
  id                    String              @id @default(uuid())
  email                 String              @unique
  
  // Billing
  stripeCustomerId      String?             @db.VarChar(255)
  stripeSubscriptionId  String?             @db.VarChar(255)
  plan                  Plan                @default(FREE)
  subscriptionStatus    SubscriptionStatus?
  currentPeriodEnd      DateTime?
  
  // Relations
  usages               Usage[]
  subscriptionEvents   SubscriptionEvent[]
  mealAnalyses         MealAnalysis[]
  
  @@index([stripeCustomerId])
  @@index([plan])
}

model Usage {
  id        String    @id @default(uuid())
  userId    String
  type      UsageType
  mealId    String?
  createdAt DateTime  @default(now())
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  meal      MealAnalysis? @relation(fields: [mealId], references: [id], onDelete: SetNull)
  
  @@index([userId, type, createdAt])
}

model SubscriptionEvent {
  id            String    @id @default(uuid())
  userId        String?
  eventType     String    @db.VarChar(100)
  stripeEventId String    @unique @db.VarChar(255)
  eventData     Json
  processedAt   DateTime?
  createdAt     DateTime  @default(now())
  
  user          User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([stripeEventId])
}
```

### 4.2 Run Migration

```bash
cd backend
npx prisma migrate dev --name add-billing-tables
npx prisma generate
```

## Step 5: Backend Implementation Order

Implement in this sequence for minimal dependencies:

### Phase 1: Core Services (1 day)

1. **stripeService.ts** - Stripe SDK wrapper
   - Initialize Stripe client
   - Create checkout session
   - Create portal session
   - Verify webhook signature

2. **usageService.ts** - Quota tracking
   - `getUsage(userId)` - Get scan count in rolling 7 days
   - `recordUsage(userId, mealId)` - Record new scan
   - `canPerformScan(userId)` - Check if under limit

3. **subscriptionService.ts** - Plan management
   - `getUserPlan(userId)` - Get current plan with grace period logic
   - `updateSubscription(userId, data)` - Update from webhook

### Phase 2: API Functions (0.5 day)

4. **checkout.ts** - POST /api/billing/checkout
5. **billing-portal.ts** - POST /api/billing/portal
6. **webhook.ts** - POST /api/billing/webhook
7. **usage.ts** - GET /api/billing/usage

### Phase 3: Quota Enforcement (0.5 day)

8. **quotaMiddleware.ts** - Quota check middleware
9. Update **analyze.ts** - Add quota enforcement
10. Update meal history endpoints - Add plan visibility filter

## Step 6: Frontend Implementation Order

### Phase 1: Services and State (0.5 day)

1. **billingApi.ts** - API client for billing endpoints
2. **useBilling.ts** - React hook for billing state

### Phase 2: Components (0.5 day)

3. **PricingCard.tsx** - Plan comparison card
4. **UsageCounter.tsx** - "X scans remaining"
5. **UpgradePrompt.tsx** - Limit reached modal

### Phase 3: Pages (0.5 day)

6. **PricingPage.tsx** - /pricing route
7. Update **SettingsPage.tsx** - Add billing management section

## Step 7: Local Testing

### 7.1 Test with Stripe CLI

```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Forward Stripe webhooks
stripe listen --forward-to localhost:7071/api/billing/webhook
```

### 7.2 Test Flows

1. **View pricing**: Navigate to /pricing
2. **Checkout flow**: Click "Upgrade to Pro" → Complete test payment
   - Use test card: `4242 4242 4242 4242`
3. **Verify upgrade**: Check usage shows unlimited
4. **Test portal**: Click "Manage Billing" → Verify portal opens
5. **Test cancellation**: Cancel in portal → Verify downgrade after period
6. **Test quota**: Create Free account → Perform 5 scans → Verify 6th blocked

## Step 8: Production Deployment

1. Update Azure App Settings with production Stripe keys
2. Configure Stripe webhook with production URL
3. Run database migration in production
4. Deploy backend and frontend

## Verification Checklist

- [ ] Pricing page displays correct plans and prices
- [ ] Checkout redirects to Stripe successfully
- [ ] Webhook creates Pro subscription on payment
- [ ] Usage counter shows correct remaining scans
- [ ] 6th scan is blocked for Free users
- [ ] Pro users have unlimited scans
- [ ] Billing portal opens correctly
- [ ] Cancellation downgrades user after period
- [ ] History filtering works (Free: 7 days, Pro: unlimited)

## Common Issues

| Issue | Solution |
|-------|----------|
| Webhook signature invalid | Ensure STRIPE_WEBHOOK_SECRET matches Stripe Dashboard |
| Checkout redirect fails | Verify APP_URL in environment matches actual URL |
| Migration fails | Check DATABASE_URL, ensure Prisma client regenerated |
| User not found after checkout | Verify client_reference_id is set to userId |

## Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
