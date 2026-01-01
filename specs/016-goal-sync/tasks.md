# Tasks: Goal Sync Between Calculator and Settings

**Input**: Design documents from `/specs/016-goal-sync/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Optional - not explicitly requested in feature specification. Including unit tests for core hooks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify existing infrastructure is in place

- [ ] T001 Verify branch 016-goal-sync is checked out and up to date
- [ ] T002 [P] Verify frontend builds without errors: `cd frontend && npm run build`
- [ ] T003 [P] Verify backend builds without errors: `cd backend && npm run build`

---

## Phase 2: Foundational (Already Complete)

**Purpose**: Core implementation - ALREADY DONE during bug investigation

**Note**: These tasks are marked complete as they were implemented prior to spec creation.

- [x] T004 Reset `hasServerProfile: false` in `setWeightKg` callback in frontend/src/hooks/useProteinCalculator.ts
- [x] T005 [P] Reset `hasServerProfile: false` in `setWeightUnit` callback in frontend/src/hooks/useProteinCalculator.ts
- [x] T006 [P] Reset `hasServerProfile: false` in `setTrainingLevel` callback in frontend/src/hooks/useProteinCalculator.ts
- [x] T007 [P] Reset `hasServerProfile: false` in `setGoal` callback in frontend/src/hooks/useProteinCalculator.ts
- [x] T008 [P] Reset `hasServerProfile: false` in `setMealsPerDay` callback in frontend/src/hooks/useProteinCalculator.ts
- [x] T009 Update `useGoal` hook to read from server API for authenticated users in frontend/src/hooks/useGoal.ts
- [x] T010 [P] Update `useGoal` hook to read from protein profile localStorage as fallback in frontend/src/hooks/useGoal.ts
- [x] T011 [P] Update `setGoal` to also update protein profile localStorage if it exists in frontend/src/hooks/useGoal.ts

**Checkpoint**: Foundation complete - core goal sync functionality is implemented

---

## Phase 3: User Story 1 - Save Calculated Goal to Profile (Priority: P1) 🎯 MVP

**Goal**: Users can save their calculated protein target from the Calculator page and the save button state reflects actual saved status

**Independent Test**: Calculate 95g target, verify button shows "Save to My Profile", save, verify button shows "✓ Saved", change form value, verify button reverts to "Save to My Profile"

### Implementation for User Story 1 (Already Complete)

- [x] T012 [US1] Form setters reset hasServerProfile flag in frontend/src/hooks/useProteinCalculator.ts
- [x] T013 [US1] Save button shows correct state based on hasServerProfile in frontend/src/components/protein/ProteinCalculator.tsx

### Verification for User Story 1

- [ ] T014 [US1] Manual test: Login, go to Calculator, change form value, verify "Save to My Profile" button appears
- [ ] T015 [US1] Manual test: Click Save, verify button changes to "✓ Saved to your profile"
- [ ] T016 [US1] Manual test: Change any form value again, verify button reverts to "Save to My Profile"

**Checkpoint**: User Story 1 is fully functional - save button state accurately reflects saved status

---

## Phase 4: User Story 2 - View Saved Goal in Settings (Priority: P1)

**Goal**: Settings page displays the same goal that was saved in Calculator

**Independent Test**: Save 95g in Calculator, navigate to Settings, verify goal shows 95g

### Implementation for User Story 2 (Already Complete)

- [x] T017 [US2] useGoal hook reads from server API first for authenticated users in frontend/src/hooks/useGoal.ts
- [x] T018 [US2] useGoal hook falls back to protein profile localStorage in frontend/src/hooks/useGoal.ts
- [x] T019 [US2] useGoal hook falls back to legacy goal localStorage in frontend/src/hooks/useGoal.ts
- [x] T020 [US2] useGoal hook returns default 120g if no storage exists in frontend/src/hooks/useGoal.ts

### Verification for User Story 2

- [ ] T021 [US2] Manual test: Save 95g in Calculator, navigate to Settings, verify goal shows 95g
- [ ] T022 [US2] Manual test: Clear localStorage, verify Settings shows 120g default
- [ ] T023 [US2] Manual test: Logout, use Calculator as anonymous, verify Settings reads localStorage

**Checkpoint**: User Story 2 is fully functional - Settings displays goal from Calculator

---

## Phase 5: User Story 3 - Update Goal from Settings (Priority: P2)

**Goal**: Users can manually adjust goal in Settings and it syncs to protein profile storage

**Independent Test**: Change goal in Settings, refresh page, verify goal persists

### Implementation for User Story 3 (Already Complete)

- [x] T024 [US3] setGoal updates legacy localStorage in frontend/src/hooks/useGoal.ts
- [x] T025 [US3] setGoal updates protein profile localStorage if it exists in frontend/src/hooks/useGoal.ts

### Verification for User Story 3

- [ ] T026 [US3] Manual test: Go to Settings, change goal to 80g, save, refresh page, verify goal still shows 80g
- [ ] T027 [US3] Manual test: Verify localStorage entries are updated after Settings save

**Checkpoint**: User Story 3 is fully functional - Settings updates sync to storage

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Testing, validation, and deployment

### Unit Tests (Optional but Recommended)

- [x] T028 [P] Create unit test for useGoal priority ordering in frontend/__tests__/hooks/useGoal.test.ts
- [x] T029 [P] Create unit test for useGoal setGoal syncing localStorage in frontend/__tests__/hooks/useGoal.test.ts

### Integration Testing

- [ ] T030 Run quickstart.md validation steps manually
- [x] T031 [P] Verify build passes: `cd frontend && npm run build`

### Deployment

- [x] T032 Commit all changes with message "feat(016): goal sync between calculator and settings"
- [ ] T033 Push branch and create PR
- [ ] T034 Deploy to production and verify sync works on live site

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Already complete
- **User Story 1 (Phase 3)**: Already complete, just needs verification
- **User Story 2 (Phase 4)**: Already complete, just needs verification
- **User Story 3 (Phase 5)**: Already complete, just needs verification
- **Polish (Phase 6)**: Depends on all verification complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - core calculator functionality
- **User Story 2 (P1)**: No dependencies on US1 - Settings reads independently
- **User Story 3 (P2)**: No dependencies on US1/US2 - Settings writes independently

### Parallel Opportunities

Within Phase 6:
- T028 and T029 can run in parallel (different test files)
- T031 can run in parallel with tests

---

## Parallel Example: Phase 6 Tests

```bash
# Launch all tests together:
Task: "Create unit test for useGoal priority ordering in frontend/tests/hooks/useGoal.test.ts"
Task: "Create unit test for useGoal setGoal syncing localStorage in frontend/tests/hooks/useGoal.test.ts"
```

---

## Implementation Strategy

### MVP Already Complete ✅

Core implementation was done during bug investigation:
1. ✅ Phase 1: Setup (branch exists)
2. ✅ Phase 2: Foundational (hooks modified)
3. ✅ Phase 3: User Story 1 (save button state)
4. ✅ Phase 4: User Story 2 (Settings reads goal)
5. ✅ Phase 5: User Story 3 (Settings writes goal)

### Remaining Work

1. **Verification**: Run manual tests T014-T027
2. **Unit Tests**: Optionally add T028-T029
3. **Deploy**: T032-T034

### Task Summary

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Complete | 22 | Core implementation (T004-T013, T017-T020, T024-T025) |
| 🔲 Pending | 12 | Verification + tests + deploy (T014-T016, T021-T023, T026-T034) |
| **Total** | **34** | |

---

## Notes

- Core implementation was done during bug investigation before formal spec creation
- All pending tasks are verification, testing, and deployment - no new code required
- Manual tests follow quickstart.md validation steps
- Unit tests are optional but recommended for regression prevention
