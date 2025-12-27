# Tasks: Microsoft Entra External ID Authentication

**Input**: Design documents from `/specs/013-azure-b2c-auth/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

> **Migration Note**: Azure AD B2C is discontinued for new customers as of May 1, 2025. Tasks use Microsoft Entra External ID (successor CIAM platform).

**Tests**: Not explicitly requested in specification - omitting test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files/services, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.) - only for user story phases
- Include exact file paths or Microsoft Entra admin center locations

## Path Conventions

- **Frontend**: `frontend/src/`
- **Backend**: `backend/src/`
- **Infrastructure**: Microsoft Entra admin center (https://entra.microsoft.com)
- **Azure Portal**: Static Web App configuration

---

## Phase 1: Setup (External ID Infrastructure)

**Purpose**: Create Microsoft Entra External tenant and app registration

- [X] T001 Create Microsoft Entra External tenant `proteinlenscustomers.onmicrosoft.com` via Microsoft Entra admin center → Manage tenants → Create → External
- [X] T002 Switch to External tenant and verify access in Entra admin center
- [X] T003 Create App Registration `ProteinLens Web` with SPA platform and redirect URI `https://www.proteinlens.com`
- [X] T004 Add local development redirect URI `http://localhost:5173` to App Registration → Authentication
- [X] T005 [P] Configure API permissions (openid, profile, email, offline_access) in App Registration → API permissions
- [X] T006 Grant admin consent for all API permissions in External tenant
- [X] T007 Record Application (client) ID from App Registration Overview page

---

## Phase 2: Foundational (User Flows & Code Configuration)

**Purpose**: Create user flows and update frontend configuration - MUST complete before user story testing

**⚠️ CRITICAL**: No user story testing can occur until this phase is complete

- [X] T008 Create user flow `SignUpSignIn` in External Identities → User flows → Sign up and sign in
- [X] T009 Configure user flow attributes: collect (Display Name, Email Address), token claims (Display Name, Email Address, Object ID)
- [X] T010 Update `frontend/src/auth/msalConfig.ts` - set `knownAuthorities` to `['proteinlenscustomers.ciamlogin.com']`
- [X] T011 [P] Create `frontend/.env.local` from template with VITE_AUTH_CLIENT_ID, VITE_AUTH_AUTHORITY, VITE_AUTH_REDIRECT_URI
- [X] T012 Configure Static Web App environment variables in Azure Portal → proteinlens-web-prod → Configuration with External ID values

**Checkpoint**: External ID infrastructure ready - authentication flows can now be tested

---

## Phase 3: User Story 1 - New User Signup (Priority: P1) 🎯 MVP

**Goal**: Enable new users to sign up via Microsoft Entra External ID with email/password

**Independent Test**: Visit /signup, click "Create account", complete External ID signup flow, verify redirect back to app as authenticated user

### Implementation for User Story 1

- [ ] T013 [US1] Test External ID `SignUpSignIn` user flow via Entra admin center → User flows → Run user flow
- [ ] T014 [US1] Verify `frontend/src/pages/SignupPage.tsx` redirects to External ID signup flow when MSAL is configured
- [ ] T015 [US1] Test complete signup flow: user creates account in External ID → redirected to app as authenticated
- [ ] T016 [US1] Verify `/api/me` endpoint creates User record in database with `externalId` from oid claim
- [ ] T017 [US1] Test duplicate email scenario - verify External ID displays appropriate error message

**Checkpoint**: New users can complete signup through External ID and are authenticated in the app

---

## Phase 4: User Story 2 - Existing User Sign In (Priority: P1)

**Goal**: Enable existing users to sign in via Microsoft Entra External ID

**Independent Test**: Visit /login, click "Sign in", authenticate via External ID, verify session is established

### Implementation for User Story 2

