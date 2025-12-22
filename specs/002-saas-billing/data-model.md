# Data Model: SaaS Billing

**Feature**: 002-saas-billing  
**Date**: 2025-12-22  
**Purpose**: Define database schema extensions for subscription and usage tracking

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                              User                                    │
│  (extended - add billing fields to existing user record)            │
├─────────────────────────────────────────────────────────────────────┤
│  id                  String  PK                                      │
│  email               String  (existing)                              │
│  ...existing fields...                                               │
│  ─────────────────── NEW FIELDS ───────────────────                 │
│  stripeCustomerId    String? (cus_...)                              │
│  stripeSubscriptionId String? (sub_...)                             │
│  plan                Enum    [FREE, PRO] default FREE               │
│  subscriptionStatus  Enum?   [active, canceled, past_due, trialing] │
│  currentPeriodEnd    DateTime?                                       │
└─────────────────────────────────────────────────────────────────────┘
         │ 1
         │
         │ has many
         ▼ N
┌─────────────────────────────────────────────────────────────────────┐
│                             Usage                                    │
│  (NEW table - tracks individual scan events for quota)              │
├─────────────────────────────────────────────────────────────────────┤
│  id                  String  PK (uuid)                              │
│  userId              String  FK → User.id                           │
│  type                Enum    [MEAL_ANALYSIS] (extensible)           │
│  mealId              String? FK → MealAnalysis.id (optional link)   │
│  createdAt           DateTime default now()                          │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ belongs to (optional)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MealAnalysis                                 │
│  (existing - no changes required)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  id                  String  PK                                      │
│  userId              String                                          │
│  ...existing fields...                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       SubscriptionEvent                              │
│  (NEW table - audit log for Stripe webhooks)                        │
├─────────────────────────────────────────────────────────────────────┤
│  id                  String  PK (uuid)                              │
│  userId              String? FK → User.id (nullable for edge cases) │
│  eventType           String  (checkout.session.completed, etc.)     │
│  stripeEventId       String  UNIQUE (idempotency key)               │
│  eventData           Json    (full Stripe event payload)            │
│  processedAt         DateTime?                                       │
│  createdAt           DateTime default now()                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Prisma Schema Extensions

### Plan Enum

```prisma
enum Plan {
  FREE
  PRO
}
```

### Subscription Status Enum

```prisma
enum SubscriptionStatus {
  active
  canceled
  past_due
  trialing
}
```

### Usage Type Enum

```prisma
enum UsageType {
  MEAL_ANALYSIS
}
```

### User Model (Extended)

```prisma
model User {
  id                    String              @id @default(uuid())
  email                 String              @unique
  // ... existing fields ...
  
  // Stripe billing fields
  stripeCustomerId      String?             @db.VarChar(255)
  stripeSubscriptionId  String?             @db.VarChar(255)
  plan                  Plan                @default(FREE)
  subscriptionStatus    SubscriptionStatus?
  currentPeriodEnd      DateTime?
  
  // Relations
  usages               Usage[]
  subscriptionEvents   SubscriptionEvent[]
  mealAnalyses         MealAnalysis[]
  
  // Indexes
  @@index([stripeCustomerId])
  @@index([plan])
}
```

### Usage Model (New)

```prisma
model Usage {
  id        String    @id @default(uuid())
  userId    String
  type      UsageType
  mealId    String?   // Optional link to specific meal
  createdAt DateTime  @default(now())
  
  // Relations
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  meal      MealAnalysis? @relation(fields: [mealId], references: [id], onDelete: SetNull)
  
  // Indexes for quota queries
  @@index([userId, type, createdAt])  // Primary quota lookup
  @@index([userId, createdAt])         // Date range queries
}
```

### SubscriptionEvent Model (New)

```prisma
model SubscriptionEvent {
  id            String    @id @default(uuid())
  userId        String?
  eventType     String    @db.VarChar(100)
  stripeEventId String    @unique @db.VarChar(255)  // Idempotency key
  eventData     Json
  processedAt   DateTime?
  createdAt     DateTime  @default(now())
  
  // Relations
  user          User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  // Indexes
  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
}
```

## Migration SQL (for reference)

