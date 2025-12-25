---

description: "Executable task list for 009-user-auth feature"
---

# Tasks: User Authentication

**Input**: Design documents from `/specs/009-user-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in the spec. No explicit test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Feature-specific initialization and config scaffolding

- [x] T001 Create auth config loader in backend/src/utils/authConfig.ts
- [x] T002 [P] Add MSAL config placeholders (authority, clientId, redirect URIs) in frontend/src/config.ts
- [x] T003 [P] Add telemetry helpers for auth events in backend/src/services/auditService.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement JWT auth guard middleware in backend/src/middleware/authGuard.ts
- [x] T005 [P] Implement token validation and user mapping in backend/src/services/authService.ts
- [x] T006 [P] Create GET /me Azure Function handler in backend/src/functions/me.ts
- [x] T007 Wire telemetry event emitters for auth flows in backend/src/services/auditService.ts
- [x] T008 Initialize AuthProvider with MSAL and session policy in frontend/src/contexts/AuthProvider.tsx
- [x] T009 [P] Create ProtectedRoute component enforcing auth in frontend/src/components/ProtectedRoute.tsx
- [x] T010 [P] Attach bearer tokens to API requests in frontend/src/services/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Sign Up, Sign In, Sign Out (Priority: P1) 🎯 MVP

**Goal**: Users can create an account, sign in to access protected features, and sign out.

**Independent Test**: A new user can sign up and is considered signed in; a signed-in user can sign out and protected routes become inaccessible until sign in.

### Implementation for User Story 1

- [x] T011 [P] [US1] Implement SignIn page invoking MSAL login in frontend/src/pages/SignIn.tsx
- [x] T012 [P] [US1] Implement SignUp page invoking B2C signup flow in frontend/src/pages/SignUp.tsx
- [x] T013 [US1] Add sign-out action and context API in frontend/src/contexts/AuthProvider.tsx
- [x] T014 [US1] Add routes and navigation links for auth pages in frontend/src/App.tsx
- [x] T015 [US1] Return mapped user profile from token in backend/src/functions/me.ts
- [x] T016 [US1] Emit signup/login/logout telemetry in backend/src/services/auditService.ts

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Password Reset and Email Verification (Priority: P2)

**Goal**: Users can reset forgotten passwords and verify email ownership.

**Independent Test**: A user can request a reset, set a new password, and sign in. Email verification completes via the provider link.

### Implementation for User Story 2

- [x] T017 [P] [US2] Implement ResetPassword page invoking B2C reset flow in frontend/src/pages/ResetPassword.tsx
- [x] T018 [P] [US2] Add email verification banner component in frontend/src/components/VerifyEmailBanner.tsx
- [x] T019 [US2] Handle verification state and resend action in frontend/src/contexts/AuthProvider.tsx
- [x] T020 [US2] Emit reset/verification telemetry in backend/src/services/auditService.ts

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Session Management and Protected Routes (Priority: P3)

**Goal**: Sessions persist across reloads within policy; protected routes enforce authentication with friendly redirects.

**Independent Test**: After sign-in, reloading keeps the user authenticated; accessing a protected route when signed out redirects to sign in with a return path.

### Implementation for User Story 3

- [x] T021 [P] [US3] Configure MSAL cache and persistence in frontend/src/contexts/AuthProvider.tsx
- [x] T022 [P] [US3] Enforce ProtectedRoute redirects with return path in frontend/src/components/ProtectedRoute.tsx
- [x] T023 [US3] Enforce authGuard on /me and future secured endpoints in backend/src/middleware/authGuard.ts
- [x] T024 [US3] Implement token refresh and 401 retry in frontend/src/services/api.ts
- [x] T025 [US3] Track session expiration and redirect events in frontend/src/utils/telemetry.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T026 [P] Improve accessibility and error states for auth pages in frontend/src/pages/
- [x] T027 Refine types and error handling in backend/src/services/authService.ts
- [x] T028 [P] Update quickstart with auth flows in specs/009-user-auth/quickstart.md
- [x] T029 Security headers/CSP review for SPA in frontend/index.html
- [x] T030 Run quickstart validation for auth flows end-to-end per specs/009-user-auth/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Proceed sequentially by priority (P1 → P2 → P3) or in parallel if staffed
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent; no hard dependency on US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent; shares guards and context

### Within Each User Story

- Models/services/middleware before page wiring where applicable
- Core implementation before telemetry
- Story complete before moving to next priority unless staffed in parallel

### Parallel Opportunities

- T002, T003 in Setup can run in parallel
- T005–T006–T009–T010 in Foundational can run in parallel after T004 and T008 planning
- US1: T011 and T012 in parallel; then T013–T016
- US2: T017 and T018 in parallel; then T019–T020
- US3: T021 and T022 in parallel; then T023–T025

---

## Parallel Example: User Story 1

- Engineer A: T011 [US1] Implement SignIn page in frontend/src/pages/SignIn.tsx
- Engineer B: T012 [US1] Implement SignUp page in frontend/src/pages/SignUp.tsx
- After both complete, proceed with T013 → T014 → T015 → T016 in sequence

---

## Implementation Strategy

- **MVP First**: Deliver User Story 1 (P1) to enable account creation and basic authenticated usage.
- **Incremental Delivery**: Add password reset and email verification (P2), then session persistence + route enforcement (P3).
- **Telemetry**: Emit non-PII auth events for observability; correlate with request IDs.
