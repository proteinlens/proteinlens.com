# Tasks: User Signup Process

**Input**: Design documents from `/specs/010-user-signup/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in spec. Omitting test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema updates

- [X] T001 Run Prisma migration to extend User model with profile fields (firstName, lastName, organizationName, phone, emailVerified, profileCompleted) in backend/prisma/schema.prisma
- [X] T002 [P] Add ConsentRecord model and ConsentType enum to backend/prisma/schema.prisma
- [X] T003 [P] Add SignupAttempt model and SignupAttemptOutcome enum to backend/prisma/schema.prisma
- [X] T004 Run `npx prisma migrate dev --name add-signup-models` to create migration
- [X] T005 [P] Add environment variables to backend/.env.example (HCAPTCHA_SECRET, TOS_VERSION, PRIVACY_VERSION)
- [X] T006 [P] Add environment variables to frontend/.env.example (VITE_HCAPTCHA_SITE_KEY, VITE_TOS_URL, VITE_PRIVACY_URL)
- [X] T007 [P] Install hCaptcha dependency: `npm install @hcaptcha/react-hcaptcha` in frontend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation schemas, services, and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create Zod signup validation schemas (signupFormSchema, passwordStrengthSchema) in backend/src/models/signupSchema.ts
- [X] T009 [P] Create password breach check utility using HIBP k-Anonymity API in backend/src/utils/passwordValidator.ts
- [X] T010 [P] Create email typo detection utility with Levenshtein distance in frontend/src/utils/emailTypoDetector.ts
- [X] T011 Create ConsentService with createConsent, getConsents, revokeConsent methods in backend/src/services/consentService.ts
- [X] T012 [P] Create SignupAttemptService with logAttempt, checkRateLimit methods in backend/src/services/signupAttemptService.ts
- [X] T013 Extend AuthService with completeSignupProfile method (create local User from B2C token) in backend/src/services/authService.ts
- [X] T014 Create signup API routes file structure in backend/src/functions/signup.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Creates Account (Priority: P1) 🎯 MVP

**Goal**: Visitor can sign up with email/password or social login, receive verification email, and access the platform after verification

**Independent Test**: Complete signup form with valid data, click verification link in email, successfully log in to dashboard

### Backend Implementation

- [X] T015 [US1] Implement POST /api/signup/profile endpoint (create User record, ConsentRecords from B2C token) in backend/src/functions/signup.ts
- [X] T016 [US1] Implement POST /api/signup/check-email endpoint (check availability at submission, rate limiting) in backend/src/functions/signup.ts
- [X] T017 [US1] Implement POST /api/signup/resend-verification endpoint (trigger B2C resend, rate limit 10/day) in backend/src/functions/signup.ts
- [X] T018 [US1] Add request logging and SignupAttempt audit records in signup endpoints

### Frontend Implementation

- [X] T019 [P] [US1] Create SocialLoginButtons component (Google, Microsoft buttons triggering MSAL loginRedirect) in frontend/src/components/auth/SocialLoginButtons.tsx
- [X] T020 [P] [US1] Create ConsentCheckboxes component (ToS, Privacy checkboxes with links) in frontend/src/components/auth/ConsentCheckboxes.tsx
- [X] T021 [US1] Create SignupForm component (email, password, confirm password, first name, last name fields) in frontend/src/components/auth/SignupForm.tsx
- [X] T022 [US1] Create useSignupForm hook (form state, submission handler, B2C redirect trigger) in frontend/src/hooks/useSignupForm.ts
- [X] T023 [US1] Create SignupPage with SignupForm, SocialLoginButtons, ConsentCheckboxes in frontend/src/pages/SignupPage.tsx
- [X] T024 [US1] Create VerifyEmailPage (landing page after clicking verification link) in frontend/src/pages/VerifyEmailPage.tsx
- [X] T025 [US1] Add signup routes (/signup, /verify-email) to React Router configuration in frontend/src/App.tsx
- [X] T026 [US1] Create signupService with checkEmail, completeProfile API calls in frontend/src/services/signupService.ts

**Checkpoint**: User Story 1 complete - users can sign up and verify email

---

## Phase 4: User Story 2 - Clear Validation Feedback (Priority: P1)

**Goal**: Users see real-time validation feedback as they type, reducing failed submissions

**Independent Test**: Enter invalid data in each field, observe immediate error messages; fix errors, observe success states

- [X] T027 [P] [US2] Create useDebounce hook (300ms debounce for real-time validation) in frontend/src/hooks/useDebounce.ts
- [X] T028 [P] [US2] Create FormField component (label, input, error message, aria attributes) in frontend/src/components/auth/FormField.tsx
- [X] T029 [US2] Implement real-time email validation with typo suggestion in SignupForm
- [X] T030 [US2] Implement real-time name validation (1-50 chars, valid characters) in SignupForm
- [X] T031 [US2] Implement confirm password match validation in SignupForm
- [X] T032 [US2] Add inline error messages with icons (not color alone) per FR-037

**Checkpoint**: User Story 2 complete - real-time validation feedback working

---

## Phase 5: User Story 3 - Strong Password Requirements (Priority: P1)

**Goal**: Users set secure passwords with real-time strength feedback and breach checking

**Independent Test**: Enter weak passwords, observe strength indicator and requirement checklist; enter breached password, see rejection

- [X] T033 [P] [US3] Create PasswordStrength component (strength indicator: weak/medium/strong) in frontend/src/components/auth/PasswordStrength.tsx
- [X] T034 [P] [US3] Create PasswordRequirements component (checklist with ✓/✗ for each requirement) in frontend/src/components/auth/PasswordRequirements.tsx
- [X] T035 [US3] Create usePasswordValidation hook (check all requirements, call HIBP API) in frontend/src/hooks/usePasswordValidation.ts
- [X] T036 [US3] Integrate PasswordStrength and PasswordRequirements into SignupForm
- [X] T037 [US3] Implement POST /api/signup/validate-password endpoint (backend breach check) in backend/src/functions/signup.ts

**Checkpoint**: User Story 3 complete - password strength and breach checking working

---

## Phase 6: User Story 4 - Duplicate Email Handling (Priority: P1)

**Goal**: Users attempting signup with existing email receive helpful options to sign in or reset password

**Independent Test**: Submit signup form with existing email, see "email exists" message with sign in/reset options

- [X] T038 [US4] Create DuplicateEmailMessage component (message with sign in and reset password buttons) in frontend/src/components/auth/DuplicateEmailMessage.tsx
- [X] T039 [US4] Add duplicate email detection on form submission in useSignupForm hook
- [X] T040 [US4] Implement redirect to login page with email pre-filled when user clicks "sign in"
- [X] T041 [US4] Implement redirect to password reset flow when user clicks "reset password"

**Checkpoint**: User Story 4 complete - duplicate email handling working

---

## Phase 7: User Story 5 - Resend Verification Email (Priority: P2)

**Goal**: Users who didn't receive verification email can request a new one

**Independent Test**: Attempt login with unverified account, click resend verification, receive new email

- [X] T042 [US5] Create ResendVerificationBanner component (shown on unverified account login) in frontend/src/components/auth/ResendVerificationBanner.tsx
- [X] T043 [US5] Add resendVerification method to signupService in frontend/src/services/signupService.ts
- [X] T044 [US5] Implement rate limiting display (countdown timer) in ResendVerificationBanner
- [X] T045 [US5] Integrate ResendVerificationBanner into login flow when emailVerified=false

**Checkpoint**: User Story 5 complete - verification email resend working

---

## Phase 8: User Story 6 - Terms and Privacy Consent (Priority: P2)

**Goal**: Users must explicitly accept ToS and Privacy Policy before signup

**Independent Test**: Attempt submit without checkboxes, see error; check boxes, click links to view documents

- [X] T046 [US6] Create TermsModal component (displays full Terms of Service) in frontend/src/components/auth/TermsModal.tsx
- [X] T047 [P] [US6] Create PrivacyModal component (displays full Privacy Policy) in frontend/src/components/auth/PrivacyModal.tsx
- [X] T048 [US6] Implement POST /api/signup/consent endpoint (record consent with IP, timestamp, version) in backend/src/functions/signup.ts
- [X] T049 [US6] Implement GET /api/signup/consent endpoint (retrieve user's consent records) in backend/src/functions/signup.ts
- [X] T050 [US6] Add consent validation in SignupForm (require checkboxes before submit)

**Checkpoint**: User Story 6 complete - consent recording and display working

---

## Phase 9: User Story 7 - Accessible Signup Flow (Priority: P2)

**Goal**: Users with disabilities can complete signup using assistive technologies

**Independent Test**: Complete signup using keyboard only; verify screen reader announces all fields and errors

- [X] T051 [US7] Add ARIA labels to all form fields in SignupForm (aria-label, aria-describedby, aria-invalid)
- [X] T052 [US7] Implement focus management (auto-focus first error on submit, logical tab order)
- [X] T053 [US7] Add aria-live regions for validation error announcements
- [X] T054 [US7] Verify color contrast (4.5:1 minimum) on all text elements using Tailwind tokens
- [X] T055 [US7] Add visible focus indicators (3:1 contrast) to all interactive elements
- [X] T056 [US7] Add skip-to-main-content link on SignupPage

**Checkpoint**: User Story 7 complete - WCAG 2.1 AA compliance achieved

---

## Phase 10: User Story 8 - Organization Invite Signup (Priority: P3)

**Goal**: Organization admins can invite users who complete a modified signup flow

**Independent Test**: Send org invite, click link, complete signup with org name pre-filled, verify user added to org

- [X] T057 [P] [US8] Extend Prisma schema with OrganizationInvite model (token, email, orgId, expiresAt, usedAt)
- [X] T058 [US8] Create OrganizationInviteService with createInvite, validateInvite, markUsed methods in backend/src/services/organizationInviteService.ts
- [X] T059 [US8] Implement POST /api/org/invite endpoint (create invite, send email) in backend/src/functions/organization.ts
- [X] T060 [US8] Implement GET /api/org/invite/:token endpoint (validate invite, return org details) in backend/src/functions/organization.ts
- [X] T061 [US8] Create InviteSignupPage (modified SignupForm with org name displayed, email pre-filled) in frontend/src/pages/InviteSignupPage.tsx
- [X] T062 [US8] Add /invite/:token route to React Router configuration
- [X] T063 [US8] Handle expired invite link with helpful error message and admin contact info

**Checkpoint**: User Story 8 complete - organization invite signup working

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final quality improvements, documentation, and cleanup

- [X] T064 [P] Add loading states and skeleton screens during B2C redirect and API calls
- [X] T065 [P] Add success toast notifications on signup completion (auto-dismiss 3s)
- [X] T066 [P] Implement sessionStorage form data preservation for page refresh recovery
- [X] T067 [P] Add hCaptcha integration after 3 failed signup attempts from same IP
- [X] T068 Update quickstart.md with final testing instructions and troubleshooting
- [X] T069 Run Lighthouse accessibility audit and fix any issues
- [X] T070 Add Application Insights custom events for signup funnel tracking

---

## Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ─────────────────────────────────┐
    ↓                                                   │
Phase 3 (US1: Core Signup) ←──── MVP MILESTONE          │
    ↓                                                   │
Phase 4 (US2: Validation) ─── can start after T021      │
    ↓                                                   │
Phase 5 (US3: Password) ─── can start after T021        │
    ↓                                                   │
Phase 6 (US4: Duplicate) ─── needs T015, T016           │
    ↓                                                   │
Phase 7 (US5: Resend) ─── needs T017                    │
    ↓                                                   │
Phase 8 (US6: Consent) ─── needs T011, T020             │
    ↓                                                   │
Phase 9 (US7: Accessibility) ─── can be parallel        │
    ↓                                                   │
Phase 10 (US8: Org Invite) ─── can be deferred ─────────┘
    ↓
Phase 11 (Polish)
```

## Parallel Execution Examples

### Maximum parallelism in Phase 2:
- T009, T010, T012 can run in parallel (different files, no dependencies)

### After T021 (SignupForm created):
- T027-T032 (US2: Validation)
- T033-T036 (US3: Password)
- T051-T056 (US7: Accessibility)

All these can run in parallel as they modify different aspects of the signup form.

### Phase 10 (US8) is fully independent:
- Can be deferred to post-MVP
- Has no dependencies on other user stories except Phase 2 foundation

## Implementation Strategy

**MVP Scope**: Phases 1-6 (User Stories 1-4)
- Core signup with email/password and social login
- Real-time validation
- Password strength and breach checking  
- Duplicate email handling

**Post-MVP**: Phases 7-10 (User Stories 5-8)
- Verification resend
- Terms/Privacy modals
- Full accessibility audit
- Organization invites

**Total Tasks**: 70
- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundation): 7 tasks
- Phase 3-10 (User Stories): 49 tasks
- Phase 11 (Polish): 7 tasks

**Parallel Opportunities**: 24 tasks marked [P]
