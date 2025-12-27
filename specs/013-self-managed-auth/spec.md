# Feature Specification: Self-Managed Authentication

**Feature Branch**: `013-self-managed-auth`  
**Created**: 27 December 2025  
**Status**: Draft  
**Input**: User description: "implement user signup and sign in. optionally add social auth via google and microsoft. I want fully managed solution leveraging my database (postgresql). I don't want to use Microsoft Entra External ID, Azure AD B2C or Clerk"

## Clarifications

### Session 2025-12-27

- Q: How should 013-self-managed-auth relate to existing 010-user-signup code? → A: Document & Merge - This spec documents existing code; implementation is merging that branch with any gaps filled
- Q: Which email service for transactional emails? → A: Azure Communication Services (ACS) Email
- Q: What should the minimum password length be? → A: 8 characters (match existing 010-user-signup implementation)
- Q: Should OAuth be implemented in this feature or deferred? → A: Defer OAuth to future feature; focus on merging existing email/password auth
- Q: Where should JWT access tokens be stored in frontend? → A: Memory only (JS variable); refresh token in HttpOnly cookie

## Overview

This feature implements a fully self-managed authentication system using the existing PostgreSQL database. Users can sign up and sign in with email/password credentials, with optional social authentication via Google and Microsoft OAuth providers. All user data, sessions, and tokens are stored and managed locally without external identity providers.

### Existing Implementation Reference

Branch `010-user-signup` contains substantial implementation that this spec documents:

| Component | File | Status |
|-----------|------|--------|
| Auth endpoints | `backend/src/functions/auth.ts` | Complete - signup, signin, refresh, logout |
| JWT service | `backend/src/utils/jwt.ts` | Complete - 15m access tokens, 7-day refresh tokens |
| Password utilities | `backend/src/utils/password.ts` | Complete - bcrypt, HIBP breach check, validation |
| Tests | `backend/tests/` | 89 tests passing (jwt: 31, password: 30, auth: 28) |

**Implementation approach**: Merge/cherry-pick from `010-user-signup`, then fill gaps (OAuth, session management UI).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Email/Password Sign Up (Priority: P1) 🎯 MVP

A new visitor arrives at the application and wants to create an account. They provide their email address and choose a password. The system validates the email format, checks password strength requirements, and creates their account. The user receives a verification email and must click the link to activate their account before signing in.

**Why this priority**: This is the foundational authentication flow. Without account creation, users cannot access the application. Email/password is the most common and expected authentication method.

**Independent Test**: Navigate to signup page, enter valid email and password, submit form, receive verification email, click verification link, sign in successfully with new credentials.

**Acceptance Scenarios**:

1. **Given** a visitor on the signup page, **When** they enter a valid email and password meeting requirements, **Then** an account is created and verification email is sent
2. **Given** a user with unverified email, **When** they click the verification link, **Then** their account is activated and they can sign in
3. **Given** a visitor with an existing email, **When** they try to sign up, **Then** they see a message that the email is already registered with option to sign in or reset password
4. **Given** a visitor entering a weak password, **When** they submit the form, **Then** they see specific feedback about password requirements not met

---

### User Story 2 - Email/Password Sign In (Priority: P1) 🎯 MVP

A registered user returns to the application and wants to sign in. They enter their email and password. The system validates credentials and issues a session token. The user is redirected to their dashboard.

**Why this priority**: Sign in is equally critical as sign up - users must be able to access their accounts.

**Independent Test**: With existing verified account, navigate to sign in page, enter credentials, successfully access protected dashboard.

**Acceptance Scenarios**:

1. **Given** a verified user with correct credentials, **When** they sign in, **Then** they receive a session and are redirected to the dashboard
2. **Given** a user with incorrect password, **When** they attempt to sign in, **Then** they see an error message without revealing whether email exists
3. **Given** an unverified user, **When** they attempt to sign in, **Then** they are prompted to verify their email with option to resend verification
4. **Given** a user who has forgotten their password, **When** they click "Forgot Password", **Then** they can initiate a password reset flow

---

### User Story 3 - Password Reset (Priority: P1) 🎯 MVP

A user has forgotten their password and needs to regain access to their account. They request a password reset, receive an email with a secure link, and set a new password.

**Why this priority**: Password reset is essential for account recovery and user retention. Without it, users who forget passwords are permanently locked out.

**Independent Test**: Click "Forgot Password", enter registered email, receive reset email, click link, set new password, sign in with new password.

