# Research: User Signup Process

Spec: [spec.md](./spec.md) | Plan: [plan.md](./plan.md)

## Research Tasks

Based on Technical Context analysis, the following items required clarification:

### 1. Azure B2C User Flow Configuration for Social Login

**Question**: How to configure B2C user flows to support email/password + Google + Microsoft sign-in?

**Decision**: Use Azure Entra External ID with combined "Sign up and sign in" user flow (B2C_1_signup_signin) that includes:
- Local account (email/password) as primary
- Google identity provider (via B2C federation)
- Microsoft identity provider (via B2C federation)

**Rationale**: B2C user flows handle the complexity of multi-provider authentication. The combined flow reduces friction by allowing users to sign up or sign in from the same screen. Social providers are configured as identity providers in B2C tenant, not in application code.

**Alternatives Considered**:
- Custom policies: More flexible but significantly more complex; not needed for standard flows
- Separate signup/signin flows: Creates unnecessary user friction
- Application-level OAuth: Violates Zero Secrets principle; B2C handles token exchange securely

### 2. Password Breach Checking Integration

**Question**: How to check passwords against known breach lists without sending passwords to external services?

**Decision**: Use k-Anonymity approach with Have I Been Pwned (HIBP) API:
1. Hash password with SHA-1
2. Send only first 5 characters of hash to HIBP API
3. Receive all matching hashes (anonymized)
4. Check locally if full hash appears in response

**Rationale**: k-Anonymity ensures password is never transmitted. HIBP returns ~500 hashes for each prefix, making it impossible to identify the actual password. API is free, rate-limited at 1500 requests/minute (sufficient for signup).

**Alternatives Considered**:
- Download full breach database: 12GB+, impractical for serverless
- Send full password hash: Privacy concern; hash can be reversed for common passwords
- Skip breach checking: Violates security best practices (FR-005)

**Implementation Note**: Check happens on frontend for immediate feedback; backend re-validates before account creation.

### 3. Email Typo Detection Algorithm

**Question**: How to implement "Did you mean gmail.com?" suggestion (FR-003)?

**Decision**: Use domain similarity matching with common typo patterns:
1. Extract domain from email
2. Check against known domains list (gmail.com, yahoo.com, hotmail.com, outlook.com, etc.)
3. Use Levenshtein distance ≤ 2 for suggestions
4. Common patterns: gmial→gmail, yaho→yahoo, outlok→outlook

**Rationale**: Simple algorithm covers 90%+ of typos. Levenshtein distance is fast and handles transpositions, insertions, deletions.

**Alternatives Considered**:
- External email validation API: Adds latency and dependency
- No suggestions: Leads to failed signups from typos
- Full ML model: Overkill for this problem

**Implementation**: Frontend-only, immediate feedback on blur.

### 4. CAPTCHA Integration Strategy

**Question**: When and how to implement CAPTCHA (FR-025)?

**Decision**: Use hCaptcha with conditional triggering:
- No CAPTCHA on first 3 attempts from same IP
- After 3 failed attempts: Show hCaptcha challenge
- Backend validates hCaptcha token before processing signup

**Rationale**: hCaptcha is privacy-focused (GDPR compliant), free for up to 100k verifications/month. Conditional triggering avoids friction for legitimate users while blocking bots.

**Alternatives Considered**:
- Always show CAPTCHA: Hurts conversion rates
- reCAPTCHA v3 (invisible): Google privacy concerns; less reliable detection
- No CAPTCHA: Bots can create spam accounts

### 5. Local Profile Creation Flow with B2C

**Question**: When does local User record get created for social login users?

**Decision**: Create local User record on first authenticated API call (existing pattern from 009-user-auth):
1. User completes B2C signup/signin (email or social)
2. Frontend receives tokens, calls `/api/me` endpoint
3. Backend extracts `externalId` (B2C object ID) from token
4. If no local User exists, create with profile data from token claims
5. For social logins missing name: prompt user in app to complete profile

**Rationale**: Follows existing `getOrCreateLocalUser` pattern. Token claims provide email and name for most social providers. Separate profile completion handles edge cases.

**Alternatives Considered**:
- Separate signup API: Duplicates B2C functionality
- Require all fields before B2C signup: Google/MS may not provide all fields
- Store everything in B2C: Loses ability to store app-specific data

### 6. Consent Record Storage Strategy

**Question**: How to store consent records for compliance (FR-031, FR-032)?

**Decision**: Store in PostgreSQL with the following structure:
- `ConsentRecord` table: userId, consentType (ToS/Privacy), documentVersion, timestamp, ipAddress
- One record per consent type per user
- Update on re-consent (new ToS version)
- Retain indefinitely for audit purposes

**Rationale**: Database storage enables querying for compliance reports. Separate records per consent type allow tracking when each was accepted. IP address helps verify consent authenticity.

**Alternatives Considered**:
- Store in User table: Loses history when ToS version changes
- Store in B2C custom attributes: Limited to 15 attributes; not designed for audit
- External consent management: Overkill for current scale

### 7. Real-time Validation Debouncing Strategy

**Question**: How to implement 300ms debounce for real-time validation (FR-009)?

**Decision**: Use React state with `useEffect` and `setTimeout`:
1. On input change, clear existing timeout
2. Set new timeout for 300ms
3. On timeout, trigger validation
4. Show inline error/success states
5. Use `useTransition` for non-blocking updates

**Rationale**: Standard React pattern. 300ms balances responsiveness with avoiding excessive re-renders. `useTransition` keeps UI responsive during validation.

**Alternatives Considered**:
- lodash.debounce: External dependency for trivial function
- No debounce: Excessive re-renders, poor performance
- Longer debounce: Feels sluggish to users

### 8. Form State Persistence on Error

**Question**: How to preserve form data on validation failure (FR-021)?

**Decision**: Use controlled React form with state persistence:
1. All form state in React state (not uncontrolled inputs)
2. On validation error, keep all field values
3. On network error, show retry button without clearing form
4. Use `sessionStorage` for recovery on page refresh during signup

**Rationale**: Controlled components give full control over state. sessionStorage survives page refresh but clears on tab close (appropriate for sensitive signup data).

**Alternatives Considered**:
- localStorage: Persists too long for sensitive data
- Only memory state: Lost on page refresh
- Form libraries (react-hook-form): Adds complexity; simple state sufficient

## Technology Decisions Summary

| Area | Decision | Key Dependency |
|------|----------|----------------|
| Authentication | Azure Entra External ID (B2C) | @azure/msal-browser |
| Social Login | B2C identity provider federation | B2C Portal config |
| Password Breach Check | HIBP k-Anonymity API | Frontend fetch |
| Email Typo Detection | Levenshtein distance | Custom utility |
| CAPTCHA | hCaptcha (conditional) | @hcaptcha/react-hcaptcha |
| Consent Storage | PostgreSQL (Prisma) | Prisma ConsentRecord model |
| Form Validation | React state + Zod | zod |
| Real-time Feedback | 300ms debounce + useTransition | React 18 |
