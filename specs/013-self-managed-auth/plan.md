# Implementation Plan: Self-Managed Authentication

**Branch**: `013-self-managed-auth` | **Date**: 27 December 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/013-self-managed-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement self-managed user authentication using PostgreSQL for credential storage. Core features include email/password signup/signin with email verification, JWT access tokens (15m) with refresh tokens (7d), password reset flow, and audit logging. Uses bcrypt for password hashing, Azure Communication Services for transactional emails. OAuth (Google/Microsoft) is deferred to a future iteration. Substantial implementation exists in branch `010-user-signup` and will be merged/cherry-picked with gaps filled.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20.x runtime)
**Primary Dependencies**: Azure Functions v4, Prisma ORM, jose (JWT), bcrypt, zod (validation), @azure/communication-email
**Storage**: PostgreSQL (Azure Database for PostgreSQL Flexible Server), existing Prisma schema
**Testing**: vitest (89 existing tests: jwt: 31, password: 30, auth: 28)
**Target Platform**: Azure Functions (backend), React SPA (frontend)
**Project Type**: web (frontend + backend + admin)
**Performance Goals**: Sign in < 5 seconds (P95), 100 concurrent auth requests
**Constraints**: HttpOnly cookies for refresh tokens, memory-only access tokens (XSS protection)
**Scale/Scope**: Single-tenant SaaS, standard auth flow complexity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Secrets in Client/Repo | ✅ PASS | JWT_SECRET in Key Vault/App Settings; no secrets in frontend |
| II. Least Privilege Access | ✅ PASS | Database via Managed Identity; auth endpoints scoped to user data only |
| X. Secrets Management & Key Vault | ✅ PASS | JWT_SECRET, ACS connection string stored in Key Vault |
| XI. Zero-Downtime Key Rotation | ✅ PASS | Dual-key strategy designed in research.md (JWT_SECRET + JWT_SECRET_PREVIOUS) |
| XII. IaC Idempotency | ✅ N/A | No new infrastructure resources in this feature |
| XIII. Mobile-First Design | ✅ PASS | Auth UI uses existing mobile-first patterns (shadcn/ui) |
| XIV. Fast Perceived Performance | ✅ PASS | Skeleton screens during auth flows; < 5s sign in target |
| XVI. Accessibility Baseline | ✅ PASS | Form inputs with labels, keyboard navigation, WCAG AA contrast |
| XVII. Design System Consistency | ✅ PASS | shadcn/ui components, Tailwind utility classes |
| Security Standards (Authentication) | ⚠️ DEVIATION | Using self-managed auth instead of Azure Entra ID - **JUSTIFIED**: User explicitly requested self-managed solution without external identity providers |

**Gate Status**: ✅ PASS (1 deviation justified, all items resolved)

### Post-Design Re-evaluation (Phase 1 Complete)

| Item | Before | After | Resolution |
|------|--------|-------|------------|
| XI. JWT Rotation | ⚠️ Needs research | ✅ PASS | Dual-key fallback strategy documented in research.md |
| Data Model | - | ✅ PASS | AuthEvent table added for FR-031 audit logging |
| API Contracts | - | ✅ PASS | 11 endpoints documented in auth-api.yaml |
| Email Integration | - | ✅ PASS | ACS Email patterns documented |

## Project Structure

### Documentation (this feature)

```text
specs/013-self-managed-auth/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── auth-api.yaml    # OpenAPI spec for auth endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   │   └── auth.ts          # Auth endpoints (signup, signin, refresh, logout, verify, reset)
│   ├── utils/
│   │   ├── jwt.ts           # JWT token generation/verification
│   │   ├── password.ts      # bcrypt hashing, HIBP check, validation
│   │   └── email.ts         # ACS email service (NEW)
│   └── middleware/
│       └── auth.ts          # Auth middleware for protected routes
├── prisma/
│   └── schema.prisma        # User, RefreshToken, PasswordResetToken models
└── tests/
    └── unit/
        ├── jwt.test.ts      # 31 tests (existing)
        ├── password.test.ts # 30 tests (existing)
        └── auth.test.ts     # 28 tests (existing)

frontend/
├── src/
│   ├── pages/
│   │   ├── SignIn.tsx       # Sign in page
│   │   ├── SignUp.tsx       # Sign up page
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
│   ├── components/
│   │   └── auth/
│   │       ├── AuthForm.tsx
│   │       └── PasswordInput.tsx
│   ├── hooks/
│   │   └── useAuth.ts       # Auth context and token management
│   └── services/
│       └── authService.ts   # API calls to auth endpoints
└── tests/
    └── auth.test.tsx
```

**Structure Decision**: Web application structure with existing backend/frontend/admin layout. Auth functionality spans backend (API + business logic) and frontend (UI + token management).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Self-managed auth vs Azure Entra ID | User explicitly requested: "I want fully managed solution leveraging my database (postgresql). I don't want to use Microsoft Entra External ID, Azure AD B2C or Clerk" | Azure Entra ID/B2C would meet constitution but violates user requirements |

---

## Phase 0: Research

### Research Tasks

Based on Technical Context gaps and dependencies:

1. **JWT_SECRET rotation strategy** - How to implement dual-key rotation for JWT secrets without service interruption
2. **Azure Communication Services Email** - Best practices for transactional emails (verification, password reset)
3. **HttpOnly cookie + memory token pattern** - Secure implementation for refresh token flow
4. **Existing 010-user-signup code review** - Identify gaps vs spec requirements

### Consolidated Research

*See [research.md](research.md) for detailed findings*
