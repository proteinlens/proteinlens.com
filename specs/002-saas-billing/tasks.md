# Tasks: SaaS Billing (Free + Pro)

**Input**: Design documents from `/specs/002-saas-billing/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- File paths use web app structure: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stripe SDK, environment configuration, project dependencies

- [x] T001 Install Stripe SDK in backend: `cd backend && npm install stripe`
- [x] T002 [P] Add Stripe environment variables to backend/local.settings.json (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, APP_URL)
- [x] T003 [P] Add VITE_STRIPE_PUBLISHABLE_KEY to frontend/.env.local
- [x] T004 [P] Create TypeScript types for subscription in backend/src/models/subscription.ts (Plan, SubscriptionStatus, UsageType enums + interfaces)
- [x] T005 [P] Add .env.example templates for Stripe config in both backend and frontend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema and core services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [x] T006 Add Plan, SubscriptionStatus, UsageType enums to backend/prisma/schema.prisma
- [x] T007 Add billing fields to User model in backend/prisma/schema.prisma (stripeCustomerId, stripeSubscriptionId, plan, subscriptionStatus, currentPeriodEnd)
- [x] T008 Create Usage model in backend/prisma/schema.prisma with indexes
- [x] T009 Create SubscriptionEvent model in backend/prisma/schema.prisma with unique stripeEventId
- [x] T010 Run Prisma migration: `cd backend && npx prisma migrate dev --name add-billing-tables`
- [x] T011 Regenerate Prisma client: `cd backend && npx prisma generate`

### Core Services

- [x] T012 Create backend/src/services/stripeService.ts with Stripe client initialization
- [x] T013 Implement createCheckoutSession() in backend/src/services/stripeService.ts
- [x] T014 Implement createPortalSession() in backend/src/services/stripeService.ts
- [x] T015 Implement verifyWebhookSignature() in backend/src/services/stripeService.ts
- [x] T016 Create backend/src/services/subscriptionService.ts with getUserPlan() helper
- [x] T017 Implement shouldHaveProAccess() with grace period logic in backend/src/services/subscriptionService.ts
- [x] T018 Implement updateSubscriptionFromWebhook() in backend/src/services/subscriptionService.ts
- [x] T019 Create backend/src/services/usageService.ts with getUsageCount() (rolling 7-day query)
- [x] T020 Implement canPerformScan() in backend/src/services/usageService.ts
- [x] T021 Implement recordUsage() in backend/src/services/usageService.ts

### Tests (Unit)

- [x] T022 [P] Create backend/tests/unit/usageService.test.ts with quota logic tests
- [x] T023 [P] Create backend/tests/unit/subscriptionService.test.ts with grace period tests

**Checkpoint**: Foundation ready - database schema migrated, core services implemented ✅

---

## Phase 3: User Story 1 - View Pricing Plans (Priority: P1) 🎯 MVP

**Goal**: Users can view /pricing page with Free and Pro plan comparison

**Independent Test**: Navigate to /pricing, verify both plans displayed with correct features and prices

### Backend (US1)

- [x] T024 [US1] Create backend/src/functions/plans.ts GET /api/billing/plans endpoint (static pricing data)

### Frontend (US1)

- [x] T025 [P] [US1] Create frontend/src/services/billingApi.ts with getPlans() method
- [x] T026 [P] [US1] Create frontend/src/components/PricingCard.tsx component (plan name, price, features list, CTA button)
- [x] T027 [US1] Create frontend/src/pages/PricingPage.tsx with two PricingCard components (Free + Pro)
- [x] T028 [US1] Add /pricing route to frontend/src/App.tsx router
- [x] T029 [US1] Style PricingPage with tier comparison table (scan limits, history, export columns)

**Checkpoint**: Pricing page accessible at /pricing with complete plan information ✅

---

## Phase 4: User Story 3 - Enforce Free Tier Scan Limits (Priority: P1) 🎯 MVP

**Goal**: Free users limited to 5 scans per rolling 7 days with upgrade prompt when blocked

**Independent Test**: Create Free account, perform 5 scans, verify 6th scan blocked with "Upgrade to Pro" message

### Backend (US3)

- [x] T030 [US3] Create backend/src/middleware/quotaMiddleware.ts with enforceWeeklyQuota() function
- [x] T031 [US3] Add quota check to backend/src/functions/analyze.ts before meal analysis (return 429 if limit exceeded)
- [x] T032 [US3] Create backend/src/functions/usage.ts GET /api/billing/usage endpoint (scansUsed, scansRemaining, periodEnd)
- [x] T033 [US3] Add Usage record creation in backend/src/functions/analyze.ts after successful analysis

### Frontend (US3)

- [x] T034 [P] [US3] Add getUsage() method to frontend/src/services/billingApi.ts
- [x] T035 [P] [US3] Create frontend/src/hooks/useUsage.ts hook for usage state
- [x] T036 [US3] Create frontend/src/components/UsageCounter.tsx ("X scans remaining, resets in Y days")
- [x] T037 [US3] Create frontend/src/components/UpgradePrompt.tsx modal (shown when quota exceeded)
- [x] T038 [US3] Add UsageCounter to main app header/dashboard for Free users
- [x] T039 [US3] Handle 429 response in meal upload flow to show UpgradePrompt

### Tests (US3)

- [x] T040 [P] [US3] Create backend/tests/integration/quota.test.ts (analyze increments usage, blocks at limit)

**Checkpoint**: Free tier quota enforcement working - 6th scan blocked with upgrade prompt ✅

---

## Phase 5: User Story 2 - Subscribe to Pro Plan (Priority: P2)

**Goal**: Free users can upgrade to Pro via Stripe Checkout

**Independent Test**: Click "Upgrade to Pro", complete Stripe test checkout, verify account upgraded

### Backend (US2)

- [x] T041 [US2] Create backend/src/functions/checkout.ts POST /api/billing/checkout endpoint
- [x] T042 [US2] Implement checkout session creation with client_reference_id and metadata
- [x] T043 [US2] Create backend/src/functions/webhook.ts POST /api/billing/webhook endpoint
- [x] T044 [US2] Implement webhook signature verification in webhook.ts
- [x] T045 [US2] Handle checkout.session.completed event - update user plan to PRO
- [x] T046 [US2] Handle customer.subscription.updated event - update currentPeriodEnd
- [x] T047 [US2] Handle customer.subscription.deleted event - downgrade to FREE
- [x] T048 [US2] Handle invoice.payment_failed event - set status to past_due
- [x] T049 [US2] Store all webhook events in SubscriptionEvent table (idempotent by stripeEventId)
- [x] T050 [US2] Register webhook function in backend/src/index.ts

### Frontend (US2)

- [x] T051 [P] [US2] Add createCheckoutSession() method to frontend/src/services/billingApi.ts
- [x] T052 [US2] Add "Upgrade to Pro" button click handler in PricingCard.tsx (calls checkout API, redirects to Stripe)
- [x] T053 [US2] Create frontend/src/pages/CheckoutSuccessPage.tsx for post-checkout redirect
- [x] T054 [US2] Add /billing/success route handling to show success message
- [x] T055 [US2] Add "Upgrade" CTA to UpgradePrompt modal linking to checkout flow

### Tests (US2)

- [x] T056 [P] [US2] Create backend/tests/integration/webhook.test.ts (mock Stripe events, verify DB updates)

**Checkpoint**: Pro subscription purchase flow complete - Stripe checkout → webhook → Pro access ✅

---

## Phase 6: User Story 4 - Pro Users Get Unlimited Access (Priority: P2)

**Goal**: Pro users have unlimited scans, full history, and export access

**Independent Test**: Upgrade to Pro, verify unlimited scans, view full history, access export

### Backend (US4)

- [x] T057 [US4] Skip quota check in quotaMiddleware for Pro users (plan === 'PRO')
- [x] T058 [US4] Add history filtering to backend/src/functions/meals.ts (Free: 7 days, Pro: all)
- [x] T059 [US4] Create backend/src/functions/export.ts GET /api/meals/export endpoint (Pro-only)
- [x] T060 [US4] Implement requirePro() middleware in backend/src/middleware/quotaMiddleware.ts
- [x] T061 [US4] Apply requirePro() middleware to export endpoint

### Frontend (US4)

- [x] T062 [P] [US4] Add getExport() method to frontend/src/services/billingApi.ts
- [x] T063 [US4] Hide UsageCounter component for Pro users
- [x] T064 [US4] Add "Export Data" button to meal history page (visible only for Pro)
- [x] T065 [US4] Add "Pro" badge to user profile/header for Pro subscribers
- [x] T066 [US4] Show "Upgrade to Pro to access full history" message for Free users on old meals

**Checkpoint**: Pro features working - unlimited scans, full history, export available ✅

---

## Phase 7: User Story 5 - Manage Billing and Subscription (Priority: P3)

**Goal**: Pro users can manage billing via Stripe Customer Portal

**Independent Test**: Subscribe to Pro, click "Manage Billing", verify Stripe portal opens

### Backend (US5)

- [x] T067 [US5] Create backend/src/functions/billing-portal.ts POST /api/billing/portal endpoint
- [x] T068 [US5] Implement portal session creation with return URL
- [x] T069 [US5] Verify user has stripeCustomerId before creating portal session

### Frontend (US5)

- [x] T070 [P] [US5] Add createPortalSession() method to frontend/src/services/billingApi.ts
- [x] T071 [US5] Create billing section in frontend/src/pages/SettingsPage.tsx
- [x] T072 [US5] Add "Manage Billing" button for Pro users (calls portal API, redirects)
- [x] T073 [US5] Display current plan and renewal date in settings
- [x] T074 [US5] Show "Reactivate subscription" CTA for lapsed Pro users

**Checkpoint**: Self-service billing management working - Pro users can manage subscription ✅

---

## Phase 8: User Story 6 - Admin View User Subscription Status (Priority: P3)

**Goal**: Admin can view user subscription details for support

**Independent Test**: Login as admin, search user by email, view subscription details

### Backend (US6)

- [x] T075 [US6] Create backend/src/functions/admin-user.ts GET /api/admin/users/:userId endpoint
- [x] T076 [US6] Implement admin role check middleware
- [x] T077 [US6] Return user plan, status, usage stats, recent subscription events

### Frontend (US6) - OPTIONAL (can be deferred)

- [x] T078 [P] [US6] Create frontend/src/pages/AdminUserPage.tsx (if admin UI needed) - DEFERRED
- [x] T079 [US6] Display subscription status, usage, and event history - DEFERRED

**Checkpoint**: Admin can view any user's subscription status for support ✅

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Ops, observability, security, and final cleanup

### Ops & Security

- [x] T080 [P] Add Stripe webhook secret to Azure Function App configuration (STRIPE_WEBHOOK_SECRET)
- [x] T081 [P] Add STRIPE_SECRET_KEY to Azure Function App configuration
- [x] T082 [P] Add CI check to prevent secrets committed (.github/workflows/secrets-check.yml or pre-commit hook)
- [x] T083 [P] Create .env.example files documenting all required environment variables

### Observability

- [x] T084 [P] Add structured logging for billing events in webhook.ts (eventType, userId, success/failure)
- [x] T085 [P] Add logging for quota enforcement (userId, scansUsed, allowed/blocked)
- [x] T086 Add error tracking for Stripe API failures with retry info

### Cleanup

- [x] T087 Update host.json CORS to allow production domain
- [x] T088 Run quickstart.md validation - test full flow end-to-end
- [x] T089 Update README.md with billing feature documentation

**Checkpoint**: Feature 002 complete - SaaS billing fully implemented ✅

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────────────────────────────────────────────────────────────►
                  │
                  ▼
Phase 2 (Foundational) ────────────────────────────────────────────────────────►
                  │
                  ├─► Phase 3 (US1 - Pricing) ──────────►
                  │
                  ├─► Phase 4 (US3 - Quota) ────────────► [MVP Complete]
                  │
                  ├─► Phase 5 (US2 - Subscribe) ────────►
                  │
                  ├─► Phase 6 (US4 - Pro Access) ───────►
                  │
                  ├─► Phase 7 (US5 - Billing Portal) ──►
                  │
                  └─► Phase 8 (US6 - Admin) ────────────►
                                                          │
                                                          ▼
                                          Phase 9 (Polish) ────────────────────►
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|---------------------|
| US1 (Pricing) | Phase 2 | US2, US3 |
| US3 (Quota) | Phase 2 | US1, US2 |
| US2 (Subscribe) | Phase 2 | US1, US3 |
| US4 (Pro Access) | US2, US3 | - |
| US5 (Portal) | US2 | US4, US6 |
| US6 (Admin) | Phase 2 | US4, US5 |

### Parallel Opportunities per Phase

**Phase 2 (Foundational)**:
```bash
# Models can be created in parallel:
T004, T005  # TypeScript types + .env.example

