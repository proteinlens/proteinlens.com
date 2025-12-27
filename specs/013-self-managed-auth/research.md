# Research: Self-Managed Authentication

**Feature**: 013-self-managed-auth  
**Date**: 27 December 2025  
**Status**: Complete

## 1. JWT Secret Rotation Strategy

### Decision
Use `JWT_SECRET` + `JWT_SECRET_PREVIOUS` dual-key pattern with fallback verification.

### Rationale
- Simplest approach that meets Constitution XI (Zero-Downtime Key Rotation)
- No need for complex `kid` (key ID) header management
- Rotation window equals max token lifetime (7 days for refresh tokens)
- Both keys stored in Key Vault; only active key used for signing

### Implementation Notes
```typescript
// Signing: Always use current key
const key = getSecretKey('JWT_SECRET');
return new SignJWT(payload).sign(key);

// Verification: Try current first, fallback to previous
try {
  return await jwtVerify(token, getCurrentKey());
} catch (e) {
  if (hasPreviousKey()) {
    return await jwtVerify(token, getPreviousKey());
  }
  throw e;
}
```

### Rotation Workflow
1. Create new key in Key Vault as `JWT_SECRET_STAGED`
2. Promote: Copy current `JWT_SECRET` → `JWT_SECRET_PREVIOUS`, staged → active
3. Wait 7 days (max token lifetime)
4. Archive: Delete `JWT_SECRET_PREVIOUS`

---

## 2. Azure Communication Services Email

### Decision
Use `@azure/communication-email` SDK with connection string from Key Vault.

### Rationale
- Native Azure service, consistent with existing infrastructure
- Simple SDK, no SMTP configuration needed
- Cost-effective: ~$0.00025/email
- Built-in delivery tracking

### Implementation Notes
```typescript
import { EmailClient } from '@azure/communication-email';

const connectionString = process.env.ACS_EMAIL_CONNECTION_STRING;
const client = new EmailClient(connectionString);

await client.beginSend({
  senderAddress: 'noreply@proteinlens.com',
  recipients: { to: [{ address: email }] },
  content: {
    subject: 'Verify your email',
    html: verificationHtml,
    plainText: verificationText
  }
});
```

### Rate Limiting
- Verification emails: 3 per hour per user (FR-007)
- Password reset: 3 per hour per email (prevent enumeration abuse)
- Track attempts in database with `lastVerificationSent` timestamp

### Templates Required
1. **Email Verification**: "Welcome! Click to verify your account"
2. **Password Reset**: "Reset your password (link expires in 1 hour)"
3. **Password Changed**: "Your password was successfully changed"

---

## 3. HttpOnly Cookie + Memory Token Pattern

### Decision
- **Refresh token**: HttpOnly cookie with `Secure; SameSite=Strict`
- **Access token**: Memory only (Zustand/React state)
- **CSRF protection**: Double-submit cookie pattern

### Rationale
- Memory-only access tokens are immune to XSS stealing (can't be read from storage)
- HttpOnly cookies protect refresh tokens from JavaScript access
- SameSite=Strict prevents CSRF for same-origin requests
- Double-submit adds extra CSRF protection for cross-origin API calls

### Implementation Notes

**Backend (Set cookie on signin):**
```typescript
const response = {
  accessToken,
  expiresIn: 900 // 15 minutes
};

// Set refresh token as HttpOnly cookie
context.res.cookies = [{
  name: 'refresh_token',
  value: refreshToken,
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 // 7 days
}];
```

**Frontend (Token management):**
```typescript
// Store access token in memory only
const useAuthStore = create((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
}));

// On page load, call /api/auth/refresh to get new access token
// (refresh token sent automatically via cookie)
```

### CSRF Protection
Double-submit cookie pattern:
1. Backend sets `csrf_token` cookie (not HttpOnly)
2. Frontend reads cookie, sends as `X-CSRF-Token` header
3. Backend validates header matches cookie

---

## 4. Existing Implementation Gap Analysis

### Source: Branch `010-user-signup`

| File | What Exists | What's Missing |
|------|-------------|----------------|
| `auth.ts` | signup, signin, refresh, logout endpoints | Email verification flow, password reset endpoints |
| `jwt.ts` | Token generation/verification | Dual-key rotation support |
| `password.ts` | Hash, verify, validate, HIBP check | N/A - complete |

### Gap Details by Requirement

#### FR-005: Send verification email
- **Status**: ⚠️ Gap - `TODO` placeholder in signup
- **Gap**: Email service integration needed
- **Work**: Add `sendVerificationEmail()` using ACS

#### FR-006: Prevent signin until verified
- **Status**: ✅ Complete
- **Notes**: `emailVerified` check exists in signin logic

#### FR-007: Resend verification email
- **Status**: ⚠️ Partial
- **Gap**: Rate limiting logic exists; email sending not implemented
- **Work**: Add `/api/auth/resend-verification` endpoint

#### FR-015-018: Password reset flow
- **Status**: ⚠️ Partial
- **Gap**: Token generation/validation exists; email not sent
- **Work**: 
  - Add `sendPasswordResetEmail()` 
  - Add `/api/auth/forgot-password` endpoint
  - Add `/api/auth/reset-password` endpoint

#### FR-026-027: Session management
- **Status**: ❌ Missing
- **Gap**: No endpoints to list/revoke sessions
- **Work**:
  - Add `RefreshToken` model to Prisma (with device info)
  - Add `/api/auth/sessions` GET endpoint
  - Add `/api/auth/sessions/:id` DELETE endpoint

#### FR-031: Authentication audit logging
- **Status**: ⚠️ Partial
- **Gap**: Only `SignupAttempt` logging exists
- **Work**:
  - Create `AuthEvent` table
  - Log: signin_success, signin_failed, logout, password_reset, email_verified
  - Include: userId, eventType, ipAddress, userAgent, timestamp

### Priority Implementation Order

| Priority | Component | Blocks | Effort |
|----------|-----------|--------|--------|
| P0 | Email service (ACS) | FR-005, FR-007, FR-015-017 | Medium |
| P0 | JWT dual-key rotation | Constitution XI | Low |
| P1 | HttpOnly cookie pattern | Frontend token security | Medium |
| P1 | Session management endpoints | FR-026, FR-027 | Medium |
| P2 | Comprehensive audit logging | FR-031 | Low |

---

## Summary

All research tasks resolved. Key decisions:

1. **JWT Rotation**: Dual-key with fallback verification
2. **Email Service**: Azure Communication Services
3. **Token Storage**: Memory access + HttpOnly cookie refresh
4. **Gaps to Fill**: Email integration, session management, complete audit logging

Ready for Phase 1: Data Model & Contracts.
