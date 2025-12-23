---
description: "Task list for OpenAI Foundry Automation feature implementation"
---

# Tasks: OpenAI Foundry Automation

**Input**: Design documents from `/specs/005-openai-foundry-automation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No explicit test tasks generated (not requested in spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`, `infra/bicep/`, `.github/workflows/`
- Paths shown assume web app mono-repo structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Bicep module scaffolding

- [ ] T001 Create infra/bicep/openai-foundry.bicep for OpenAI account and model deployment resources
- [ ] T002 [P] Add infra/bicep/keyvault-foundry.bicep for Key Vault secret and role assignment (if Key Vault module doesn't exist)
- [ ] T003 [P] Add Bicep outputs: OpenAI endpoint, resource name, deployment name, Key Vault secret URI to infra/bicep/openai-foundry.bicep

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core automation scripts and GitHub Actions workflow structure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create scripts/foundry-up.sh to orchestrate Bicep deployment and secret provisioning
- [ ] T005 Create scripts/foundry-down.sh to orchestrate resource deletion and cleanup
- [ ] T006 Create scripts/foundry-rotate-key.sh to orchestrate key regeneration and secret update
- [ ] T007 Create .github/workflows/foundry-on-demand.yml with workflow_dispatch inputs (action, env, region, model)
- [ ] T008 Add helper function to scripts/foundry-up.sh to detect active vs inactive key slots without logging keys
- [ ] T009 Add secret scanning guardrails: create .github/workflows/secret-scan.yml to block raw key commits

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - One-command Provision (Priority: P1) 🎯 MVP

**Goal**: Provision OpenAI resource, model deployment, Key Vault secret, and Function App Key Vault reference with a single `action=up` workflow run

**Independent Test**: Run workflow with action=up, env=dev; verify resource exists, model deployed, secret created, Function App setting is Key Vault reference

### Implementation for User Story 1

- [ ] T010 [US1] Implement Microsoft.CognitiveServices/accounts resource in infra/bicep/openai-foundry.bicep with env-scoped naming
- [ ] T011 [US1] Implement Microsoft.CognitiveServices/accounts/deployments for gpt-5-1 model in infra/bicep/openai-foundry.bicep
- [ ] T012 [P] [US1] Implement Key Vault secret creation for AZURE_OPENAI_API_KEY--{env} in infra/bicep/keyvault-foundry.bicep
- [ ] T013 [P] [US1] Implement Managed Identity role assignment (Key Vault Secrets User) in infra/bicep/keyvault-foundry.bicep
- [ ] T014 [US1] Implement Bicep deployment logic in scripts/foundry-up.sh using az deployment group create with --what-if check
- [ ] T015 [US1] Add logic to scripts/foundry-up.sh to read OpenAI API key via az cognitiveservices account keys list (without logging)
- [ ] T016 [US1] Add logic to scripts/foundry-up.sh to write key to Key Vault secret using az keyvault secret set (silent mode)
- [ ] T017 [US1] Add logic to scripts/foundry-up.sh to update Function App setting AZURE_OPENAI_API_KEY to Key Vault reference format
- [ ] T018 [US1] Implement workflow job for action=up in .github/workflows/foundry-on-demand.yml calling scripts/foundry-up.sh
- [ ] T019 [US1] Add region fallback logic (eastus → westus) in scripts/foundry-up.sh for quota handling
- [ ] T020 [US1] Add error handling and human-readable failure messages in scripts/foundry-up.sh for permissions and quota issues

**Checkpoint**: At this point, User Story 1 (provision) should be fully functional and testable independently

---

## Phase 4: User Story 2 - Safe Key Rotation (Priority: P1)

**Goal**: Rotate OpenAI key with zero downtime using inactive key regeneration, secret update, and forced refresh

**Independent Test**: Run workflow with action=rotate-key, env=dev; verify inactive key regenerated, secret updated, apps pick up new key within 15 min

### Implementation for User Story 2

- [ ] T021 [US2] Implement logic in scripts/foundry-rotate-key.sh to detect currently active vs inactive key slot
- [ ] T022 [US2] Add logic to scripts/foundry-rotate-key.sh to regenerate inactive key using az cognitiveservices account keys regenerate
- [ ] T023 [US2] Add logic to scripts/foundry-rotate-key.sh to update Key Vault secret AZURE_OPENAI_API_KEY--{env} with new inactive key value
- [ ] T024 [US2] Implement config reference refresh trigger in scripts/foundry-rotate-key.sh using Function App management endpoint
- [ ] T025 [US2] Implement workflow job for action=rotate-key in .github/workflows/foundry-on-demand.yml calling scripts/foundry-rotate-key.sh
- [ ] T026 [US2] Add validation in scripts/foundry-rotate-key.sh to confirm no raw keys are echoed to stdout or GitHub Actions logs
- [ ] T027 [US2] Document refresh SLA (≤15 min) and optional manual restart option in scripts/foundry-rotate-key.sh comments

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (provision + rotate)

---

## Phase 5: User Story 3 - One-command Teardown (Priority: P2)

**Goal**: Delete OpenAI resource, model deployment, and secrets for target env with idempotent cleanup

**Independent Test**: Provision env with action=up, run action=down, verify all resources removed; re-run action=down and confirm idempotent success

### Implementation for User Story 3

- [ ] T028 [US3] Implement resource deletion logic in scripts/foundry-down.sh using az cognitiveservices account delete or resource group scoped deletion
- [ ] T029 [US3] Add logic to scripts/foundry-down.sh to delete Key Vault secret AZURE_OPENAI_API_KEY--{env} if exists
- [ ] T030 [US3] Add logic to scripts/foundry-down.sh to remove Function App setting AZURE_OPENAI_API_KEY reference (optional cleanup)
- [ ] T031 [US3] Implement idempotency checks in scripts/foundry-down.sh (skip deletion if resource already absent)
- [ ] T032 [US3] Implement workflow job for action=down in .github/workflows/foundry-on-demand.yml calling scripts/foundry-down.sh
- [ ] T033 [US3] Add validation in scripts/foundry-down.sh to ensure deletion is scoped to target env only (no cross-env impact)

**Checkpoint**: All user stories should now be independently functional (up, rotate, down)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation, and safety improvements affecting all user stories

- [ ] T034 [P] Add smoke test script scripts/foundry-smoke-test.sh to call /api/health and verify OpenAI key loaded
- [ ] T035 [P] Add log assertion check in scripts/foundry-smoke-test.sh to scan workflow logs for accidental key exposure
- [ ] T036 Ensure backend/src/ code reads AZURE_OPENAI_API_KEY from process.env (verify no hardcoded keys)
- [ ] T037 Update README.md or DEPLOYMENT-GUIDE.md with quickstart instructions for running foundry-on-demand workflow
- [ ] T038 [P] Add resource tagging (env, service=openai, repo, owner, costCenter) to infra/bicep/openai-foundry.bicep
- [ ] T039 Add environment protection rules for prod in .github/workflows/foundry-on-demand.yml (require approval for rotate-key)
- [ ] T040 Run validation per specs/005-openai-foundry-automation/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially (P1 → P1 → P2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Provision)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1 - Rotate)**: Can start after Foundational (Phase 2) - Logically depends on US1 for existing resource, but can be developed independently
- **User Story 3 (P2 - Teardown)**: Can start after Foundational (Phase 2) - Logically cleanup for US1, but can be developed independently

