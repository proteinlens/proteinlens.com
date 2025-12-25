# Data Model: User Authentication

Spec: [specs/009-user-auth/spec.md](specs/009-user-auth/spec.md)

## Entities

### User (Prisma `User`)
- id: string (uuid)
- externalId: string (from Entra; unique)
- email: string? (optional; may be provided via claims)
- plan: Plan (FREE|PRO) [existing]
- subscriptionStatus: SubscriptionStatus? [existing]
- createdAt, updatedAt
- Indexes: externalId, plan

### Session (no DB table)
- Represented by Entra tokens (ID/Access/Refresh) handled by MSAL
- Policy: 30m inactivity, 7d absolute lifetime (via Entra policies + MSAL config)

### AuditLog (derived via existing `SubscriptionEvent` or new log table) [proposed]
- eventType: signup, login, logout, failed_login, reset_requested, reset_completed, verify_sent, verify_completed
- userId?: string
- requestId: string (UUID)
- createdAt: DateTime
- Storage: Application Insights custom events (preferred) rather than DB table

## Relationships & Transitions
- On first authenticated request with unknown `externalId`, create local `User` with `plan=FREE`.
- Password reset and verification flows occur in Entra; upon return, user is authenticated and local `User` exists or is created.
- Sign-out clears client MSAL session; backend trusts token expiry/invalid states.

## Validation & Policies
- Accept only tokens with correct `iss`/`aud` and not expired; validate signature via JWKS.
- Do not persist tokens or secrets; no secrets in client.
- Log security events (no PII) for audit and troubleshooting.
