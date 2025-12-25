# Research: User Authentication

Date: 2025-12-25
Spec: [specs/009-user-auth/spec.md](specs/009-user-auth/spec.md)

## Decisions

### D1. Identity Provider
- Decision: Use Azure Entra External ID (B2C) with hosted user flows (signup/signin, password reset, email verification).
- Rationale: Constitution requires Entra ID or equivalent. B2C provides secure, scalable consumer auth with built-in flows and email verification.
- Alternatives considered: Custom email/password (security burden), Auth0/Cognito (third-party lock-in), GitHub/Google-only (excludes email/password use cases).

### D2. Frontend Auth Integration
- Decision: Use MSAL with PKCE in SPA; no secrets in client. Store tokens in memory with refresh support respecting 30m inactivity and 7d absolute session.
- Rationale: Compliant with Zero Secrets and session policy; mature library.
- Alternatives: Custom OAuth library (higher risk), backend session cookies (harder for SPA, adds CSRF concerns).

### D3. Backend Token Validation
- Decision: Validate JWTs from Entra on protected endpoints; map `oid`/`sub` to local `User.externalId`. No backend credential storage.
- Rationale: Least Privilege; backend trusts signed ID tokens and enforces RBAC/plan checks.
- Alternatives: Opaque sessions in DB (extra state and invalidation complexity).

### D4. Password Reset & Email Verification
- Decision: Use built-in B2C flows and email templates; backend does not issue tokens for these flows.
- Rationale: Reduces security surface and complexity.
- Alternatives: Self-managed reset tokens (more maintenance and risk).

### D5. Session Policy
- Decision: Enforce 30m inactivity and 7-day absolute lifetime via token lifetimes/refresh policies and client MSAL configuration.
- Rationale: Matches spec; balances UX and security.
- Alternatives: Shorter or longer windows (tradeoffs noted in spec).

## Best Practices & Patterns
- Token validation: cache JWKS keys, validate `aud`, `iss`, expiry, and nonce if applicable.
- Logging: record auth events in App Insights (no PII), correlate with requestId.
- Accessibility: keyboard-friendly forms, visible labels, error summaries.
- Security headers: set `SameSite`, `X-Content-Type-Options`, `Content-Security-Policy` for SPA.
- Environment: tenant IDs, client IDs in config; secrets in Key Vault/App Settings only.
