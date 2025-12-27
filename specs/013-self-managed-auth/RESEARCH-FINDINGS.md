# Self-Managed Authentication Research Findings

**Date:** December 27, 2025  
**Scope:** TypeScript/Azure Functions with `jose` library, PostgreSQL, Prisma ORM

---

## 1. JWT Secret Rotation Strategy (Dual-Key)

### Decision
Implement dual-key JWT secret rotation with `JWT_SECRET` (current) and `JWT_SECRET_PREVIOUS` (old key during rotation window).

### Rationale
- **Zero-downtime**: Tokens signed with old key remain valid during rotation window
- **Simple implementation**: No need for key versioning headers (`kid`)
- **jose library support**: `jwtVerify` can accept multiple keys for verification
- **Industry standard**: Similar to how Auth0, Firebase handle key rotation

### Implementation Notes

```typescript
// jwt.ts modifications for dual-key support
import { SignJWT, jwtVerify, JWTPayload, errors as joseErrors, decodeJwt } from 'jose';

interface SecretKeys {
  current: Uint8Array;
  previous?: Uint8Array;
}

let cachedKeys: SecretKeys | null = null;

function getSecretKeys(): SecretKeys {
  if (!cachedKeys) {
    const current = process.env.JWT_SECRET;
    const previous = process.env.JWT_SECRET_PREVIOUS; // Optional
    
    if (!current || current.length < 64) {
      throw new TokenError('JWT_SECRET must be at least 64 characters (for HS256)', 'MISSING_SECRET', 500);
    }
    
    cachedKeys = {
      current: new TextEncoder().encode(current),
      previous: previous ? new TextEncoder().encode(previous) : undefined,
    };
  }
  return cachedKeys;
}

// Always sign with CURRENT key
export async function generateAccessToken(user: UserTokenData): Promise<string> {
  const keys = getSecretKeys();
  return new SignJWT({ userId: user.userId, email: user.email, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('proteinlens')
    .setAudience('proteinlens-api')
    .setExpirationTime('15m')
    .sign(keys.current);
}

// Verify with CURRENT first, fallback to PREVIOUS
export async function verifyToken(token: string, expectedType: 'access' | 'refresh'): Promise<TokenPayload> {
  const keys = getSecretKeys();
  
  // Try current key first
  try {
    const { payload } = await jwtVerify(token, keys.current, {
      issuer: 'proteinlens',
      audience: 'proteinlens-api',
    });
    return validatePayload(payload, expectedType);
  } catch (currentError) {
    // If previous key exists, try it
    if (keys.previous && !(currentError instanceof joseErrors.JWTExpired)) {
      try {
        const { payload } = await jwtVerify(token, keys.previous, {
          issuer: 'proteinlens',
          audience: 'proteinlens-api',
        });
        return validatePayload(payload, expectedType);
      } catch {
        // Fall through to throw original error
      }
    }
    throw mapJoseError(currentError);
  }
}
```

**Rotation Procedure:**
1. Generate new 64+ character secret: `openssl rand -hex 64`
2. Set `JWT_SECRET_PREVIOUS` = current `JWT_SECRET` value
3. Set `JWT_SECRET` = new secret
4. Deploy changes
5. Wait > 7 days (max refresh token lifetime)
6. Remove `JWT_SECRET_PREVIOUS`

**Key Vault Integration:**
```bash
# Store both secrets in Key Vault
az keyvault secret set --vault-name proteinlens-kv --name JWT-SECRET --value "$(openssl rand -hex 64)"
az keyvault secret set --vault-name proteinlens-kv --name JWT-SECRET-PREVIOUS --value "<old-value>"
```

---

## 2. Azure Communication Services Email

### Decision
Use `@azure/communication-email` SDK with connection string from Key Vault. Implement rate limiting at database level and use HTML templates with plaintext fallback.

### Rationale
- **Native Azure service**: Better integration with Azure Functions, built-in scaling
- **Managed service**: No SMTP server management, automatic retries
- **Cost effective**: ~$0.00025 per email for first 50K/month
- **Compliance**: GDPR-compliant EU data residency options

### Implementation Notes

