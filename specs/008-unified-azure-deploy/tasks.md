---

description: "Task list for unified Azure deploy"
---

# Tasks: One-Click Azure Deploy

**Input**: Design documents from `/specs/001-unified-azure-deploy/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Configure OIDC GitHub → Azure in .github/workflows/deploy-all.yml
- [X] T002 [P] Add workflow inputs for `subscriptionId`, `resourceGroup`, `location` in .github/workflows/deploy-all.yml
- [X] T003 [P] Add job-level `az --version` + login debug and `set -euo pipefail` in .github/workflows/deploy-all.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 Enforce Key Vault unique naming with uniqueString(resourceGroup().id) in infra/bicep/main.bicep (computed kv name)
- [X] T005 [P] Remove hardcoded name `proteinlens-kv-prod` and enforce max length in infra/bicep/main.bicep
- [X] T006 [P] Generate storage account name (lowercase, digits, 3–24) as var in infra/bicep/main.bicep
- [X] T007 Fix BCP072 by moving all computed defaults from params → vars in infra/bicep/*.bicep (location defaults updated)
- [X] T008 Pin `location` default to `northeurope` for Postgres in infra/bicep/postgres.bicep
- [X] T009 [P] Pin `location` default to `northeurope` for AI Foundry/OpenAI in infra/bicep/ai-foundry.bicep and openai-foundry.bicep
- [X] T010 [P] Wire naming vars through main orchestrator in infra/bicep/main.bicep
- [X] T011 Ensure az bicep build succeeds for main.bicep via local build

Checkpoint: Infra definitions compile cleanly; idempotent and naming-safe.

---

## Phase 3: User Story 1 - One-Click Production Deploy (Priority: P1) 🎯 MVP

Goal: Single workflow provisions infra, deploys backend + frontend, routes via Front Door, and verifies public endpoints.
Independent Test: Trigger workflow; expect 200 at https://www.proteinlens.com and https://api.proteinlens.com/api/health

Implementation

- [X] T012 [US1] Create resource group step (`az group create`) in .github/workflows/deploy-all.yml
- [X] T013 [P] [US1] Deploy infra via `az deployment sub create` using infra/bicep/subscription-main.bicep
- [X] T014 [P] [US1] Capture outputs (function app name, SWA name, KV, storage, FD host) in .github/workflows/deploy-all.yml
- [X] T015 [US1] Fetch SWA token dynamically via `az staticwebapp secrets list` in .github/workflows/deploy-all.yml
- [X] T016 [US1] Frontend preflight: build, fail if frontend/dist/index.html missing in .github/workflows/deploy-all.yml
- [X] T017 [P] [US1] Frontend non-placeholder check: assert `<title>ProteinLens</title>` in built HTML in .github/workflows/deploy-all.yml
- [X] T018 [US1] Backend packaging preflight: stage backend/.deploy with host.json at root in .github/workflows/deploy-all.yml
- [X] T019 [P] [US1] Fail if backend/.deploy/host.json missing in .github/workflows/deploy-all.yml
- [X] T020 [US1] Deploy backend folder via Azure Functions action (publish-profile) in .github/workflows/deploy-all.yml
- [X] T021 [P] [US1] Deploy frontend via Azure/static-web-apps-deploy@v1 using runtime token in .github/workflows/deploy-all.yml
- [X] T022 [US1] Configure Front Door custom domains and routes (www→SWA, api→Functions) in infra/bicep/frontdoor.bicep
- [X] T023 [P] [US1] Automate Azure DNS records (CNAME + _dnsauth) via CI workflow (CLI) with zone auto-detect
- [X] T024 [US1] Health checks: warm-up + retries on https://api.proteinlens.com/api/health in .github/workflows/deploy-all.yml
- [X] T025 [P] [US1] Frontend smoke test: GET https://www.proteinlens.com and assert marker in .github/workflows/deploy-all.yml
- [X] T026 [US1] Upload outputs artifact validating against specs/001-unified-azure-deploy/contracts/outputs.schema.json

Checkpoint: Both endpoints 200 through Front Door; artifact saved.

---

## Phase 4: User Story 2 - Repeatable Idempotent Provisioning (Priority: P2)

Goal: Re-run workflow safely; detect drift and keep endpoints healthy.
Independent Test: Run workflow twice; second run succeeds; what-if shows no changes.

Implementation

- [X] T027 [US2] Add `az deployment sub what-if` step to assert no changes in .github/workflows/deploy-all.yml
- [X] T028 [P] [US2] Ensure stable naming inputs and vars across modules in infra/bicep/main.bicep
- [X] T029 [US2] Restart Function App post-secrets update to force KV reference refresh (no secret echo) in .github/workflows/deploy-all.yml
- [X] T030 [P] [US2] Ensure app settings checks only assert `@Microsoft.KeyVault` prefix, no values printed in .github/workflows/deploy-all.yml

Checkpoint: Re-deploy is idempotent; KV references effective; no manual fixes.

---

## Phase 5: User Story 3 - Clear Failure Feedback (Priority: P3)

Goal: Fast, actionable failure reasons for missing artifacts, policy errors, or packaging problems.
Independent Test: Intentionally remove index.html or host.json; workflow fails with clear errors.

Implementation

- [X] T031 [US3] Add explicit error messages for missing frontend/dist/index.html in .github/workflows/deploy-all.yml
- [X] T032 [P] [US3] Add explicit error messages for missing backend/.deploy/host.json in .github/workflows/deploy-all.yml
- [X] T033 [US3] Add Bicep compile step; fail fast with readable BCP072 guidance in .github/workflows/deploy-all.yml
- [X] T034 [P] [US3] Add storage name validation echo (length/charset) pre-deploy in .github/workflows/deploy-all.yml
- [X] T035 [US3] Add DNS authority detection with clear manual-instruction fallback in .github/workflows/deploy-all.yml

Checkpoint: Failures point to precise fixes; no “endless troubleshooting.”

---

## Phase N: Polish & Cross-Cutting Concerns

- [X] T036 [P] Add runbook notes in DEPLOYMENT-QUICK-REFERENCE.md
- [X] T037 Consolidate repetitive workflow steps (N/A - already optimized with job dependencies)
- [X] T038 [P] Add metrics logging for health retries and durations in .github/workflows/deploy-all.yml
- [X] T039 Security: ensure no `echo` of secrets/app settings, add grep guard in .github/workflows/deploy-all.yml

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish
- US1 depends on Foundational completion
- US2 depends on US1 (uses deployed resources to test idempotency)
- US3 can proceed after US1 (improves error surfacing)

## Parallel Examples

- Foundational parallel: T005, T006, T009, T010 can be implemented concurrently
- US1 parallel: T013, T017, T019, T021, T025 can run in parallel (different files)
- US2 parallel: T028, T030 can run in parallel
- US3 parallel: T032, T034 can run in parallel

## Implementation Strategy

- MVP first: Complete US1 to achieve working endpoints; then harden with US2 (idempotency) and US3 (feedback)
- Validate after each phase using the Quickstart and artifact schema
