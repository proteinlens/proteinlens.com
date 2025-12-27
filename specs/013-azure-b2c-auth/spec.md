# Feature Specification: Microsoft Entra External ID Authentication

**Feature Branch**: `013-azure-b2c-auth`  
**Created**: 2025-12-27  
**Updated**: 2025-12-27 (Pivoted from Azure AD B2C to Microsoft Entra External ID)  
**Status**: Draft  
**Input**: User description: "Microsoft Entra External ID authentication for user signup, signin, signout with Google and Microsoft social login"

> **Note**: Azure AD B2C is no longer available for new customers as of May 1, 2025. This specification uses Microsoft Entra External ID, the successor CIAM platform from Microsoft.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Signup (Priority: P1)

A new user visits the ProteinLens signup page, enters their email, password, and name, then clicks "Create account". The system redirects them to Microsoft Entra External ID for secure identity creation and email verification, then returns them to the application as an authenticated user.

**Why this priority**: Signup is the entry point to the entire application. Without working authentication, no users can access the product.

**Independent Test**: Can be fully tested by visiting /signup, completing the form, and verifying the user is redirected to External ID and back. Delivers immediate value by enabling user acquisition.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on the signup page, **When** they complete the signup form and click "Create account", **Then** they are redirected to Microsoft Entra External ID signup flow
2. **Given** a user completes External ID signup with valid email/password, **When** External ID redirects back to the app, **Then** the user is authenticated and redirected to the home page
3. **Given** a user enters an already-registered email in External ID, **When** they try to sign up, **Then** External ID displays an appropriate error message

---

### User Story 2 - Existing User Sign In (Priority: P1)

An existing user visits the login page and clicks "Sign in". The system redirects them to Microsoft Entra External ID where they authenticate with their credentials, then returns them to the application with an active session.

**Why this priority**: Sign-in is equally critical as signup for returning users to access their data and continue using the app.

**Independent Test**: Can be tested by visiting /login, clicking sign in, authenticating via External ID, and verifying session is established.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on the login page, **When** they click "Sign in", **Then** they are redirected to Microsoft Entra External ID sign-in flow
2. **Given** a user enters valid credentials in External ID, **When** authentication succeeds, **Then** the user is redirected back to the app with an active session
3. **Given** a user enters incorrect credentials, **When** authentication fails, **Then** External ID displays an appropriate error without exposing security details

---

### User Story 3 - Social Login with Google (Priority: P2)

A user chooses to sign up or sign in using their Google account. The system redirects them to Microsoft Entra External ID which federates with Google for authentication, then returns them to the application authenticated.

**Why this priority**: Social login significantly reduces signup friction and improves conversion rates, but core email/password auth must work first.

**Independent Test**: Can be tested by clicking "Continue with Google", authenticating via Google, and verifying successful redirect and session.

**Acceptance Scenarios**:

1. **Given** a user on the signup/login page, **When** they click "Continue with Google", **Then** they are redirected to Google via External ID federation
2. **Given** a user authenticates successfully with Google, **When** External ID processes the token, **Then** the user is created (if new) or signed in and redirected to the app

---

### User Story 4 - Social Login with Microsoft (Priority: P2)

A user chooses to sign up or sign in using their Microsoft account. The system redirects them to Microsoft Entra External ID which federates with Microsoft for authentication.

**Why this priority**: Microsoft login provides an alternative social provider, useful for professional users.

**Independent Test**: Can be tested by clicking "Continue with Microsoft", authenticating via Microsoft, and verifying successful redirect and session.

**Acceptance Scenarios**:

1. **Given** a user on the signup/login page, **When** they click "Continue with Microsoft", **Then** they are redirected to Microsoft via External ID federation
2. **Given** a user authenticates successfully with Microsoft, **When** External ID processes the token, **Then** the user is created (if new) or signed in and redirected to the app

---

### User Story 5 - Password Reset (Priority: P2)

A user who has forgotten their password clicks "Forgot password" and is guided through a secure password reset flow via Microsoft Entra External ID.

**Why this priority**: Password reset is essential for account recovery but lower priority than core authentication flows.

**Independent Test**: Can be tested by clicking "Forgot password", completing the External ID flow with a valid email, and verifying password can be reset.

**Acceptance Scenarios**:

1. **Given** a user on the login page, **When** they click "Forgot password", **Then** they are redirected to External ID password reset flow
2. **Given** a user enters a registered email in External ID reset flow, **When** they submit, **Then** they receive a verification code/link to reset their password
3. **Given** a user completes password reset, **When** they return to the app, **Then** they can sign in with the new password

