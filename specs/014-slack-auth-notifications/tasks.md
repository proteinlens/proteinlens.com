# Tasks: Slack Authentication Notifications

**Input**: Design documents from `/specs/014-slack-auth-notifications/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested in spec - unit tests included for core SlackNotifier functionality only.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create SlackNotifier utility class and configure environment

- [ ] T001 [P] Create SlackNotifier class in backend/src/utils/slack.ts
- [ ] T002 [P] Add SLACK_WEBHOOK_URL to backend/local.settings.json.example
- [ ] T003 [P] Add SLACK_WEBHOOK_URL env var to infra/bicep/function-app.bicep

---

## Phase 2: Foundational (SlackNotifier Core)

**Purpose**: Core notification functionality that ALL user stories depend on

**⚠️ CRITICAL**: No user story integration can begin until this phase is complete

- [ ] T004 Implement `formatMessage()` for all 3 event types (SIGNUP, PASSWORD_RESET, EMAIL_VERIFIED) in backend/src/utils/slack.ts
- [ ] T005 Implement `sendWithRetry()` with 1 retry + 1s delay in backend/src/utils/slack.ts
- [ ] T006 Implement `notify()` as fire-and-forget (no throw, log errors) in backend/src/utils/slack.ts
- [ ] T007 Export singleton `slackNotifier` instance in backend/src/utils/slack.ts
- [ ] T008 [P] Create unit tests for SlackNotifier in backend/tests/unit/slack.test.ts

**Checkpoint**: SlackNotifier is functional and tested - integration can begin

---

## Phase 3: User Story 1 - Signup Notification (Priority: P1) 🎯 MVP

**Goal**: Send Slack notification when signup verification email is sent

**Independent Test**: Create new account, verify Slack notification appears with email + timestamp

### Implementation for User Story 1

- [ ] T009 [US1] Import slackNotifier in backend/src/utils/email.ts
- [ ] T010 [US1] Call slackNotifier.notify() after sendVerificationEmail() success in backend/src/utils/email.ts

**Checkpoint**: Signup notifications working - can be tested and deployed independently

---

## Phase 4: User Story 2 - Password Reset Notification (Priority: P2)

**Goal**: Send Slack notification when password reset email is sent

**Independent Test**: Request password reset, verify Slack notification appears with email + timestamp

### Implementation for User Story 2

- [ ] T011 [US2] Call slackNotifier.notify() after sendPasswordResetEmail() success in backend/src/utils/email.ts

**Checkpoint**: Password reset notifications working - can be tested independently

---

## Phase 5: User Story 3 - Email Verification Notification (Priority: P3)

**Goal**: Send Slack notification when user verifies their email

**Independent Test**: Click verification link, verify Slack notification confirms verification

### Implementation for User Story 3

- [ ] T012 [US3] Import slackNotifier in backend/src/functions/auth.ts
- [ ] T013 [US3] Call slackNotifier.notify() after email verification success in backend/src/functions/auth.ts verifyEmail()

**Checkpoint**: All 3 notification types working - feature complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and validation

- [ ] T014 [P] Update quickstart.md with local testing instructions in specs/014-slack-auth-notifications/quickstart.md
- [ ] T015 [P] Add SLACK_WEBHOOK_URL documentation to DEVELOPMENT-GUIDE.md
- [ ] T016 Run quickstart.md validation (test all 3 notification types)
- [ ] T017 Run existing backend tests to ensure no regression: `cd backend && npm test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001 - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Phase 2 completion
  - User stories can proceed sequentially (P1 → P2 → P3)
  - Or in parallel (US1 + US2 + US3 if staffed)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **US2 (P2)**: Can start after Phase 2 - No dependencies on other stories
- **US3 (P3)**: Can start after Phase 2 - No dependencies on other stories

### Within Each Phase

- T001, T002, T003 can run in parallel (different files)
- T004, T005, T006, T007 are sequential (same file, building on each other)
- T008 can run in parallel with T004-T007 (different file)
- T009, T010 are sequential (same file)
- T011 depends on T009 (same file, building on import)
- T012, T013 are sequential (same file)
- T014, T015 can run in parallel (different files)

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together:
Task T001: "Create SlackNotifier class in backend/src/utils/slack.ts"
Task T002: "Add SLACK_WEBHOOK_URL to backend/local.settings.json.example"
Task T003: "Add SLACK_WEBHOOK_URL env var to infra/bicep/function-app.bicep"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008)
3. Complete Phase 3: User Story 1 (T009-T010)
4. **STOP and VALIDATE**: Test signup notification independently
5. Deploy if ready - MVP is functional

### Incremental Delivery

1. Setup + Foundational → Core ready
2. Add US1 → Test → Deploy (MVP - signup notifications!)
3. Add US2 → Test → Deploy (adds password reset)
4. Add US3 → Test → Deploy (adds email verification)
5. Each story adds value without breaking previous

### Estimated Task Counts

| Phase | Tasks | Parallelizable |
|-------|-------|----------------|
| Setup | 3 | 3 |
| Foundational | 5 | 1 |
| US1 | 2 | 0 |
| US2 | 1 | 0 |
| US3 | 2 | 0 |
| Polish | 4 | 2 |
| **Total** | **17** | **6** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Notification failures never block user operations (fire-and-forget)
- Commit after each task or logical group
- Test with actual Slack webhook in dev before deploying