**Acceptance Scenarios**:

1. **Given** a registered user who forgot their password, **When** they request a reset for their email, **Then** a reset link is sent to their email
2. **Given** a user with a valid reset link, **When** they set a new password, **Then** the password is updated and they can sign in
3. **Given** a reset link older than 1 hour, **When** the user tries to use it, **Then** they see an expiration message with option to request new link
4. **Given** an unregistered email, **When** someone requests a reset, **Then** no email is sent but the same confirmation message is shown (to prevent email enumeration)

---

### User Story 4 - Google Social Sign In (Priority: DEFERRED)

> **Note**: Deferred to future feature iteration. Keeping story for reference.

A user prefers to sign in using their Google account rather than creating a separate password. They click "Sign in with Google", authenticate with Google, and are either signed in to their existing linked account or a new account is created.

**Why this priority**: Social login improves conversion by reducing friction. Google is the most widely used social provider.

**Independent Test**: Click "Sign in with Google", complete Google OAuth flow, arrive at dashboard with account created/linked.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they sign in with Google, **Then** an account is created using their Google profile and they are signed in
2. **Given** an existing user with same email, **When** they sign in with Google for first time, **Then** their accounts are linked and they are signed in
3. **Given** a returning user who signed up with Google, **When** they sign in with Google, **Then** they are signed in to their existing account
4. **Given** a user who denies Google permission, **When** the OAuth flow is cancelled, **Then** they are returned to sign in page with option to try again

---

### User Story 5 - Microsoft Social Sign In (Priority: DEFERRED)

> **Note**: Deferred to future feature iteration. Keeping story for reference.

A user prefers to sign in using their Microsoft account. The flow mirrors Google social sign in but uses Microsoft OAuth.

**Why this priority**: Microsoft accounts are common in enterprise/professional contexts and complement Google coverage.

**Independent Test**: Click "Sign in with Microsoft", complete Microsoft OAuth flow, arrive at dashboard with account created/linked.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they sign in with Microsoft, **Then** an account is created using their Microsoft profile and they are signed in
2. **Given** an existing user with same email, **When** they sign in with Microsoft for first time, **Then** their accounts are linked and they are signed in
3. **Given** a returning user who signed up with Microsoft, **When** they sign in with Microsoft, **Then** they are signed in to their existing account

---

### User Story 6 - Sign Out (Priority: P1)

A signed-in user wants to end their session. They click sign out and their session is terminated, requiring re-authentication for future access.

**Why this priority**: Sign out is essential for security, especially on shared devices.

**Independent Test**: While signed in, click sign out, verify redirect to home page, verify protected routes require sign in again.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they click sign out, **Then** their session is invalidated and they are redirected to the home page
2. **Given** a signed-out user, **When** they try to access protected routes, **Then** they are redirected to sign in

---

### User Story 7 - Session Management (Priority: P2)

A user's session should persist appropriately across browser sessions using refresh tokens, and sessions should be revocable from account settings.

**Why this priority**: Good session management balances security with user convenience.

**Independent Test**: Sign in, close browser, reopen, verify still signed in. Then revoke session and verify signed out.

**Acceptance Scenarios**:

1. **Given** a signed-in user who closes their browser, **When** they return within 7 days, **Then** they remain signed in via refresh token
2. **Given** a signed-in user inactive for more than 7 days, **When** they return, **Then** they must sign in again
3. **Given** a user viewing their active sessions, **When** they revoke a session, **Then** that session is immediately invalidated

---

### Edge Cases

- **Invalid email format**: User enters malformed email → Show inline validation error before submission
- **Password too weak**: Password doesn't meet requirements → Show specific missing requirements
- **Rate limiting**: Multiple failed sign-in attempts → Implement exponential backoff and temporary lockout after 5 failures
- **Concurrent sessions**: User signs in from multiple devices → Allow multiple sessions, each independently revocable
- **OAuth provider unavailable**: Google/Microsoft OAuth fails → Show error with option to use email/password
- **Email delivery failure**: Verification/reset email fails to send → Log error, show user-friendly message with retry option
- **Token tampering**: Invalid or expired JWT presented → Return 401, require fresh authentication
- **Account linking conflict**: OAuth email matches existing account with different provider → Prompt user to sign in with original method first to link accounts

## Requirements *(mandatory)*

### Functional Requirements

#### Account Creation

