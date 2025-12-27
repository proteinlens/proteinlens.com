# Tasks: Self-Managed Authentication

**Input**: Design documents from `/specs/013-self-managed-auth/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Approach**: Merge/cherry-pick existing code from `010-user-signup` branch, then fill implementation gaps.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## User Stories Summary

| Story | Title | Priority | Status |
|-------|-------|----------|--------|
| US1 | Email/Password Sign Up | P1 🎯 MVP | Partial - needs email integration |
| US2 | Email/Password Sign In | P1 🎯 MVP | Complete in 010-user-signup |
| US3 | Password Reset | P1 🎯 MVP | Partial - needs email + endpoints |
| US4 | Google OAuth | DEFERRED | Out of scope |
| US5 | Microsoft OAuth | DEFERRED | Out of scope |
| US6 | Sign Out | P1 | Complete in 010-user-signup |
| US7 | Session Management | P2 | Missing - needs new endpoints |

---

## Phase 1: Setup

**Purpose**: Merge existing code and prepare project structure

- [X] T001 Merge/cherry-pick auth code from `010-user-signup` branch to current branch
- [X] T002 [P] Install `@azure/communication-email` dependency in backend/package.json
- [X] T003 [P] Add environment variables to backend/local.settings.json: `ACS_EMAIL_CONNECTION_STRING`, `ACS_EMAIL_SENDER`, `JWT_SECRET_PREVIOUS`
- [X] T004 Verify existing tests pass after merge: `cd backend && npm test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story gaps can be filled

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

### Database Schema Updates

- [X] T005 Add `AuthEventType` enum to backend/prisma/schema.prisma
- [X] T006 Add `AuthEvent` model to backend/prisma/schema.prisma per data-model.md
- [X] T007 Add `authEvents` relation to User model in backend/prisma/schema.prisma
- [X] T008 Run Prisma migration: `npx prisma migrate dev --name add-auth-events`

### Email Service Foundation

- [X] T009 Create email service in backend/src/utils/email.ts with ACS integration per research.md
- [X] T010 [P] Create email templates: verification, password-reset, password-changed in backend/src/templates/
- [X] T011 Add unit tests for email service in backend/tests/unit/email.test.ts

### JWT Dual-Key Rotation

- [X] T012 Update jwt.ts to support dual-key verification fallback per research.md in backend/src/utils/jwt.ts
- [X] T013 Add dual-key rotation tests in backend/tests/unit/jwt.test.ts

### Auth Event Logging

- [X] T014 Create AuthEvent logging service in backend/src/utils/authEvents.ts
- [X] T015 Add unit tests for AuthEvent logging in backend/tests/unit/authEvents.test.ts

**Checkpoint**: Foundation ready - user story gap filling can now begin

---

## Phase 3: User Story 1 - Email/Password Sign Up (Priority: P1) 🎯 MVP

**Goal**: Complete signup flow with email verification

**Independent Test**: Navigate to signup page, enter valid email and password, submit form, receive verification email, click verification link, sign in successfully.

**Existing Code**: Signup endpoint exists in `auth.ts`; needs email sending integration

### Implementation for User Story 1

- [X] T016 [US1] Integrate email service into signup endpoint to send verification email in backend/src/functions/auth.ts
- [X] T017 [US1] Add `/api/auth/verify-email` endpoint in backend/src/functions/auth.ts
- [X] T018 [US1] Add `/api/auth/resend-verification` endpoint with rate limiting in backend/src/functions/auth.ts
- [X] T019 [US1] Add AuthEvent logging for SIGNUP_SUCCESS, SIGNUP_FAILED, EMAIL_VERIFIED in signup/verify flows
- [X] T020 [US1] Add integration tests for signup email flow in backend/tests/integration/auth-signup.test.ts
- [X] T021 [P] [US1] Create SignUp.tsx page in frontend/src/pages/SignUp.tsx
- [X] T022 [P] [US1] Create VerifyEmail.tsx page in frontend/src/pages/VerifyEmail.tsx
- [X] T023 [US1] Add frontend routes for /signup and /verify-email in frontend/src/App.tsx