# Schema changes sequential, then services parallel:
T006 → T007 → T008 → T009 → T010 → T011  # Schema (sequential)
T012, T016, T019  # Services can start after T011 (parallel)
T022, T023  # Tests (parallel)
```

**Phase 3 (US1 - Pricing)**:
```bash
# Backend + Frontend components in parallel:
T024  # Backend plans endpoint
T025, T026  # Frontend service + component (parallel)
T027  # Page (after T025, T026)
```

**Phase 4 (US3 - Quota)**:
```bash
# Frontend components in parallel:
T034, T035, T036, T037  # All can start after T032

# Backend sequential for data flow:
T030 → T031 → T032 → T033
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (~0.5 hr)
2. Complete Phase 2: Foundational (~4 hr)
3. Complete Phase 3: US1 Pricing (~2 hr)
4. Complete Phase 4: US3 Quota (~3 hr)
5. **STOP and VALIDATE**: Test pricing page + quota enforcement
6. Deploy MVP - monetization ready

### Full Feature Set

7. Complete Phase 5: US2 Subscribe (~3 hr)
8. Complete Phase 6: US4 Pro Access (~2 hr)
9. Complete Phase 7: US5 Portal (~1.5 hr)
10. Complete Phase 8: US6 Admin (~1.5 hr)
11. Complete Phase 9: Polish (~1.5 hr)

### Task Count Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| 1. Setup | 5 | - |
| 2. Foundational | 18 | - |
| 3. US1 Pricing | 6 | P1 |
| 4. US3 Quota | 11 | P1 |
| 5. US2 Subscribe | 16 | P2 |
| 6. US4 Pro Access | 10 | P2 |
| 7. US5 Portal | 8 | P3 |
| 8. US6 Admin | 5 | P3 |
| 9. Polish | 10 | - |
| **Total** | **89** | |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1-US6)
- MVP = Phase 1-4 (Setup + Foundation + Pricing + Quota) = 40 tasks
- Use Stripe test mode for all development
- Run `stripe listen --forward-to localhost:7071/api/billing/webhook` for local webhook testing
- Commit after each task or logical group