- [ ] T018 [US2] Verify `frontend/src/pages/SignIn.tsx` redirects to External ID sign-in flow on button click
- [ ] T019 [US2] Test sign-in with credentials created in User Story 1 signup
- [ ] T020 [US2] Verify successful sign-in establishes session via `frontend/src/contexts/AuthProvider.tsx`
- [ ] T021 [US2] Test incorrect credentials - verify External ID displays error without exposing security details
- [ ] T022 [US2] Verify `returnTo` parameter redirects user to intended page after sign-in

**Checkpoint**: Existing users can sign in through External ID and resume their session

---

## Phase 5: User Story 6 - Sign Out (Priority: P1)

**Goal**: Enable authenticated users to sign out securely

**Independent Test**: Sign in, click sign out, verify session cleared and protected pages redirect to login

### Implementation for User Story 6

- [ ] T023 [US6] Verify sign out button calls MSAL logout in `frontend/src/contexts/AuthProvider.tsx`
- [ ] T024 [US6] Test sign out terminates External ID session (single sign-out)
- [ ] T025 [US6] Verify signed-out user cannot access `/history` or other protected pages
- [ ] T026 [US6] Verify signed-out user is redirected to login when accessing protected pages

**Checkpoint**: Users can securely sign out with proper session cleanup

---

## Phase 6: User Story 3 - Social Login with Google (Priority: P2)

**Goal**: Enable users to sign up/sign in with their Google account

**Independent Test**: Click "Continue with Google", authenticate via Google, verify successful redirect and session

### Implementation for User Story 3

- [ ] T027 [US3] Create Google OAuth credentials in Google Cloud Console → APIs & Services → Credentials
- [ ] T028 [US3] Configure Google OAuth consent screen with authorized domains: `ciamlogin.com`, `proteinlens.com`
- [ ] T029 [US3] Set redirect URI in Google: `https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/federation/oauth2`
- [ ] T030 [US3] Add Google identity provider in External Identities → All identity providers → Google
- [ ] T031 [US3] Enable Google identity provider in `SignUpSignIn` user flow → Identity providers
- [ ] T032 [US3] Test Google sign-up - verify new user created with Google identity
- [ ] T033 [US3] Test Google sign-in - verify existing Google user can authenticate

**Checkpoint**: Users can authenticate with Google via External ID federation

---

## Phase 7: User Story 4 - Social Login with Microsoft (Priority: P2)

**Goal**: Enable users to sign up/sign in with their Microsoft account

**Independent Test**: Click "Continue with Microsoft", authenticate via Microsoft, verify successful redirect and session

> **Note**: Microsoft Account is a **built-in** identity provider in External ID - no separate app registration needed!

### Implementation for User Story 4

- [ ] T034 [US4] Verify Microsoft Account identity provider is available in External Identities → All identity providers
- [ ] T035 [US4] Enable Microsoft Account identity provider in `SignUpSignIn` user flow → Identity providers
- [ ] T036 [US4] Test Microsoft sign-up - verify new user created with Microsoft identity
- [ ] T037 [US4] Test Microsoft sign-in - verify existing Microsoft user can authenticate

**Checkpoint**: Users can authenticate with Microsoft via External ID built-in provider

---

## Phase 8: User Story 5 - Password Reset (Priority: P2)

**Goal**: Enable users to reset forgotten passwords via External ID

**Independent Test**: Click "Forgot password", complete External ID reset flow, sign in with new password

### Implementation for User Story 5

- [ ] T038 [US5] Verify "Forgot password" link on login page triggers External ID password reset flow
- [ ] T039 [US5] Test password reset flow - enter registered email, receive verification code
- [ ] T040 [US5] Verify new password meets complexity requirements (8+ chars, uppercase, lowercase, number)
- [ ] T041 [US5] Test sign-in with new password after successful reset
- [ ] T042 [US5] Verify password reset for non-existent email shows appropriate message without revealing if email exists

**Checkpoint**: Users can recover account access through password reset

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T043 [P] Update `QUICKSTART.md` in repo root with External ID setup summary
- [ ] T044 [P] Update `README.md` authentication section with External ID information
- [ ] T045 Validate session timeout behavior (30m inactivity, 7d absolute) per SC-006
- [ ] T046 Test silent token refresh during API calls per FR-007
- [ ] T047 Run full E2E validation using `specs/013-azure-b2c-auth/quickstart.md`
- [ ] T048 Document External ID tenant details securely (tenant name, app registration ID)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ──────────────────────┐
                                     ▼
