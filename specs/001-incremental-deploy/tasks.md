# Tasks: Incremental CI Deploy

Feature: Incremental CI Deploy (specs/001-incremental-deploy/spec.md)

## Phase 1 — Setup

- [ ] T001 Configure repo variables: `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_LOCATION` in .github settings
- [ ] T002 Configure repo variables: `AZURE_DNS_RESOURCE_GROUP`, `DNS_ZONE_NAME` (proteinlens.com) in .github settings
- [ ] T003 Add federated credential secret `AZURE_CLIENT_ID` in .github secrets
- [ ] T004 Ensure `POSTGRES_ADMIN_PASSWORD` exists in .github secrets (temporary) for KV seeding
- [ ] T005 Validate OIDC login in `.github/workflows/infra.yml` and `.github/workflows/deploy-*.yml`

## Phase 2 — Foundational

- [X] T006 Add infra idempotency check (what-if) in `.github/workflows/infra.yml`
- [X] T007 Ensure path-based change detection in `.github/workflows/deploy.yml` using `dorny/paths-filter`
- [X] T008 Wire orchestrator inputs/outputs to `infra.yml`, `deploy-api.yml`, `deploy-web.yml`
- [X] T009 Add concurrency group `deploy-${{ github.ref }}` in `.github/workflows/deploy.yml`

## Phase 3 — US1 (P1): Infra-first incremental deploys

- [X] T010 [US1] Ensure infra runs first unconditionally (orchestrator job order) in `.github/workflows/deploy.yml`
- [X] T011 [US1] Backend-only change: run `infra → backend → smoke tests` in `.github/workflows/deploy.yml`
- [X] T012 [US1] Frontend-only change: run `infra → frontend → smoke tests` in `.github/workflows/deploy.yml`
- [X] T013 [US1] Both changed: run `infra → backend & frontend → smoke tests` in `.github/workflows/deploy.yml`
- [X] T014 [US1] Expose infra outputs (`functionapp_name`, `staticwebapp_name`, URLs) via `infra.yml`
- [X] T015 [US1] Use URLs in smoke tests; retry/backoff in `.github/workflows/deploy.yml`

## Phase 4 — US2 (P1): Production domains policy

- [X] T016 [US2] Add DNS gate job to check `proteinlens.com` Azure DNS zone on `main` in `.github/workflows/deploy.yml`
- [X] T017 [US2] Fail-fast with summary guidance if zone missing in `.github/workflows/deploy.yml`
- [X] T018 [US2] Skip DNS gate on non-production branches; use default hostnames
 - [X] T019 [US2] Document required repo variables in `DEPLOYMENT-QUICKSTART.md`

## Phase 5 — US3 (P2): Validations and smoke tests

- [X] T020 [P] [US3] Backend validation: fail if `backend/host.json` missing at deploy root in `.github/workflows/deploy-api.yml`
- [X] T021 [P] [US3] Frontend validation: fail if `frontend/dist/index.html` missing in `.github/workflows/deploy-web.yml`
- [X] T022 [US3] API smoke test with exponential backoff in `.github/workflows/deploy.yml`
- [X] T023 [US3] Web smoke test with exponential backoff and title marker check in `.github/workflows/deploy.yml`
- [X] T024 [US3] Human-readable error messages on validation/smoke failure

## Final Phase — Polish & Cross-Cutting

- [X] T025 Add gate status summary to orchestrator (`dns_gate.ok`) in `.github/workflows/deploy.yml`
- [X] T026 [P] Harden backend verification to use inputs (no secrets) in `.github/workflows/deploy-api.yml`
- [X] T027 [P] Remove legacy workflows `deploy-all.yml`, `infra-unified.yml` from `.github/workflows/`
 - [X] T028 Add docs: idempotency, OIDC, KV supremacy in `DEPLOYMENT-PIPELINE-IMPLEMENTATION.md`

## Parallel Execution Examples

- [P] T026 and T027 can execute in parallel (different files)
- [P] Backend validation (T020) and Frontend validation (T021) can run in parallel

## Implementation Strategy

- MVP: US1 only — infra-first incremental deploy + basic smoke tests
- Incrementally add US2 DNS policy and US3 validations/backoff tests