**Connection String Management:**
```typescript
// services/email.ts
import { EmailClient, EmailMessage, KnownEmailSendStatus } from '@azure/communication-email';

let emailClient: EmailClient | null = null;

function getEmailClient(): EmailClient {
  if (!emailClient) {
    // Connection string should come from Key Vault via App Configuration
    const connectionString = process.env.ACS_EMAIL_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('ACS_EMAIL_CONNECTION_STRING not configured');
    }
    emailClient = new EmailClient(connectionString);
  }
  return emailClient;
}

export interface EmailResult {
  messageId: string;
  status: 'Succeeded' | 'Failed' | 'Canceled';
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  plainTextBody: string
): Promise<EmailResult> {
  const client = getEmailClient();
  
  const message: EmailMessage = {
    senderAddress: process.env.ACS_SENDER_EMAIL || 'noreply@proteinlens.com',
    recipients: {
      to: [{ address: to }],
    },
    content: {
      subject,
      html: htmlBody,
      plainText: plainTextBody,
    },
  };

  // Long-running operation with polling
  const poller = await client.beginSend(message);
  const result = await poller.pollUntilDone();
  
  return {
    messageId: result.id,
    status: result.status as EmailResult['status'],
  };
}
```

**Rate Limiting (Database-Level):**
```typescript
// Already implemented in auth.ts with EmailVerificationToken and PasswordResetToken tables
// Current limits:
// - Email verification: 5 per hour per user
// - Password reset: 3 per hour per user

// Additional IP-based rate limiting recommendation:
async function checkGlobalRateLimit(ipAddress: string, type: 'verification' | 'reset'): Promise<boolean> {
  const limit = type === 'verification' ? 10 : 5; // per hour per IP
  const windowStart = new Date(Date.now() - 60 * 60 * 1000);
  
  const count = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM (
      SELECT id FROM "EmailVerificationToken" WHERE "createdAt" >= ${windowStart}
      UNION ALL
      SELECT id FROM "PasswordResetToken" WHERE "createdAt" >= ${windowStart}
    ) combined
    -- Note: Would need to add ipAddress to these tables
  `;
  
  return Number(count[0].count) < limit;
}
```

**Email Templates:**

```typescript
// services/emailTemplates.ts
export function getVerificationEmailTemplate(
  firstName: string,
  verificationUrl: string
): { html: string; plainText: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://www.proteinlens.com/logo.png" alt="ProteinLens" style="height: 40px;">
  </div>
  
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Verify your email address</h1>
  
  <p>Hi ${firstName},</p>
  
  <p>Thanks for signing up for ProteinLens! Please verify your email address by clicking the button below:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verificationUrl}" 
       style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
      Verify Email Address
    </a>
  </div>
  
  <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
  
  <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px;">
    Can't click the button? Copy and paste this URL into your browser:<br>
    <a href="${verificationUrl}" style="color: #10b981; word-break: break-all;">${verificationUrl}</a>
  </p>
</body>
</html>`;

  const plainText = `
Verify your email address

Hi ${firstName},

Thanks for signing up for ProteinLens! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.
`;

  return { html, plainText };
}

export function getPasswordResetEmailTemplate(
  firstName: string,
  resetUrl: string
): { html: string; plainText: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://www.proteinlens.com/logo.png" alt="ProteinLens" style="height: 40px;">
  </div>
  
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Reset your password</h1>
  
  <p>Hi ${firstName},</p>
  
  <p>We received a request to reset your password. Click the button below to choose a new password:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" 
       style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
      Reset Password
    </a>
  </div>
  
  <p style="color: #666; font-size: 14px;"><strong>This link will expire in 1 hour.</strong></p>
  
  <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px;">
    Can't click the button? Copy and paste this URL into your browser:<br>
    <a href="${resetUrl}" style="color: #ef4444; word-break: break-all;">${resetUrl}</a>
  </p>
</body>
</html>`;

  const plainText = `
Reset your password

Hi ${firstName},

We received a request to reset your password. Click the link below to choose a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
`;

  return { html, plainText };
}
```

**Key Vault Setup:**
```bash
# Store connection string in Key Vault
az keyvault secret set \
  --vault-name proteinlens-kv \
  --name ACS-EMAIL-CONNECTION-STRING \
  --value "endpoint=https://<resource>.communication.azure.com/;accesskey=<key>"

# Reference in App Configuration
az appconfig kv set-keyvault \
  --name proteinlens-config \
  --key ACS_EMAIL_CONNECTION_STRING \
  --secret-identifier "https://proteinlens-kv.vault.azure.net/secrets/ACS-EMAIL-CONNECTION-STRING"
