# Implementation Plan: Admin Dashboard

**Branch**: `012-admin-dashboard` | **Date**: 2024-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-admin-dashboard/spec.md`

## Summary

Build a separate admin dashboard (admin.proteinlens.com) for platform administrators to manage users, view platform analytics, and perform administrative actions. The dashboard will include user listing/search, user detail views with subscription info, plan override capabilities, account suspension/reactivation, and a searchable audit log. Admin access is controlled via ADMIN_EMAILS environment variable. The admin frontend shares the same backend API but is deployed as a separate Static Web App.

## Technical Context

**Language/Version**: TypeScript 5.x (Node 20+ for backend, React 18 for frontend)  
**Primary Dependencies**: 
- Backend: Azure Functions 4.x, Prisma 5.x, Zod, jose (JWT)
- Frontend: React 18, TanStack Query 5, React Router 7, Tailwind CSS, shadcn/ui
**Storage**: PostgreSQL (via Prisma), Azure Blob Storage (existing)  
**Testing**: Vitest (unit/integration), Playwright (e2e)  
**Target Platform**: Azure Static Web Apps (admin subdomain) + Azure Functions  
**Project Type**: web (frontend + backend)  
**Performance Goals**: User list loads <3s for 10k users, user details <2s, search <10s  
**Constraints**: Separate subdomain deployment, email allowlist auth, audit log append-only  
**Scale/Scope**: 1-10 admins, managing up to 10k users initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Secrets in Client | ✅ PASS | Admin emails in env var, no secrets in frontend |
| II. Least Privilege Access | ✅ PASS | Admin middleware checks allowlist, no elevated DB access |
| IV. Traceability & Auditability | ✅ PASS | All admin actions logged with request ID, admin identity, timestamp |
| VIII. Privacy & User Data Rights | ✅ PASS | No new PII collection, audit log is append-only |
| X. Secrets Management | ✅ PASS | ADMIN_EMAILS in env config, no new secrets needed |
| XII. IaC Idempotency | ✅ PASS | New SWA for admin uses same Bicep patterns |
| XIII. Mobile-First Design | ⚠️ NOTE | Admin dashboard is desktop-first (tablet minimum), acceptable for admin tooling |
| XIV. Fast Perceived Performance | ✅ PASS | Skeleton screens, pagination, server-side filtering |
| XVI. Accessibility Baseline | ✅ PASS | Using shadcn/ui with ARIA, keyboard nav |
| XVII. Design System Consistency | ✅ PASS | shadcn/ui + Tailwind, same as main app |

**Gate Result**: ✅ PASS - All critical principles satisfied. Mobile-first deviation justified for admin tooling (desktop/tablet use case).

## Project Structure

### Documentation (this feature)

```text
specs/012-admin-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   │   ├── admin-user.ts          # Existing - GET user details
│   │   ├── admin-users.ts         # NEW - GET users list with pagination
│   │   ├── admin-metrics.ts       # NEW - GET platform metrics
│   │   ├── admin-plan-override.ts # NEW - PUT user plan override
│   │   ├── admin-suspend.ts       # NEW - POST suspend/reactivate user
│   │   └── admin-audit-log.ts     # NEW - GET audit log with filters
│   ├── middleware/
│   │   └── adminMiddleware.ts     # Existing - enhance with audit logging
│   ├── models/
│   │   └── AdminAuditLog.ts       # NEW - audit log entity
│   └── services/
│       └── adminService.ts        # NEW - admin business logic
├── prisma/
│   └── schema.prisma              # Add AdminAuditLog model, User.suspended field
└── tests/
    ├── unit/admin/
    └── integration/admin/

admin/                             # NEW - Admin frontend (separate SWA)
├── src/
│   ├── components/
│   │   ├── AdminLayout.tsx
│   │   ├── UserTable.tsx
│   │   ├── UserDetailPanel.tsx
│   │   ├── MetricsCards.tsx
│   │   ├── AuditLogTable.tsx
│   │   └── ui/                    # Shared shadcn/ui components
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── UserDetailPage.tsx
│   │   └── AuditLogPage.tsx
│   ├── hooks/
│   │   ├── useAdminUsers.ts
│   │   ├── useUserDetail.ts
│   │   ├── useMetrics.ts
│   │   └── useAuditLog.ts
│   └── services/
│       └── adminApi.ts
├── tests/
├── package.json
├── vite.config.ts
└── staticwebapp.config.json

infra/bicep/
├── admin-swa.bicep                # NEW - Admin Static Web App module
└── main.bicep                     # Update to include admin SWA
```

**Structure Decision**: New `admin/` directory at repo root for admin frontend (same pattern as `frontend/`). Backend endpoints added to existing `backend/src/functions/`. Infrastructure adds new SWA module.

## Complexity Tracking

> No constitution violations requiring justification.

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion*

| Principle | Status | Design Evidence |
|-----------|--------|-----------------|
| I. Zero Secrets in Client | ✅ PASS | API contract shows auth via headers, no secrets in frontend code |
| II. Least Privilege Access | ✅ PASS | Admin middleware validates JWT + allowlist before any operation |
| IV. Traceability & Auditability | ✅ PASS | AdminAuditLog model captures all actions with requestId, adminEmail, timestamp |
| VIII. Privacy & User Data Rights | ✅ PASS | Audit log is append-only (no UPDATE/DELETE endpoints in API contract) |
| X. Secrets Management | ✅ PASS | ADMIN_EMAILS loaded from env at runtime, cached in middleware |
| XII. IaC Idempotency | ✅ PASS | admin-swa.bicep follows same patterns as existing SWA module |
| XIV. Fast Perceived Performance | ✅ PASS | Server-side pagination (50 per page), cursor-based queries |
| XVI. Accessibility Baseline | ✅ PASS | shadcn/ui DataTable with keyboard nav, ARIA labels |
| XVII. Design System Consistency | ✅ PASS | Same component library and Tailwind tokens as main app |

**Post-Design Gate Result**: ✅ PASS - All principles verified against design artifacts.

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Implementation Plan | [plan.md](./plan.md) | ✅ Complete |
| Research | [research.md](./research.md) | ✅ Complete |
| Data Model | [data-model.md](./data-model.md) | ✅ Complete |
| API Contracts | [contracts/admin-api.yaml](./contracts/admin-api.yaml) | ✅ Complete |
| Quickstart | [quickstart.md](./quickstart.md) | ✅ Complete |
| Tasks | tasks.md | ⏳ Pending (`/speckit.tasks`) |
