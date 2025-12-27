# Data Model: Self-Managed Authentication

**Feature**: 013-self-managed-auth  
**Date**: 27 December 2025  
**Source**: [spec.md](spec.md), [Prisma schema](../../backend/prisma/schema.prisma)

## Entity Overview

```
┌─────────────┐      ┌──────────────────────┐
│    User     │──1:N─│    RefreshToken      │
│             │      │  (active sessions)   │
└──────┬──────┘      └──────────────────────┘
       │
       │ 1:N         ┌──────────────────────┐
       ├─────────────│ EmailVerificationToken│
       │             └──────────────────────┘
       │ 1:N         ┌──────────────────────┐
       ├─────────────│  PasswordResetToken  │
       │             └──────────────────────┘
       │ 1:N         ┌──────────────────────┐
       └─────────────│     AuthEvent        │
                     │   (audit log)        │
                     └──────────────────────┘
```

## Entities

### User (Extended)

Core identity entity. Already exists in schema; auth fields highlighted.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | Auto-generated |
| email | VARCHAR(320) | UNIQUE, NOT NULL | Primary identifier |
| passwordHash | VARCHAR(255) | NULL | bcrypt hash (cost 12) |
| authProvider | ENUM | DEFAULT 'LOCAL' | LOCAL, GOOGLE, MICROSOFT |
| oauthProviderId | VARCHAR(255) | NULL | Provider's user ID |
| emailVerified | BOOLEAN | DEFAULT false | Must be true to signin |
| createdAt | TIMESTAMP | NOT NULL | Auto |
| updatedAt | TIMESTAMP | NOT NULL | Auto |

**Validation Rules**:
- `email`: RFC 5322 format, case-insensitive uniqueness (stored lowercase)
- `passwordHash`: Required when `authProvider = LOCAL`
- `oauthProviderId`: Required when `authProvider != LOCAL`

---

### RefreshToken

Stores hashed refresh tokens for session management.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | Auto-generated |
| userId | UUID | FK → User | Cascade delete |
| tokenHash | VARCHAR(64) | UNIQUE | SHA-256 hash |
| deviceInfo | VARCHAR(255) | NULL | User-Agent / device identifier |
| ipAddress | VARCHAR(45) | NULL | IPv4/IPv6 |
| expiresAt | TIMESTAMP | NOT NULL | 7 days from creation |
| revokedAt | TIMESTAMP | NULL | Set when user revokes |
| createdAt | TIMESTAMP | NOT NULL | Auto |

**Indexes**: `userId`, `tokenHash`, `expiresAt`

**State Transitions**:
```
Created → Active (normal use)
Active → Expired (expiresAt passed)
Active → Revoked (user action or password change)
```

---

### EmailVerificationToken

Single-use tokens for email verification.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | Auto-generated |
| userId | UUID | FK → User | Cascade delete |
| tokenHash | VARCHAR(64) | UNIQUE | SHA-256 hash |
| expiresAt | TIMESTAMP | NOT NULL | 24 hours from creation |
| usedAt | TIMESTAMP | NULL | Set when verified |
| createdAt | TIMESTAMP | NOT NULL | Auto |

**Indexes**: `userId`, `tokenHash`

**State Transitions**:
```
Created → Pending (sent to user)
Pending → Used (user clicked link, email verified)
Pending → Expired (24h passed)
```

---

### PasswordResetToken

Single-use tokens for password reset.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | Auto-generated |
| userId | UUID | FK → User | Cascade delete |
| tokenHash | VARCHAR(64) | UNIQUE | SHA-256 hash |
| expiresAt | TIMESTAMP | NOT NULL | 1 hour from creation |
| usedAt | TIMESTAMP | NULL | Set when password changed |
| createdAt | TIMESTAMP | NOT NULL | Auto |

**Indexes**: `userId`, `tokenHash`

**State Transitions**:
```
Created → Pending (sent to user)
Pending → Used (password successfully reset)
Pending → Expired (1h passed)
```

---

### AuthEvent (NEW - Required for FR-031)

Audit log for all authentication events.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | Auto-generated |
| userId | UUID | FK → User, NULL | NULL for failed signins with unknown email |
| email | VARCHAR(320) | NOT NULL | Email attempted (for failed signin logs) |
| eventType | ENUM | NOT NULL | See enum below |
| ipAddress | VARCHAR(45) | NOT NULL | Request IP |
| userAgent | VARCHAR(500) | NULL | Browser info |
| metadata | JSONB | NULL | Event-specific data |
| createdAt | TIMESTAMP | NOT NULL | Auto |

**Event Types** (AuthEventType enum):
```
SIGNUP_SUCCESS
SIGNUP_FAILED
SIGNIN_SUCCESS
SIGNIN_FAILED
SIGNOUT
EMAIL_VERIFIED
PASSWORD_RESET_REQUESTED
PASSWORD_RESET_SUCCESS
SESSION_REVOKED
PASSWORD_CHANGED
```

**Indexes**: `userId`, `eventType`, `createdAt`, `(email, createdAt)`

---

### SignupAttempt (Existing)

Already exists in schema. Used for rate limiting and abuse detection.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| email | VARCHAR(320) | Attempted email |
| ipAddress | VARCHAR(45) | Request IP |
| userAgent | VARCHAR(500) | Browser info |
| outcome | ENUM | SUCCESS, VALIDATION_ERROR, etc. |
| failureReason | VARCHAR(200) | Human-readable |
| createdAt | TIMESTAMP | Auto |

---

## Prisma Schema Addition

```prisma
// ===========================================
// Auth Event Type (Feature 013)
// ===========================================

enum AuthEventType {
  SIGNUP_SUCCESS
  SIGNUP_FAILED
  SIGNIN_SUCCESS
  SIGNIN_FAILED
  SIGNOUT
  EMAIL_VERIFIED
  PASSWORD_RESET_REQUESTED
  PASSWORD_RESET_SUCCESS
  SESSION_REVOKED
  PASSWORD_CHANGED
}

// ===========================================
// Auth Event Audit Log (Feature 013)
// ===========================================

model AuthEvent {
  id              String          @id @default(uuid())
  
  userId          String?         // NULL for failed signin with unknown email
  user            User?           @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  email           String          @db.VarChar(320)
  eventType       AuthEventType
  ipAddress       String          @db.VarChar(45)
  userAgent       String?         @db.VarChar(500)
  metadata        Json?           // Event-specific data (e.g., failureReason)
  
  createdAt       DateTime        @default(now())
  
  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
  @@index([email, createdAt])
}
```

**User model addition**:
```prisma
model User {
  // ... existing fields ...
  authEvents      AuthEvent[]
}
```

---

## Key Constraints Summary

| Constraint | Implementation |
|------------|----------------|
| One user per email | UNIQUE index on `User.email` (case-insensitive) |
| Token single-use | `usedAt` timestamp prevents reuse |
| Token expiration | `expiresAt` checked on every validation |
| Session revocation | `revokedAt` timestamp, checked on refresh |
| Cascade delete | All tokens deleted when User deleted |
| Audit trail | AuthEvent with SetNull keeps history even if user deleted |

---

## Migration Notes

1. **AuthEventType enum**: Add to schema
2. **AuthEvent model**: Create new table
3. **User.authEvents relation**: Add to existing User model
4. **No breaking changes**: All additions are optional/new tables