**Checkpoint**: User Story 1 complete - signup with email verification works end-to-end

---

## Phase 4: User Story 2 - Email/Password Sign In (Priority: P1) 🎯 MVP

**Goal**: Sign in with credentials, receive JWT tokens

**Independent Test**: With verified account, navigate to sign in page, enter credentials, successfully access protected dashboard.

**Existing Code**: Signin endpoint complete in `auth.ts`; needs HttpOnly cookie pattern and frontend

### Implementation for User Story 2

- [X] T024 [US2] Update signin endpoint to set refresh token as HttpOnly cookie in backend/src/functions/auth.ts
- [X] T025 [US2] Add CSRF double-submit cookie pattern to auth endpoints in backend/src/functions/auth.ts
- [X] T026 [US2] Add AuthEvent logging for SIGNIN_SUCCESS, SIGNIN_FAILED in signin flow
- [X] T027 [P] [US2] Create SignIn.tsx page in frontend/src/pages/SignIn.tsx
- [X] T028 [P] [US2] Create useAuth.ts hook with Zustand store for token management in frontend/src/hooks/useAuth.ts
- [X] T029 [US2] Create authService.ts with API calls and cookie handling in frontend/src/services/authService.ts
- [X] T030 [US2] Add frontend route for /signin and protected route wrapper in frontend/src/App.tsx
- [X] T031 [US2] Implement automatic token refresh on page load in frontend/src/App.tsx

**Checkpoint**: User Story 2 complete - signin works with secure token storage

---

## Phase 5: User Story 3 - Password Reset (Priority: P1) 🎯 MVP

**Goal**: Forgotten password recovery via email

**Independent Test**: Click "Forgot Password", enter registered email, receive reset email, click link, set new password, sign in with new password.

**Existing Code**: Token generation exists; needs email sending and endpoints

### Implementation for User Story 3

- [X] T032 [US3] Add `/api/auth/forgot-password` endpoint in backend/src/functions/auth.ts
- [X] T033 [US3] Add `/api/auth/reset-password` endpoint in backend/src/functions/auth.ts
- [X] T034 [US3] Invalidate all user sessions on password reset (FR-018, FR-028)
- [X] T035 [US3] Add AuthEvent logging for PASSWORD_RESET_REQUESTED, PASSWORD_RESET_SUCCESS, PASSWORD_CHANGED
- [X] T036 [US3] Add integration tests for password reset flow in backend/tests/integration/auth-reset.test.ts
- [X] T037 [P] [US3] Create ForgotPassword.tsx page in frontend/src/pages/ForgotPassword.tsx
- [X] T038 [P] [US3] Create ResetPassword.tsx page in frontend/src/pages/ResetPassword.tsx
- [X] T039 [US3] Add frontend routes for /forgot-password and /reset-password in frontend/src/App.tsx

**Checkpoint**: User Story 3 complete - password reset flow works end-to-end

---

## Phase 6: User Story 6 - Sign Out (Priority: P1)

**Goal**: End session and clear tokens

**Independent Test**: While signed in, click sign out, verify redirect to home page, verify protected routes require sign in again.

**Existing Code**: Signout endpoint exists; needs cookie clearing and frontend

### Implementation for User Story 6

- [X] T040 [US6] Update signout endpoint to clear HttpOnly cookie in backend/src/functions/auth.ts
- [X] T041 [US6] Add AuthEvent logging for SIGNOUT in signout flow
- [X] T042 [US6] Add signout button/action to frontend header in frontend/src/pages/SettingsPage.tsx
- [X] T043 [US6] Clear auth state on signout in frontend/src/contexts/AuthProvider.tsx (using React Context)

**Checkpoint**: User Story 6 complete - signout clears session properly

---

## Phase 7: User Story 7 - Session Management (Priority: P2)

**Goal**: View and revoke active sessions

**Independent Test**: Sign in, close browser, reopen, verify still signed in. View sessions, revoke one, verify it's invalidated.