- **FR-001**: System MUST allow users to create accounts with email and password
- **FR-002**: System MUST validate email format per RFC 5322 standard
- **FR-003**: System MUST enforce password requirements: minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character
- **FR-004**: System MUST hash passwords using bcrypt with cost factor of 12 or higher
- **FR-005**: System MUST send verification email upon account creation
- **FR-006**: System MUST prevent sign in until email is verified
- **FR-007**: System MUST allow resending verification email (rate limited to 3 per hour)

#### Authentication

- **FR-008**: System MUST authenticate users via email and password
- **FR-009**: System MUST issue JWT access tokens with 15-minute expiration
- **FR-010**: System MUST issue refresh tokens with 7-day expiration for session persistence
- **FR-011**: System MUST store refresh tokens securely (hashed) in database
- **FR-012**: System MUST invalidate refresh tokens on sign out
- **FR-013**: System MUST implement rate limiting: 5 failed attempts triggers 15-minute lockout
- **FR-014**: System MUST NOT reveal whether an email exists in error messages (prevent enumeration)

#### Password Reset

- **FR-015**: System MUST allow users to request password reset via email
- **FR-016**: System MUST generate secure, single-use reset tokens with 1-hour expiration
- **FR-017**: System MUST invalidate reset token after successful password change
- **FR-018**: System MUST invalidate all existing sessions after password reset

#### Social Authentication (Optional)

- **FR-019**: System SHOULD support Google OAuth 2.0 sign in
- **FR-020**: System SHOULD support Microsoft OAuth 2.0 sign in
- **FR-021**: System MUST create new account if OAuth email not found
- **FR-022**: System MUST link OAuth to existing account if email matches
- **FR-023**: System MUST store OAuth provider and provider user ID for linked accounts
- **FR-024**: System MUST allow users to unlink social accounts if they have password set

#### Session Management

- **FR-025**: System MUST support multiple concurrent sessions per user
- **FR-026**: Users MUST be able to view their active sessions
- **FR-027**: Users MUST be able to revoke individual sessions
- **FR-028**: System MUST invalidate all sessions when user changes password

#### Security

- **FR-029**: System MUST use HTTPS for all authentication endpoints
- **FR-030**: System MUST include CSRF protection for all state-changing operations
- **FR-031**: System MUST log all authentication events for audit purposes
- **FR-032**: System MUST implement secure cookie settings (HttpOnly, Secure, SameSite)

### Key Entities

- **User**: Core identity entity containing email, hashed password, email verification status, and timestamps. Links to auth providers and sessions.
- **AuthProvider**: Represents a linked OAuth provider (Google/Microsoft) with provider name, provider user ID, and access tokens.
- **RefreshToken**: Stores hashed refresh tokens with expiration, device info, and revocation status. Linked to User.
- **PasswordResetToken**: Stores hashed reset tokens with expiration and used status. Linked to User.
- **EmailVerificationToken**: Stores hashed verification tokens with expiration. Linked to User.
- **AuthEvent**: Audit log of authentication events (sign in, sign out, failed attempts, password changes) with timestamps and IP addresses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete email/password sign up in under 2 minutes (excluding email verification time)
- **SC-002**: Users can complete sign in within 5 seconds under normal load
- **SC-003**: 95% of password reset emails are delivered within 1 minute
- **SC-004**: System handles 100 concurrent authentication requests without degradation
- **SC-005**: Failed sign-in attempts are logged with 100% accuracy for security audit
- **SC-006**: Social sign in (when enabled) completes OAuth flow in under 10 seconds
- **SC-007**: Session refresh operations complete transparently without user-visible delay
- **SC-008**: Zero plaintext passwords stored in database or logs

## Assumptions

- PostgreSQL database is available and accessible
- **Azure Communication Services (ACS)** Email is configured for sending verification and reset emails
- HTTPS is configured for the application
- For social auth: Google Cloud Console and Microsoft Azure Portal projects are configured with OAuth credentials
- Frontend stores access tokens in memory (JS variable) for XSS protection; refresh tokens handled via HttpOnly cookies

## Out of Scope

- **Social OAuth (Google/Microsoft)** - Deferred to future feature iteration (see User Stories 4 & 5 for reference)
- Multi-factor authentication (MFA) - can be added in future iteration
- Admin user management interface
- Account deletion/GDPR compliance features
- Magic link (passwordless) authentication
- Phone number verification
- Remember me / "stay signed in" longer than 7 days