```sql
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE "UsageType" AS ENUM ('MEAL_ANALYSIS');

-- AlterTable: Add billing fields to User
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN "plan" "Plan" NOT NULL DEFAULT 'FREE';
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" "SubscriptionStatus";
ALTER TABLE "User" ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);

-- CreateTable: Usage
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "UsageType" NOT NULL,
    "mealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SubscriptionEvent
CREATE TABLE "SubscriptionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" VARCHAR(100) NOT NULL,
    "stripeEventId" VARCHAR(255) NOT NULL,
    "eventData" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionEvent_stripeEventId_key" ON "SubscriptionEvent"("stripeEventId");
CREATE INDEX "Usage_userId_type_createdAt_idx" ON "Usage"("userId", "type", "createdAt");
CREATE INDEX "Usage_userId_createdAt_idx" ON "Usage"("userId", "createdAt");
CREATE INDEX "SubscriptionEvent_userId_idx" ON "SubscriptionEvent"("userId");
CREATE INDEX "SubscriptionEvent_eventType_idx" ON "SubscriptionEvent"("eventType");
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX "User_plan_idx" ON "User"("plan");

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "MealAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

## State Transitions

### User Plan Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  NEW USER                                                        │
│  plan: FREE                                                      │
│  subscriptionStatus: null                                        │
│  stripeCustomerId: null                                          │
│                                                                   │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          │ checkout.session.completed
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  PRO SUBSCRIBER                                                  │
│  plan: PRO                                                       │
│  subscriptionStatus: active                                      │
│  stripeCustomerId: cus_xxx                                       │
│  stripeSubscriptionId: sub_xxx                                   │
│  currentPeriodEnd: 2025-01-22T00:00:00Z                          │
│                                                                   │
└──────┬─────────────────────────────────┬─────────────────────────┘
       │                                 │
       │ invoice.payment_failed          │ customer.subscription.deleted
       ▼                                 │ (or cancel via portal)
┌─────────────────────────┐              │
│                         │              │
│  GRACE PERIOD           │              │
│  plan: PRO              │              │
│  subscriptionStatus:    │              │
│    past_due             │              │
│  (5 days grace)         │              │
│                         │              │
└──────┬──────────────────┘              │
       │                                 │
       │ grace period expired            │
       │ OR payment recovered →          │
       │    back to PRO SUBSCRIBER       │
       ▼                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  DOWNGRADED (former Pro)                                         │
│  plan: FREE                                                      │
│  subscriptionStatus: null                                        │
│  stripeCustomerId: cus_xxx (preserved for re-subscription)       │
│  stripeSubscriptionId: null                                      │
│  currentPeriodEnd: null                                          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Validation Rules

### User
- `stripeCustomerId`: If present, must match Stripe format `cus_*`
- `stripeSubscriptionId`: If present, must match Stripe format `sub_*`
- `currentPeriodEnd`: Required if `plan === PRO`
- `subscriptionStatus`: Required if `plan === PRO`

### Usage
- `type`: Must be valid UsageType enum value
- `createdAt`: Cannot be in the future
- Cascade delete: When User is deleted, all Usage records are deleted

### SubscriptionEvent
- `stripeEventId`: Must be unique (enforced by database constraint)
- `eventData`: Must be valid JSON (validated by Stripe SDK)
- SetNull on user delete: Events preserved for audit, user reference nullified

## Indexes Justification

| Index | Query Pattern | Performance Requirement |
|-------|--------------|------------------------|
| `Usage(userId, type, createdAt)` | Count scans in rolling 7 days | <10ms for quota check |
| `Usage(userId, createdAt)` | List recent usage for UI | <50ms for dashboard |
| `User(stripeCustomerId)` | Webhook: find user by Stripe customer | <5ms |
| `User(plan)` | Admin: list Pro users | <100ms |
| `SubscriptionEvent(stripeEventId)` | Idempotency check | <5ms |
| `SubscriptionEvent(userId)` | Admin: view user's billing history | <50ms |

## Data Retention

Per Constitution Principle VII:
- `Usage` records: Retained indefinitely (analytics value)
- `SubscriptionEvent` records: Retained 7 years (financial audit compliance)
- User deletion cascades to Usage records
- SubscriptionEvent user reference nullified on user deletion (audit trail preserved)
