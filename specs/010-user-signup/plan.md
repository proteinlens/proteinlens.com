# Implementation Plan: User Signup Process

**Branch**: `010-user-signup` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-user-signup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a comprehensive user signup process with email/password and social login (Google, Microsoft) via Azure Entra External ID (B2C). The signup form collects first name, last name, email, password with real-time validation, password strength indicator, and breach checking. B2C handles credential storage and email verification; local database stores user profile data and consent records. Frontend uses MSAL React for authentication flows; backend validates JWTs and creates/updates local User records.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js >= 20 (Azure Functions v4); React 18  
**Primary Dependencies**: Azure Entra External ID (B2C), @azure/msal-browser, Azure Functions, Prisma, Zod, React Router, TailwindCSS, shadcn/ui  
**Storage**: PostgreSQL (via Prisma) for user profiles and consent records; B2C for credentials  
**Testing**: Vitest (unit + integration), Playwright (e2e), React Testing Library  
**Target Platform**: Web (SPA + Azure Functions backend)
**Project Type**: web (frontend + backend monorepo)  
**Performance Goals**: Form validation <100ms response; signup completion <3 minutes  
**Constraints**: WCAG 2.1 AA compliance; <300ms FCP; mobile-first (375px primary)  
**Scale/Scope**: 10k+ users; 8 user stories; 37 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Secrets in Client | ✅ PASS | MSAL handles auth; no secrets in frontend; B2C config via env vars |
| II. Least Privilege Access | ✅ PASS | B2C handles credentials; local DB has no passwords |
| VIII. Privacy & User Data Rights | ✅ PASS | Consent records stored with timestamps; delete cascade supported |
| X. Secrets Management | ✅ PASS | MSAL client ID not a secret; B2C policies in Azure Portal |
| XIII. Mobile-First Design | ✅ PASS | 375px primary target; thumb-reachable touch targets (44x44px) |
| XIV. Fast Perceived Performance | ✅ PASS | Real-time validation; skeleton screens for loading |
| XVI. Accessibility Baseline | ✅ PASS | WCAG 2.1 AA; keyboard nav; ARIA labels; 4.5:1 contrast |
| XVII. Design System Consistency | ✅ PASS | shadcn/ui components; Tailwind tokens |

**Pre-Phase 0 Result**: ✅ PASS

### Post-Phase 1 Check (After Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Secrets in Client | ✅ PASS | hCaptcha site key (public); MSAL client ID (public); no secrets |
| II. Least Privilege Access | ✅ PASS | API uses JWT validation; User table has no passwords; B2C stores credentials |
| III. Blob-First Ingestion | ⬜ N/A | No blob uploads in signup feature |
| IV. Traceability & Auditability | ✅ PASS | SignupAttempt audit table; ConsentRecord with timestamps/IP |
| V. Deterministic JSON Output | ✅ PASS | Zod schemas validate all API responses |
| VI. Cost Controls | ✅ PASS | Rate limiting on signup attempts; hCaptcha prevents bot abuse |
| VII. Intelligent Analysis | ⬜ N/A | No AI analysis in signup feature |
| VIII. Privacy & User Data Rights | ✅ PASS | ConsentRecord tracks acceptance; cascade delete; no unnecessary PII |
| IX. On-Demand Resource Lifecycle | ⬜ N/A | No infrastructure resources created |
| X. Secrets Management | ✅ PASS | hCaptcha secret in backend env; not in client or repo |
| XI. Zero-Downtime Key Rotation | ⬜ N/A | No cryptographic keys managed by this feature |
| XII. Infrastructure Idempotency | ⬜ N/A | No infrastructure changes |
| XIII. Mobile-First Design | ✅ PASS | SignupForm designed for 375px; thumb zones respected |
| XIV. Fast Perceived Performance | ✅ PASS | 300ms debounce; real-time validation; no blocking spinners |
| XV. Delight Without Friction | ✅ PASS | Micro-animations on validation; toast notifications auto-dismiss |
| XVI. Accessibility Baseline | ✅ PASS | ARIA labels on all inputs; keyboard navigation; 4.5:1 contrast |
| XVII. Design System Consistency | ✅ PASS | All components use shadcn/ui; Tailwind tokens only |
| XVIII. Trust UI | ⬜ N/A | No AI analysis in signup |
| XIX. Action-First Screens | ✅ PASS | Primary CTA "Create Account" prominent; social buttons visible |

**Post-Phase 1 Result**: ✅ PASS - All applicable principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/010-user-signup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   │   └── signup.ts           # NEW: Signup endpoint (profile creation)
│   ├── services/
│   │   ├── authService.ts      # EXTEND: Add signup profile creation
│   │   └── consentService.ts   # NEW: Consent record management
│   ├── models/
│   │   └── signupSchema.ts     # NEW: Zod validation schemas
│   └── utils/
│       └── passwordValidator.ts # NEW: Breach checking utility
└── tests/
    ├── unit/
    │   └── signupValidation.test.ts
    └── integration/
        └── signupFlow.test.ts

frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx        # NEW: Main signup form
│   │   │   ├── PasswordStrength.tsx  # NEW: Password strength indicator
│   │   │   ├── SocialLoginButtons.tsx # NEW: Google/MS buttons
│   │   │   └── ConsentCheckboxes.tsx # NEW: ToS/Privacy checkboxes
│   │   └── ui/                       # EXISTING: shadcn/ui primitives
│   ├── pages/
│   │   ├── SignupPage.tsx            # NEW: Signup page
│   │   └── VerifyEmailPage.tsx       # NEW: Email verification landing
│   ├── hooks/
│   │   ├── useSignupForm.ts          # NEW: Form state + validation
│   │   └── usePasswordValidation.ts  # NEW: Real-time password checks
│   └── services/
│       └── signupService.ts          # NEW: API calls for signup
└── tests/
    ├── components/
    │   └── SignupForm.test.tsx
    └── e2e/
        └── signup.spec.ts
```

**Structure Decision**: Web application (frontend + backend) following existing monorepo structure. New files integrate with existing auth infrastructure from 009-user-auth.

## Complexity Tracking

> No constitution violations requiring justification. All implementations follow existing patterns.