**Existing Code**: RefreshToken model exists; needs list/revoke endpoints and UI

### Implementation for User Story 7

- [X] T044 [US7] Add `/api/auth/sessions` GET endpoint to list user sessions in backend/src/functions/auth.ts
- [X] T045 [US7] Add `/api/auth/sessions/:id` DELETE endpoint to revoke session in backend/src/functions/auth.ts
- [X] T046 [US7] Add AuthEvent logging for SESSION_REVOKED
- [X] T047 [US7] Add integration tests for session management in backend/tests/integration/auth-sessions.test.ts
- [X] T048 [P] [US7] Create SessionManagement.tsx page in frontend/src/pages/SessionManagement.tsx
- [X] T049 [US7] Add frontend route for /settings/sessions in frontend/src/App.tsx

**Checkpoint**: User Story 7 complete - users can view and revoke sessions

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements across all user stories

- [ ] T050 [P] [DEFERRED] Update frontend components to use shadcn/ui auth form components (requires shadcn/ui setup)
- [X] T051 [P] Add loading states and skeleton screens to all auth pages
- [X] T052 [P] Add form validation feedback per spec edge cases (inline errors)
- [X] T053 [P] Add rate limiting error handling UI (show lockout message)
- [X] T054 Run quickstart.md validation - verify all curl examples work
- [X] T055 Update README.md with auth setup instructions
- [X] T056 Security review: verify no secrets in frontend, HTTPS enforced, cookies secure

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
    ↓
┌───┴───┬───────┬───────┐
↓       ↓       ↓       ↓
US1     US2     US3     US6    ← Can run in parallel after Phase 2
(P3)    (P4)    (P5)    (P6)
└───┬───┴───────┴───────┘
    ↓
   US7 (P7) ← Depends on signin working (US2)
    ↓
Phase 8 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Sign Up) | Phase 2 | Foundation complete |
| US2 (Sign In) | Phase 2 | Foundation complete |
| US3 (Password Reset) | Phase 2 | Foundation complete |
| US6 (Sign Out) | US2 | Signin works |
| US7 (Sessions) | US2 | Signin works |

### Parallel Opportunities per Phase

**Phase 2** (can run in parallel):
- T005-T008 (schema) → sequential within group
- T009-T011 (email) + T012-T013 (JWT) + T014-T015 (logging) → parallel groups

**Phase 3-6** (user stories in parallel if team capacity):
- T021-T022 (US1 frontend) in parallel
- T027-T028 (US2 frontend) in parallel
- T037-T038 (US3 frontend) in parallel

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 6)

1. Complete Phase 1: Setup (merge existing code)
2. Complete Phase 2: Foundational (email service, JWT rotation, auth events)
3. Complete Phase 3: User Story 1 (Sign Up with verification)
4. Complete Phase 4: User Story 2 (Sign In with secure tokens)
5. Complete Phase 6: User Story 6 (Sign Out)
6. **VALIDATE MVP**: Test complete auth flow
7. Deploy/demo core authentication

### Incremental Delivery

1. MVP (US1 + US2 + US6) → Basic auth working
2. Add US3 (Password Reset) → Account recovery
3. Add US7 (Session Management) → Security enhancement
4. Polish phase → Production-ready

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 56 |
| Phase 1 (Setup) | 4 |
| Phase 2 (Foundational) | 11 |
| US1 (Sign Up) | 8 |
| US2 (Sign In) | 8 |
| US3 (Password Reset) | 8 |
| US6 (Sign Out) | 4 |
| US7 (Sessions) | 6 |
| Phase 8 (Polish) | 7 |
| Parallel Tasks | 19 |
| MVP Scope | US1 + US2 + US6 (24 tasks after foundation) |

---

## Notes

- Existing 010-user-signup code provides ~60% of backend implementation
- Email service integration is the primary new work (P0 gap)
- Frontend pages are net-new (no existing auth UI)
- Tests: 89 existing tests + new tests for gaps
- OAuth (US4, US5) explicitly deferred per clarifications