```

---

## 3. HttpOnly Cookie + Memory Token Pattern

### Decision
Store refresh tokens in HttpOnly cookies with `Secure; SameSite=Strict`. Store access tokens in memory only (JavaScript variable). Implement CSRF protection with double-submit cookie pattern.

### Rationale
- **XSS protection**: HttpOnly cookies cannot be accessed by JavaScript
- **CSRF protection**: SameSite=Strict prevents cross-site request forgery
- **No localStorage**: Access tokens in memory eliminated XSS token theft
- **Graceful degradation**: Page refresh triggers silent token refresh via cookie

### Implementation Notes

**Backend Cookie Handling:**
```typescript
// utils/cookies.ts
import { HttpResponseInit, Cookie } from '@azure/functions';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  path?: string;
  domain?: string;
}

const REFRESH_TOKEN_COOKIE = 'proteinlens_refresh';
const CSRF_TOKEN_COOKIE = 'proteinlens_csrf';

export function setRefreshTokenCookie(refreshToken: string, expiresAt: Date): Cookie {
  const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/api/auth',  // Only sent to auth endpoints
    maxAge,
  };
}

export function clearRefreshTokenCookie(): Cookie {
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/api/auth',
    maxAge: 0,
  };
}

// CSRF token - NOT HttpOnly so JS can read it
export function setCsrfTokenCookie(csrfToken: string): Cookie {
  return {
    name: CSRF_TOKEN_COOKIE,
    value: csrfToken,
    httpOnly: false,  // JS needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24,  // 24 hours
  };
}

export function getRefreshTokenFromCookie(request: HttpRequest): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = parseCookies(cookieHeader);
  return cookies[REFRESH_TOKEN_COOKIE] || null;
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=');
    }
  });
  return cookies;
}
```

**Modified Signin Response:**
```typescript
// In auth.ts signin handler
async function signin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  // ... existing validation and authentication logic ...

  const tokens = await generateTokenPair({ userId: user.id, email: user.email! });
  
  // Generate CSRF token
  const csrfToken = generateSecureToken(32);

  // Store refresh token hash in database
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(tokens.refreshToken),
      csrfTokenHash: hashToken(csrfToken),  // NEW: Store CSRF hash
      deviceInfo: userAgent?.substring(0, 255),
      ipAddress,
      expiresAt: tokens.refreshExpiresAt,
    },
  });

  return {
    status: 200,
    cookies: [
      setRefreshTokenCookie(tokens.refreshToken, tokens.refreshExpiresAt),
      setCsrfTokenCookie(csrfToken),
    ],
    jsonBody: {
      accessToken: tokens.accessToken,  // Only returned in response body, NOT cookie
      expiresIn: tokens.expiresIn,
      csrfToken,  // Also in body for initial storage
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
      },
    },
  };
}
```

**Frontend Token Management:**
```typescript
// frontend/src/services/authService.ts
import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  csrfToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (accessToken: string, csrfToken: string, user: User) => void;
  clearAuth: () => void;
  refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,  // MEMORY ONLY - never persisted
  csrfToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (accessToken, csrfToken, user) => {
    set({
      accessToken,
      csrfToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: () => {
    set({
      accessToken: null,
      csrfToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  refreshToken: async () => {
    try {
      const { csrfToken } = get();
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',  // Send cookies
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',  // CSRF protection
        },
      });

      if (!response.ok) {
        get().clearAuth();
        return false;
      }

      const data = await response.json();
      set({
        accessToken: data.accessToken,
        csrfToken: data.csrfToken || get().csrfToken,
        isAuthenticated: true,
      });
      
      return true;
    } catch {
      get().clearAuth();
      return false;
    }
  },
}));

// Auto-refresh on page load
export async function initializeAuth(): Promise<void> {
  const store = useAuthStore.getState();
  
  // Try to refresh token using cookie
  const success = await store.refreshToken();
  
  if (!success) {
    store.clearAuth();
  }
}

// Setup token refresh interval
export function setupTokenRefresh(): () => void {
  const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (before 15min access token expires)
  
  const intervalId = setInterval(async () => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated) {
      await store.refreshToken();
    }
  }, REFRESH_INTERVAL);

  return () => clearInterval(intervalId);
}
```

**CSRF Protection Middleware:**
```typescript
// middleware/csrf.ts
import { HttpRequest } from '@azure/functions';
import { getRefreshTokenFromCookie, parseCookies } from '../utils/cookies.js';
import { prisma } from '../utils/prisma.js';
import { hashRefreshToken, hashToken } from '../utils/password.js';

