# Implementation Plan: User Authentication

**Branch**: `009-user-auth` | **Date**: 2025-12-25 | **Spec**: [specs/009-user-auth/spec.md](specs/009-user-auth/spec.md)
**Input**: Feature specification from `/specs/009-user-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

- Primary requirement: Sign up/in/out, password reset, email verification, session persistence, protected routes.
- Technical approach: Use Azure Entra External ID (B2C) hosted user flows for email/password auth and email verification/reset; frontend uses MSAL with PKCE; backend validates JWTs on protected endpoints and maps `externalId` to local `User` row. Sessions controlled by token lifetime + refresh policies that meet 30m inactivity and 7-day absolute lifetime. No SSO providers at launch.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x; Node.js >= 20 (Azure Functions v4); React 18
**Primary Dependencies**: Azure Entra External ID (B2C), MSAL, Azure Functions, Prisma, Zod, Application Insights, React Router
**Storage**: PostgreSQL (Prisma) for local user mapping and audit logs
**Testing**: Vitest (backend/unit/integration), Playwright (frontend e2e)
**Target Platform**: Azure Functions API; SPA frontend
**Project Type**: Web (frontend + backend monorepo)
**Performance Goals**: Auth UX < 2 minutes for signup; route guard checks < 10ms client-side
**Constraints**: Zero secrets in client; Least Privilege; Mobile-first; Accessibility AA
**Scale/Scope**: Initial 10k MAU; JWT validation P95 < 20ms

## Constitution Check

Gate evaluation (pre-research):

- I. Zero Secrets: PASS (client uses MSAL; secrets stored in Key Vault/App Settings)
- II. Least Privilege: PASS (backend validates tokens; uses Managed Identity for resources)
- III. Blob-First: N/A for auth (no blobs)
- IV. Traceability: PASS (log auth events with request/user IDs in App Insights)
- V. Deterministic JSON: PASS (consistent response schemas)
- VI. Cost Controls: PASS (no heavy compute)
- VII. Intelligent Analysis Infra: N/A for auth
- VIII. Privacy & User Data Rights: PASS (erase account flows supported via provider + local cascade)
- IX–XII Infra Lifecycle/Secrets/Rotation/IaC: PASS (no new infra; provider configuration via IaC in future)
- XIII–XIX UX: PASS (mobile-first, fast, accessible; no blocking spinners)

Gate status: PASS

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── functions/
│   │   ├── me/                 # GET /me (validate token, return profile)
│   │   └── auth/               # (optional) callback/introspection if needed
│   ├── middleware/
│   │   └── authGuard.ts        # JWT validation, route protection
│   ├── services/
│   │   ├── authService.ts      # token validation, mapping externalId → User
│   │   └── auditService.ts     # security event logging
│   └── utils/
└── tests/
  ├── unit/
  └── integration/

frontend/
├── src/
│   ├── pages/
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   └── ResetPassword.tsx
│   ├── components/
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthProvider.tsx    # MSAL wrapper, session policy
│   └── services/
│       └── api.ts
└── tests/
  └── e2e/
```

**Structure Decision**: Web application (frontend + backend). Add minimal endpoints and guards; rely on Entra user flows for signup/signin/reset/verification.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Public callback endpoint | Required only if backend participates in code exchange | SPA + MSAL handles PKCE flows; backend-only validation preferred |