### Within Each User Story

#### User Story 1 (Provision)
- T010-T011: Bicep resources (can run in parallel)
- T012-T013: Key Vault Bicep (can run in parallel with T010-T011)
- T014: Deploy script (depends on T010-T013 complete)
- T015-T017: Script logic (sequential, depends on T014)
- T018: Workflow integration (depends on T015-T017)
- T019-T020: Error handling (depends on T018)

#### User Story 2 (Rotate)
- T021-T023: Core rotation logic (sequential)
- T024: Refresh trigger (depends on T023)
- T025: Workflow integration (depends on T021-T024)
- T026-T027: Validation and docs (can run in parallel, depends on T025)

#### User Story 3 (Teardown)
- T028-T030: Deletion logic (sequential)
- T031: Idempotency (depends on T028-T030)
- T032: Workflow integration (depends on T031)
- T033: Validation (depends on T032)

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 2**: T008 and T009 can run in parallel after T004-T007 complete
- **Within US1**: T010-T011 in parallel; T012-T013 in parallel; both groups can run simultaneously
- **Within US2**: T026-T027 can run in parallel
- **Phase 6**: T034, T035, T038, T039 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch Bicep modules for User Story 1 together:
Task: "Implement Microsoft.CognitiveServices/accounts resource in infra/bicep/openai-foundry.bicep"
Task: "Implement Microsoft.CognitiveServices/accounts/deployments in infra/bicep/openai-foundry.bicep"
Task: "Implement Key Vault secret creation in infra/bicep/keyvault-foundry.bicep"
Task: "Implement Managed Identity role assignment in infra/bicep/keyvault-foundry.bicep"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only - Both P1)

1. Complete Phase 1: Setup (Bicep scaffolding)
2. Complete Phase 2: Foundational (scripts + workflow structure) - CRITICAL
3. Complete Phase 3: User Story 1 (Provision)
4. **STOP and VALIDATE**: Test action=up independently in dev
5. Complete Phase 4: User Story 2 (Rotate)
6. **STOP and VALIDATE**: Test action=rotate-key independently in dev
7. Deploy/demo if ready (skip User Story 3 teardown for now)

### Full Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Provision) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Rotate) → Test independently → Deploy/Demo
4. Add User Story 3 (Teardown) → Test independently → Deploy/Demo
5. Complete Phase 6: Polish → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Provision)
   - Developer B: User Story 2 (Rotate)
   - Developer C: User Story 3 (Teardown)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [Story] label (US1/US2/US3) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No raw secrets in logs: scripts must use silent modes and avoid echo of key values
- Idempotency: scripts must be safe to re-run (check existence before create/delete)
- Environment scoping: all operations must target only the specified env (dev/staging/pr-###)