export async function validateCsrfToken(request: HttpRequest): Promise<boolean> {
  // CSRF only needed for state-changing operations using cookies
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return true; // No cookies = no CSRF risk
  
  const csrfHeader = request.headers.get('x-csrf-token');
  if (!csrfHeader) return false;
  
  const refreshToken = getRefreshTokenFromCookie(request);
  if (!refreshToken) return true; // No refresh token = no session
  
  // Verify CSRF token matches stored hash
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(refreshToken) },
    select: { csrfTokenHash: true },
  });
  
  if (!storedToken?.csrfTokenHash) return false;
  
  return storedToken.csrfTokenHash === hashToken(csrfHeader);
}
```

**Page Refresh Flow:**
```
1. User loads page
2. App calls initializeAuth()
3. initializeAuth() calls POST /api/auth/refresh with credentials: 'include'
4. Server reads HttpOnly cookie, validates refresh token
5. Server returns new access token in response body
6. App stores access token in memory (Zustand state)
7. App sets up 14-minute refresh interval
```

---

## 4. Existing Implementation Gap Analysis

### Current State Summary

| Component | Status | Notes |
|-----------|--------|-------|
| `auth.ts` | ✅ Complete | signup, signin, refresh, logout, verify-email, resend-verification, forgot-password, reset-password endpoints |
| `jwt.ts` | ✅ Complete | Token generation/verification with HS256 |
| `password.ts` | ✅ Complete | Bcrypt hashing, validation, HIBP breach check |
| Schema | ✅ Complete | User, RefreshToken, EmailVerificationToken, PasswordResetToken, SignupAttempt |

### Gap Analysis by Feature Requirement

#### FR-005: Send verification email upon account creation
| Gap | Status | Implementation Needed |
|-----|--------|----------------------|
| Email service integration | ❌ Missing | Create `services/email.ts` with ACS SDK |
| Email templates | ❌ Missing | Create `services/emailTemplates.ts` |
| TODO in signup handler | ⚠️ Placeholder | Replace `context.log()` with actual email send |

**Current code (line 253):**
```typescript
// TODO: Send verification email with verificationToken
context.log(`[Auth] Verification token for ${email}: ${verificationToken}`);
```

---

#### FR-006: Prevent sign in until email is verified
| Gap | Status | Implementation Needed |
|-----|--------|----------------------|
| Email verification check | ✅ Implemented | Already blocks signin if `!user.emailVerified` |

**Current code (lines 311-320):**
```typescript
if (!user.emailVerified) {
  return {
    status: 403,
    jsonBody: {
      error: 'Please verify your email before signing in',
      code: 'EMAIL_NOT_VERIFIED',
      email: user.email,
    },
  };
}
```

---

#### FR-007: Resend verification email (rate limited)
| Gap | Status | Implementation Needed |
|-----|--------|----------------------|
| Rate limiting logic | ✅ Implemented | 5 per hour per user |
| Actual email sending | ❌ Missing | Replace `context.log()` with email service |

**Current code (lines 590-592):**
```typescript
// TODO: Send email with verificationToken
context.log(`[Auth] New verification token for ${email}: ${verificationToken}`);
```

---

#### FR-015-018: Password reset flow with email
| Gap | Status | Implementation Needed |
|-----|--------|----------------------|
| Token generation | ✅ Implemented | 1-hour expiry |
| Token validation | ✅ Implemented | In reset-password endpoint |
| Password validation | ✅ Implemented | HIBP + strength check |
| Rate limiting | ✅ Implemented | 3 per hour per user |
| Actual email sending | ❌ Missing | Replace `context.log()` with email service |

**Current code (line 711):**
```typescript
// TODO: Send email with resetToken
context.log(`[Auth] Password reset token for ${email}: ${resetToken}`);
```

---

#### FR-026-027: View and revoke active sessions
| Gap | Status | Implementation Needed |
|-----|--------|----------------------|
| List sessions endpoint | ❌ Missing | `GET /api/auth/sessions` |
| Revoke session endpoint | ❌ Missing | `DELETE /api/auth/sessions/:id` |
| Revoke all sessions | ❌ Missing | `DELETE /api/auth/sessions` |
| Device fingerprinting | ⚠️ Basic | Only stores user-agent, not parsed device info |

**Required new endpoints:**
```typescript
// GET /api/auth/sessions - List active sessions for authenticated user
app.http('auth-sessions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/sessions',
  handler: listSessions,
});

// DELETE /api/auth/sessions/:id - Revoke specific session
app.http('auth-revoke-session', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'auth/sessions/{sessionId}',
  handler: revokeSession,
});

