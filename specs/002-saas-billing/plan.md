# Implementation Plan: SaaS Billing (Free + Pro)

**Branch**: `002-saas-billing` | **Date**: 2025-12-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-saas-billing/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add subscription-based monetization to ProteinLens with Free tier (5 scans per rolling 7 days, 7-day history) and Pro tier (€9.99/month or €79/year, unlimited scans, full history). Implementation uses Stripe Checkout for payments, Stripe Customer Portal for billing management, and signed webhooks for subscription lifecycle events. Backend enforces quotas at `/api/meals/analyze` and history visibility at `/api/meals` endpoints.

## Technical Context

**Language/Version**: TypeScript 5.3+ / Node.js 20  
**Primary Dependencies**: Azure Functions v4, Prisma 5.8+, Stripe SDK, React 18, Vite 5  
**Storage**: PostgreSQL (Azure), Azure Blob Storage (proteinlensimages)  
**Testing**: Jest (backend), Vitest (frontend)  
**Target Platform**: Azure Functions (backend), Vite SPA (frontend)  
**Project Type**: Web application (backend + frontend monorepo)  
**Performance Goals**: <100ms quota checks, <30s webhook processing, <2min checkout flow  
**Constraints**: Idempotent webhooks, UTC-based time calculations, atomic quota updates  
**Scale/Scope**: 1000 concurrent Free users, sub-100ms quota enforcement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation Notes |
|-----------|--------|---------------------|
| I. Zero Secrets in Client | ✅ PASS | Stripe publishable key only in frontend; secret key + webhook secret in Azure App Settings only |
| II. Least Privilege Access | ✅ PASS | Stripe API calls from backend only; webhook endpoint validates signatures |
| III. Blob-First Ingestion | ✅ N/A | Billing feature does not involve image uploads |
| IV. Traceability & Auditability | ✅ PASS | SubscriptionEvent table logs all webhook events with stripeEventId |
| V. Deterministic JSON Output | ✅ PASS | Stripe responses are schema-validated; usage API returns typed JSON |
| VI. Cost Controls | ✅ PASS | Weekly scan limits (5 Free), atomic quota enforcement prevents abuse |
| VII. Privacy & User Data Rights | ✅ PASS | Stripe customer/subscription IDs stored; cascade delete via Prisma relations |

**Gate Status**: ✅ PASS - All principles satisfied, proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-saas-billing/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── billing-api.yaml # OpenAPI spec for billing endpoints
│   └── webhook-events.md # Stripe webhook event contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   │   ├── upload-url.ts     # Existing - add quota check
│   │   ├── analyze.ts        # Existing - add quota enforcement
│   │   ├── checkout.ts       # NEW - Stripe checkout session
│   │   ├── billing-portal.ts # NEW - Stripe portal redirect
│   │   ├── webhook.ts        # NEW - Stripe webhook handler
│   │   └── usage.ts          # NEW - Usage stats endpoint
│   ├── services/
│   │   ├── stripeService.ts  # NEW - Stripe API wrapper
│   │   ├── usageService.ts   # NEW - Quota tracking logic
│   │   └── subscriptionService.ts # NEW - Plan management
│   ├── middleware/
│   │   └── quotaMiddleware.ts # NEW - Scan limit enforcement
│   └── models/
│       └── subscription.ts    # NEW - Type definitions
├── prisma/
│   └── schema.prisma         # Extended with User fields + Usage table
└── tests/
    ├── unit/
    │   ├── usageService.test.ts
    │   └── quotaMiddleware.test.ts
    └── integration/
        └── webhook.test.ts

frontend/
├── src/
│   ├── components/
│   │   ├── PricingCard.tsx   # NEW - Plan comparison cards
│   │   ├── UsageCounter.tsx  # NEW - "X scans remaining"
│   │   └── UpgradePrompt.tsx # NEW - Limit reached modal
│   ├── pages/
│   │   ├── PricingPage.tsx   # NEW - /pricing route
│   │   └── SettingsPage.tsx  # Extended with billing section
│   └── services/
│       └── billingApi.ts     # NEW - API client for billing
└── tests/
    └── components/
        └── UsageCounter.test.tsx
```

**Structure Decision**: Web application structure selected. Billing logic added to existing backend/frontend folders. New services follow existing patterns (stripeService alongside blobService, aiService). Database schema extended in single schema.prisma file.

## Complexity Tracking

No constitution violations requiring justification. Feature adds standard SaaS billing patterns without introducing architectural complexity beyond existing structure.
