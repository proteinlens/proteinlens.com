# Quickstart: User Authentication (Azure Entra External ID)

This guide provides setup and testing instructions for the user authentication feature using Azure Entra External ID (B2C) with MSAL in the SPA and JWT validation in Azure Functions.

## Prerequisites

### Azure Resources
- Azure Entra External ID tenant (B2C)
- User flows configured:
  - `B2C_1_signup_signin` - Combined signup/signin flow
  - `B2C_1_password_reset` - Password reset flow
  - `B2C_1_email_verification` - Email verification (optional, can be part of signup)
- Application registrations:
  - **SPA App** (public client): Redirect URIs for local dev and production
  - **API App**: Expose scopes for API access

### Required Environment Variables

#### Backend (`backend/.env`)
```bash
# Azure Entra External ID / B2C configuration
AUTH_ISSUER=https://<tenant-name>.b2clogin.com/<tenant-id>/v2.0/
AUTH_AUDIENCE=<api-app-client-id>
AUTH_JWKS_URI=https://<tenant-name>.b2clogin.com/<tenant-name>.onmicrosoft.com/<policy-name>/discovery/v2.0/keys
```

#### Frontend (`frontend/.env`)
```bash
# MSAL configuration
VITE_AUTH_AUTHORITY=https://<tenant-name>.b2clogin.com/<tenant-name>.onmicrosoft.com/<policy-name>
VITE_AUTH_CLIENT_ID=<spa-app-client-id>
VITE_AUTH_REDIRECT_URI=http://localhost:5173
```

---

## Backend Implementation

### 1. Auth Config (`backend/src/utils/authConfig.ts`)
Loads JWT validation configuration from environment variables.

### 2. Auth Service (`backend/src/services/authService.ts`)
- `validateBearerToken(token)`: Validates JWT signature, issuer, audience, expiration
- `getOrCreateLocalUser(verifiedUser)`: Maps external identity to local User record

### 3. Auth Guard (`backend/src/middleware/authGuard.ts`)
Middleware that enforces authentication on protected routes:
```typescript
import { requireAuth, isAuthFailure } from '../middleware/authGuard.js';

const auth = await requireAuth(request);
if (isAuthFailure(auth)) {
  return auth.response; // 401 with error details
}
const { user, token } = auth.ctx;
```

### 4. Protected Endpoint (`GET /me`)
Returns the authenticated user's profile:
```json
{
  "id": "uuid",
  "externalId": "azure-oid",
  "email": "user@example.com",
  "plan": "FREE"
}
```

---

## Frontend Implementation

### 1. Auth Provider (`frontend/src/contexts/AuthProvider.tsx`)
MSAL wrapper providing:
- `isAuthenticated`, `isLoading`, `user` state
- `login()`, `logout()` actions
- `getAccessToken()` for API calls
- `resendVerificationEmail()` for unverified users
- Session management (30m inactivity, 7d absolute timeout)

### 2. Protected Routes (`frontend/src/components/ProtectedRoute.tsx`)
Guards routes requiring authentication:
```tsx
<Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
```
Redirects to `/signin?returnTo=<path>` if not authenticated.

### 3. Auth Pages
- `/signin` - Sign in with existing account
- `/signup` - Create new account
- `/reset-password` - Request password reset

### 4. API Integration (`frontend/src/services/api.ts`)
- `useApiAuthHeaders()` - Hook providing Authorization header
- `fetchWithAuth(url, options)` - Fetch wrapper with automatic token refresh on 401
- `useAuthenticatedFetch()` - Hook for authenticated API calls

---

## Testing Flows

### Manual Testing

#### Sign Up Flow
1. Navigate to `/signup`
2. Click "Get Started Free"
3. Complete B2C signup form (email, password)
4. Verify redirected to home page as authenticated user
5. Check `/me` returns user profile

#### Sign In Flow
1. Navigate to `/signin`
2. Click "Sign In with Email"
3. Enter existing credentials
4. Verify redirected to home page
5. Access protected routes (e.g., `/history`)

#### Sign Out Flow
1. While authenticated, click sign out (in navigation)
2. Verify redirected to home page
3. Attempt to access `/history`
4. Verify redirected to `/signin?returnTo=%2Fhistory`

#### Password Reset Flow
1. Navigate to `/reset-password`
2. Click "Send Reset Link"
3. Check email for reset instructions
4. Complete reset via B2C flow
5. Sign in with new password

### Session Management Testing
- **Inactivity timeout**: Leave app idle for 30+ minutes, verify session expires
- **Absolute timeout**: After 7 days, verify session expires regardless of activity
- **Token refresh**: Make API call after token expires, verify automatic refresh

### Automated Testing
```bash
# Backend integration tests
npm -w backend run test:integration

# Frontend component tests
npm -w frontend run test

# E2E tests (if configured)
npm -w frontend run test:e2e
```

---

## Telemetry

Authentication events are tracked to Application Insights:

### Backend Events (via `auditService.ts`)
- `auth.signup` - New user registration
- `auth.login` - Successful login
- `auth.logout` - User sign out
- `auth.reset_requested` - Password reset initiated
- `auth.reset_completed` - Password reset completed
- `auth.verify_sent` - Verification email sent
- `auth.verify_completed` - Email verification completed

### Frontend Events (via `telemetry.ts`)
- `session_expired` - Session timeout (inactivity or absolute)
- `protected_route_redirect` - Unauthenticated access to protected route
- `login_attempt` - Login initiated
- `login_success` - Login completed
- `logout` - Sign out
- `token_refresh` - Access token refreshed

---

## Security Considerations

1. **PKCE**: MSAL uses PKCE for authorization code flow (no client secret in SPA)
2. **Token Storage**: MSAL stores tokens in localStorage (configurable)
3. **HTTPS**: All auth endpoints must use HTTPS in production
4. **CSP**: Content Security Policy should allow B2C domains
5. **CORS**: Backend must allow frontend origin

---

## Troubleshooting

### Common Issues

**"Token expired" errors**
- Verify clock sync between client and server
- Check token lifetimes in B2C policy configuration

**"Invalid audience" errors**
- Verify `AUTH_AUDIENCE` matches the API app's client ID
- Check scope configuration in B2C

**Redirect loop**
- Verify redirect URIs are registered in Azure AD B2C
- Check `VITE_AUTH_REDIRECT_URI` matches registered URI exactly

**CORS errors**
- Verify backend CORS configuration allows frontend origin
- Check `staticwebapp.config.json` proxy settings for local dev
