---

description: "Executable task list for CI/CD deploy feature"
---

# Tasks: Main Branch Azure CI Deploy

**Input**: Design documents from `/specs/001-ci-azure-deploy/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Only smoke tests (as specified). No separate unit/integration tests requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- [P]: Can run in parallel (different files, no dependencies)
- [Story]: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare workspace for workflow and infra changes

- [ ] T001 Ensure workflow directory exists in .github/workflows/
- [ ] T002 Validate Bicep tooling availability noted in docs/QUICKSTART.md (no changes required)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infra guardrails and idempotency before any pipeline work

- [ ] T003 Update storageAccountName generation to use `take()` instead of `substring()` in infra/bicep/main.bicep
- [ ] T004 Add `dnsZoneExists` detection parameter/output and logic in infra/bicep/main.bicep
- [ ] T005 Add fail-fast output/message for prod when `dnsZoneExists=false` in infra/bicep/main.bicep
- [ ] T006 Guard module outputs to avoid BCP318 by referencing outputs only when module is deployed in infra/bicep/main.bicep
- [ ] T007 Constrain deployment location to allowed region(s) (e.g., `northeurope`) via parameter validation in infra/bicep/main.bicep

**Checkpoint**: Foundation ready — pipeline implementation can proceed

---

## Phase 3: User Story 1 - Auto-provision and deploy on main commit (Priority: P1) 🎯 MVP

**Goal**: Commit to `main` triggers infra → backend → frontend → smoke tests

**Independent Test**: Push a trivial commit to `main`; verify the run executes in order and only succeeds if all steps pass

### Implementation for User Story 1

- [ ] T008 [US1] Create workflow skeleton .github/workflows/deploy.yml (name, on: push main)
- [ ] T009 [US1] Add `infra` job: azure/login OIDC and `az deployment group create` for infra/bicep/main.bicep
- [ ] T010 [US1] Add `deploy_backend` job with `needs: infra`
- [ ] T011 [US1] Add `deploy_frontend` job with `needs: infra`
- [ ] T012 [US1] Add `smoke_test` job with `needs: [deploy_backend, deploy_frontend]`

**Checkpoint**: US1 workflow structure executes jobs in required order

---

## Phase 4: User Story 2 - Production custom domains and DNS policies (Priority: P1)

**Goal**: In prod, require Azure DNS zone and custom domains; in non-prod, skip domains and continue

**Independent Test**: Run once with prod (main) and once as non-prod; prod fails fast without zone, non-prod skips domain binding

### Implementation for User Story 2

- [ ] T013 [US2] In infra/bicep/main.bicep, surface `dnsZoneExists` and `isProd` outputs/params to drive domain logic
- [ ] T014 [US2] In .github/workflows/deploy.yml `infra` job, add CLI check to fail fast if `github.ref==main` and Azure DNS zone `proteinlens.com` not found
- [ ] T015 [US2] In .github/workflows/deploy.yml, ensure downstream jobs continue for non-prod using default Azure hostnames (no domain binding)
- [ ] T016 [US2] Document behavior in specs/001-ci-azure-deploy/quickstart.md (prod vs non-prod domain policy)

**Checkpoint**: US2 policy behavior verifiable via pipeline logs and outcomes

---

## Phase 5: User Story 3 - Validations and smoke tests with retry (Priority: P2)

**Goal**: Preflight validations and robust smoke tests

**Independent Test**: Remove backend `host.json` or frontend `dist/index.html` to see preflight fail; normal run passes with retries

### Implementation for User Story 3

- [ ] T017 [US3] Add backend preflight in .github/workflows/deploy.yml: verify `host.json` exists at zip root before deployment
- [ ] T018 [US3] Use Azure/functions-action (or az CLI) to deploy backend after preflight in .github/workflows/deploy.yml
- [ ] T019 [US3] Add frontend preflight in .github/workflows/deploy.yml: verify `frontend/dist/index.html` exists before SWA deploy
- [ ] T020 [US3] Fetch SWA deploy token via `az staticwebapp secrets list` in .github/workflows/deploy.yml
- [ ] T021 [US3] Implement smoke tests with retry/backoff: API GET https://api.proteinlens.com/api/health expecting 200
- [ ] T022 [US3] Implement smoke tests with retry/backoff: WEB GET https://www.proteinlens.com/ expecting 200 and `<title>ProteinLens</title>`

**Checkpoint**: US3 safeguards prevent bad artifacts; smoke tests prove endpoint health

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Tighten guardrails, docs, and observability

- [ ] T023 [P] Update docs/DEPLOYMENT-QUICKSTART.md with new workflow description
- [ ] T024 [P] Add optional `az deployment group what-if` before apply in .github/workflows/deploy.yml
- [ ] T025 Emit clearer error messages for each preflight/smoke failure case in .github/workflows/deploy.yml

---

## Dependencies & Execution Order

### Phase Dependencies
- Setup → Foundational → US1 → US2 → US3 → Polish
- User stories can proceed in priority order; US1 is MVP

### User Story Dependencies
- US1: None (after Foundational)
- US2: Depends on infra/bicep outputs and policy logic; independent of US3
- US3: Depends on workflow presence (US1); independent of US2 domain policy

### Within Each User Story
- US1: Define workflow and job order
- US2: Add prod/non-prod domain policy gates
- US3: Add preflights, token retrieval, and smoke tests

---

## Parallel Execution Examples

- [P] Examples (safe to parallelize when different files):
  - T023 docs/DEPLOYMENT-QUICKSTART.md while T024 what-if step in .github/workflows/deploy.yml

- Serial examples (same file edits):
  - T008..T012, T014..T022 all modify .github/workflows/deploy.yml and should be sequential
  - T003..T007 modify infra/bicep/main.bicep and should be sequential

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1–2
2. Implement T008–T012 (US1) and validate run ordering
3. STOP and VALIDATE: Workflow runs end-to-end without domain/prefight checks

### Incremental Delivery
1. Add US2 policy gates; validate prod vs non-prod behavior
2. Add US3 preflights and smoke tests; validate failure/success paths
3. Polish with docs and optional what-if
