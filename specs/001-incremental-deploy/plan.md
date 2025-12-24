# Implementation Plan: Incremental CI Deploy

**Branch**: `001-incremental-deploy` | **Date**: 2025-12-24 | **Spec**: [specs/001-incremental-deploy/spec.md](specs/001-incremental-deploy/spec.md)
**Input**: Feature specification from [specs/001-incremental-deploy/spec.md](specs/001-incremental-deploy/spec.md)

**Note**: Generated via `/speckit.plan` workflow.

## Summary

Deliver infra-first, automatic incremental deployments on main and non-prod branches. Use path-based detection to deploy only backend and/or frontend when their sources change. Enforce production domain policy (Azure DNS zone for `proteinlens.com` required). Validate artifacts (backend `host.json`, frontend `dist/index.html`). Run smoke tests with retry/backoff for API and web endpoints. Ensure OIDC auth, Key Vault supremacy, and IaC idempotency.

## Technical Context

**Language/Version**: Backend: Node.js 20.x (Azure Functions); Frontend: React + Vite + TypeScript  
**Primary Dependencies**: Azure Functions, Azure Static Web Apps, Azure CLI, GitHub Actions, Prisma, Vitest  
**Storage**: PostgreSQL Flexible Server via Prisma (Managed Identity adoption: NEEDS CLARIFICATION for CI migrations)  
**Testing**: Vitest (unit/integration); curl-based smoke tests in CI  
**Target Platform**: Azure (Function App, Static Web Apps, Key Vault, Storage, DNS)  
**Project Type**: Web application (frontend + backend monorepo)  
**Performance Goals**: Match Success Criteria (SC-001..SC-005) — deploy <30 min both, <15 min single component  
**Constraints**: Zero secrets in repo; OIDC-only auth; production custom domains enforced; IaC idempotent  
**Scale/Scope**: Single product web app; two deployable components (backend, frontend)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Principle I (Zero Secrets in Client/Repo): PASS — OIDC auth; no publish profiles or static SWA tokens; secrets in Key Vault.
- Principle II (Least Privilege): PARTIAL — DB connections should use Managed Identity/Entra ID; CI Prisma migrations currently use password secret via KV. Plan to migrate to Entra ID auth for Postgres (tracked).
- Principle X (Key Vault Supremacy): PASS — all sensitive values via Key Vault; GitHub holds only non-sensitive identifiers.
- Principle XI (Zero-Downtime Key Rotation): NEEDS CLARIFICATION — rotation runbooks and dual-key strategy not yet automated in CI.
- Principle XII (IaC Idempotency): PASS — infra deploy is safe re-run; add what-if/redeploy verification step in infra workflow.
- Principle IX (On-Demand Resource Lifecycle): NEEDS CLARIFICATION — explicit teardown automation (foundry-down) exists; ensure recursive cleanup and idempotent deletion verified.

Gate Result: PROCEED with noted follow-ups; no blocking violations for deploy pipeline feature.

Post-Design Re-check:
- Principles I, X, XII: CONFIRMED in design and workflows.
- Principle II: Still PARTIAL pending Postgres Entra ID/MI adoption for CI migrations.
- Principles IX, XI: Marked NEEDS CLARIFICATION; to be addressed with teardown verification and rotation runbooks.

## Project Structure

### Documentation (this feature)

```text
specs/001-incremental-deploy/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── checklists/
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── functions/
│   ├── services/
│   ├── models/
│   └── utils/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
└── tests/

infra/
└── bicep/

.github/workflows/
├── infra.yml
├── deploy-api.yml
├── deploy-web.yml
└── deploy.yml (orchestrator)
```

**Structure Decision**: Web application with separate `backend/` and `frontend/` projects; reusable CI workflows orchestrated via `.github/workflows/deploy.yml`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| DB password for CI migrations | Transitional until Entra ID/MI for Postgres configured | Managed Identity for Postgres Flexible Server not yet enabled; blocking migrations |