Phase 2: Foundational ───────────────┤ BLOCKS ALL USER STORIES
                                     │
     ┌───────────────────────────────┘
     │
     ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│  US1    │  │  US3    │  │  US5    │
│ Signup  │  │ Google  │  │ PW Reset│
│  (P1)   │  │  (P2)   │  │  (P2)   │
└────┬────┘  └─────────┘  └─────────┘
     │
     ▼
┌─────────┐  ┌─────────┐
│  US2    │  │  US4    │
│ Sign In │  │Microsoft│
│  (P1)   │  │  (P2)   │
└────┬────┘  └─────────┘
     │
     ▼
┌─────────┐
│  US6    │
│Sign Out │
│  (P1)   │
└────┬────┘
     │
     ▼
Phase 9: Polish
```

### User Story Dependencies

| Story | Priority | Depends On | Can Start After |
|-------|----------|------------|-----------------|
| US1 - Signup | P1 | Foundational | Phase 2 complete |
| US2 - Sign In | P1 | US1 (test account) | US1 complete |
| US6 - Sign Out | P1 | US2 (active session) | US2 complete |
| US3 - Google | P2 | Foundational | Phase 2 complete |
| US4 - Microsoft | P2 | Foundational | Phase 2 complete |
| US5 - Password Reset | P2 | US1 (registered email) | US1 complete |

### Parallel Opportunities

**After Phase 2 (Foundational) completes:**
- US3 (Google) and US4 (Microsoft) can be configured in parallel
- US5 (Password Reset) can be tested independently after US1

**Within Setup/Foundational:**
- T005 (API permissions) can run in parallel with other setup
- T011 (.env.local) can run in parallel with Static Web App config

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 6 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T012)
3. Complete Phase 3: User Story 1 - Signup (T013-T017)
4. Complete Phase 4: User Story 2 - Sign In (T018-T022)
5. Complete Phase 5: User Story 6 - Sign Out (T023-T026)
6. **STOP AND VALIDATE**: Core authentication working end-to-end
7. Deploy/demo if ready

### Incremental Delivery

| Iteration | Stories | Value Delivered |
|-----------|---------|-----------------|
| 1 | Setup + Foundational | Infrastructure ready |
| 2 | US1, US2, US6 | Core auth working (MVP!) |
| 3 | US4 (Microsoft) | Easiest social provider (built-in) |
| 4 | US3 (Google) | Most popular social provider |
| 5 | US5 (Password Reset) | Account recovery |
| 6 | Polish | Documentation, validation |

---

## Summary

| Phase | Tasks | Priority | Estimated Time |
|-------|-------|----------|----------------|
| Setup | T001-T007 | P1 | 10 min |
| Foundational | T008-T012 | P1 | 15 min |
| US1 Signup | T013-T017 | P1 | 15 min |
| US2 Sign In | T018-T022 | P1 | 10 min |
| US6 Sign Out | T023-T026 | P1 | 10 min |
| US3 Google | T027-T033 | P2 | 20 min |
| US4 Microsoft | T034-T037 | P2 | 5 min |
| US5 Password Reset | T038-T042 | P2 | 10 min |
| Polish | T043-T048 | P2 | 15 min |

**Total**: 48 tasks | **MVP (P1 only)**: 26 tasks | **Estimated Total Time**: ~110 minutes

---

## Notes

- Most tasks are Microsoft Entra admin center configuration, not code changes
- Frontend MSAL code already exists - just needs environment variables
- [P] tasks = different services/files, no dependencies
- [Story] label maps task to specific user story for traceability
- Microsoft Account is simpler in External ID - no separate app registration needed
- Google provider still requires Google Cloud Console credentials
- Verify each user story independently before proceeding