---

### User Story 6 - Sign Out (Priority: P1)

An authenticated user clicks "Sign out" and their session is terminated both in the application and in Microsoft Entra External ID.

**Why this priority**: Secure sign-out is critical for security and must work reliably.

**Independent Test**: Can be tested by signing in, clicking sign out, and verifying the session is cleared and user cannot access protected pages.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click "Sign out", **Then** their session is terminated and they are redirected to the home page
2. **Given** a signed-out user, **When** they try to access a protected page, **Then** they are redirected to login

---

### Edge Cases

- What happens when External ID returns an error during redirect callback?
- How does the system handle expired tokens during API calls? → Silently refresh via MSAL, retry call; if refresh fails, redirect to login
- What happens if a user closes the browser during External ID flow?
- How does the system handle network failures during authentication?
- What happens when a user's session expires due to inactivity?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST integrate with Microsoft Entra External ID for user authentication
- **FR-002**: System MUST support email/password sign-up via External ID user flow
- **FR-003**: System MUST support email/password sign-in via External ID user flow
- **FR-004**: System MUST support Google social identity provider via External ID federation
- **FR-005**: System MUST support Microsoft social identity provider via External ID federation
- **FR-006**: System MUST support password reset via External ID user flow
- **FR-007**: System MUST securely store and transmit access tokens using MSAL library
- **FR-008**: System MUST handle External ID redirect callbacks and token exchange
- **FR-009**: System MUST maintain session state using localStorage with appropriate expiration
- **FR-010**: System MUST redirect unauthenticated users from protected pages to login
- **FR-011**: System MUST display clear error messages when authentication fails
- **FR-012**: System MUST sync authenticated user data with the backend User table
- **FR-013**: System MUST terminate External ID session on logout (single sign-out)
- **FR-014**: System MUST enforce password complexity: minimum 8 characters with uppercase, lowercase, and number

### Key Entities

- **External Tenant**: The Microsoft Entra External ID tenant that stores customer identities and handles authentication flows (replaces B2C tenant)
- **User Flow**: Configurable authentication experiences (sign-up, sign-in, password reset) in External ID
- **Application Registration**: The External ID app registration that defines redirect URIs and permissions
- **Identity Providers**: External identity sources (Google, Microsoft) federated with External ID
- **Access Token**: JWT issued by External ID for authenticating API requests
- **User Session**: Client-side authentication state managed by MSAL

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete signup in under 3 minutes including email verification
- **SC-002**: Users can sign in with existing credentials in under 30 seconds
- **SC-003**: Social login (Google/Microsoft) reduces signup friction with one-click authentication
- **SC-004**: 99% of authentication attempts complete without technical errors
- **SC-005**: Password reset flow can be completed within 5 minutes
- **SC-006**: Session management handles 30-minute inactivity timeout and 7-day absolute timeout correctly
- **SC-007**: Protected pages are 100% inaccessible to unauthenticated users

## Assumptions

- Azure subscription is available with permissions to create External ID tenant (requires Tenant Creator role)
- External ID tenant will be created via Microsoft Entra admin center (https://entra.microsoft.com)
- Email verification will be handled by External ID's built-in email service (one-time passcode)
- The existing MSAL configuration in the frontend is compatible with External ID (confirmed - same MSAL library)
- Google developer account is available for creating OAuth credentials
- External ID free tier (50,000 MAU) is sufficient for initial launch

## Out of Scope

- Multi-factor authentication (MFA) - can be added later via Conditional Access
- Custom External ID UI branding - will use default External ID pages initially
- API-level token validation - backend already expects Bearer tokens
- User profile management in External ID - profile updates handled by app's own API
- Admin user management in External ID portal - handled separately
- Native authentication (mobile SDK) - using browser-based redirect flow

## Clarifications

### Session 2025-12-27

- Q: Should social login providers (Google and Microsoft) be included in initial launch or deferred? → A: Include all social providers (Google + Microsoft) in initial launch
- Q: When a user's access token expires during an API call, what should happen? → A: Silently refresh token in background, retry the API call; fall back to interactive login if silent refresh fails
- Q: What password complexity requirements should be enforced for email/password signup? → A: Standard (8+ chars, uppercase, lowercase, number)
- Q: Why pivot from Azure AD B2C to External ID? → A: Azure AD B2C is discontinued for new customers as of May 1, 2025. Microsoft Entra External ID is the successor CIAM platform with all new features built on this platform.