// DELETE /api/auth/sessions - Revoke all other sessions
app.http('auth-revoke-all-sessions', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'auth/sessions/all',
  handler: revokeAllSessions,
});
```

**Implementation:**
```typescript
async function listSessions(request: HttpRequest): Promise<HttpResponseInit> {
  const token = await verifyAccessToken(request.headers.get('authorization'));
  
  const sessions = await prisma.refreshToken.findMany({
    where: {
      userId: token.userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      deviceInfo: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Parse device info for better display
  return {
    status: 200,
    jsonBody: {
      sessions: sessions.map(s => ({
        id: s.id,
        device: parseUserAgent(s.deviceInfo),
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        current: /* compare with current token */,
      })),
    },
  };
}
```

---

#### FR-031: Log all authentication events for audit
| Gap | Status | Implementation Needed |
|-----|--------|----------------------|
| SignupAttempt logging | ✅ Implemented | Records all signup attempts |
| Signin attempt logging | ❌ Missing | Need `SigninAttempt` table |
| Password reset logging | ❌ Missing | Need `PasswordResetAttempt` table |
| Session events | ⚠️ Partial | Refresh tokens have `revokedAt` but no event log |

**Schema additions needed:**
```prisma
model AuthEvent {
  id          String    @id @default(uuid())
  userId      String?
  user        User?     @relation(fields: [userId], references: [id])
  
  eventType   AuthEventType
  ipAddress   String    @db.VarChar(45)
  userAgent   String?   @db.VarChar(500)
  
  // Event-specific metadata (JSON)
  metadata    Json?
  
  success     Boolean
  failureReason String? @db.VarChar(200)
  
  createdAt   DateTime  @default(now())
  
  @@index([userId, createdAt])
  @@index([eventType, createdAt])
  @@index([ipAddress, createdAt])
}

enum AuthEventType {
  SIGNUP
  SIGNIN
  SIGNIN_FAILED
  LOGOUT
  TOKEN_REFRESH
  PASSWORD_RESET_REQUEST
  PASSWORD_RESET_SUCCESS
  EMAIL_VERIFICATION
  SESSION_REVOKED
  ALL_SESSIONS_REVOKED
}
```

**Audit logging helper:**
```typescript
// services/auditLog.ts
export async function logAuthEvent(
  eventType: AuthEventType,
  options: {
    userId?: string;
    ipAddress: string;
    userAgent?: string;
    success: boolean;
    failureReason?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await prisma.authEvent.create({
      data: {
        eventType,
        userId: options.userId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        success: options.success,
        failureReason: options.failureReason,
        metadata: options.metadata,
      },
    });
  } catch (error) {
    console.error('[Audit] Failed to log auth event:', error);
    // Don't throw - audit failures shouldn't break auth flow
  }
}
```

---

### Implementation Priority

| Priority | Feature | Effort | Reason |
|----------|---------|--------|--------|
| 🔴 P0 | Email service integration | Medium | Blocks FR-005, FR-007, FR-015-018 |
| 🔴 P0 | JWT dual-key rotation | Low | Security best practice |
| 🟡 P1 | HttpOnly cookie pattern | Medium | Security improvement |
| 🟡 P1 | Session management endpoints | Medium | FR-026-027 |
| 🟢 P2 | Comprehensive audit logging | Medium | FR-031, compliance |
| 🟢 P2 | CSRF protection | Low | Security improvement |

---

### File Changes Summary

**New files to create:**
1. `backend/src/services/email.ts` - ACS email client
2. `backend/src/services/emailTemplates.ts` - HTML/text templates
3. `backend/src/services/auditLog.ts` - Auth event logging
4. `backend/src/utils/cookies.ts` - Cookie handling utilities
5. `backend/src/middleware/csrf.ts` - CSRF validation

**Files to modify:**
1. `backend/src/utils/jwt.ts` - Add dual-key support
2. `backend/src/functions/auth.ts` - Add cookie handling, actual email sends, session endpoints
3. `backend/prisma/schema.prisma` - Add AuthEvent model, csrfTokenHash to RefreshToken

**Environment variables needed:**
```env
# Existing
JWT_SECRET=<64+ character secret>

# New
JWT_SECRET_PREVIOUS=<previous secret during rotation>
ACS_EMAIL_CONNECTION_STRING=<from Key Vault>
ACS_SENDER_EMAIL=noreply@proteinlens.com
APP_URL=https://www.proteinlens.com
```
