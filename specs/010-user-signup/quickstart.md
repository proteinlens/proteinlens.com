# Quickstart: User Signup Process

This guide provides setup and testing instructions for the user signup feature using Azure Entra External ID (B2C) with MSAL in the SPA.

## Prerequisites

### Azure Resources

- **Azure Entra External ID tenant** (B2C) configured per [009-user-auth quickstart](../009-user-auth/quickstart.md)
- **User flows** configured in B2C:
  - `B2C_1_signup_signin` - Combined signup/signin flow (existing from 009)
  - Enable Google and Microsoft identity providers in user flow settings

### Identity Provider Setup

#### Google Sign-In
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (Web application type)
3. Add redirect URI: `https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/oauth2/authresp`
4. In B2C Portal → Identity Providers → Add Google → Enter Client ID and Secret

#### Microsoft Sign-In
1. Go to [Azure Portal → App Registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)
2. Create new registration (Accounts in any organizational directory and personal Microsoft accounts)
3. Add redirect URI: `https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/oauth2/authresp`
4. In B2C Portal → Identity Providers → Add Microsoft → Enter Client ID and Secret

### Required Environment Variables

#### Backend (`backend/.env`)

```bash
# Existing from 009-user-auth
AUTH_ISSUER=https://<tenant>.b2clogin.com/<tenant-id>/v2.0/
AUTH_AUDIENCE=<api-app-client-id>
AUTH_JWKS_URI=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/discovery/v2.0/keys

# NEW for 010-user-signup
HCAPTCHA_SECRET=<hcaptcha-secret-key>  # From hCaptcha dashboard
TOS_VERSION=2025-01-01                  # Current Terms of Service version
PRIVACY_VERSION=2025-01-01              # Current Privacy Policy version
```

#### Frontend (`frontend/.env`)

```bash
# Existing from 009-user-auth
VITE_AUTH_AUTHORITY=https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/B2C_1_signup_signin
VITE_AUTH_CLIENT_ID=<spa-app-client-id>
VITE_AUTH_REDIRECT_URI=http://localhost:5173

# NEW for 010-user-signup
VITE_HCAPTCHA_SITE_KEY=<hcaptcha-site-key>  # From hCaptcha dashboard
VITE_TOS_URL=/terms                          # Terms of Service page URL
VITE_PRIVACY_URL=/privacy                    # Privacy Policy page URL
```

---

## Database Migration

Run Prisma migration to add new models:

```bash
cd backend

# Generate migration
npx prisma migrate dev --name add-signup-models

# Verify migration
npx prisma db push
```

New tables created:
- `ConsentRecord` - User consent tracking
- `SignupAttempt` - Signup audit log

Extended columns in `User`:
- `firstName`, `lastName`, `organizationName`, `phone`
- `emailVerified`, `profileCompleted`

---

## Local Development

### 1. Start Backend

```bash
cd backend
npm install
npm run build
npm run start
```

Backend runs on `http://localhost:7071`

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Access Signup Page

Navigate to `http://localhost:5173/signup`

---

## Testing Signup Flow

### Manual Testing Checklist

#### Email/Password Signup
1. [ ] Navigate to `/signup`
2. [ ] Enter invalid email → See validation error
3. [ ] Enter weak password → See strength indicator (red/weak)
4. [ ] Enter strong password → See strength indicator (green/strong)
5. [ ] Mismatched confirm password → See error
6. [ ] Leave required field empty → See error on submit
7. [ ] Try existing email → See "email exists" with signin/reset options
8. [ ] Accept Terms and Privacy checkboxes
9. [ ] Submit valid form → Redirected to B2C
10. [ ] Complete B2C flow → Redirected back with token
11. [ ] Check database: User created with `emailVerified=false`
12. [ ] Click verification link in email
13. [ ] Check database: User updated with `emailVerified=true`

#### Social Signup (Google)
1. [ ] Click "Continue with Google" button
2. [ ] Complete Google OAuth flow
3. [ ] If name missing: See profile completion prompt
4. [ ] Complete profile
5. [ ] Check database: User created with Google externalId

#### Social Signup (Microsoft)
1. [ ] Click "Continue with Microsoft" button
2. [ ] Complete Microsoft OAuth flow
3. [ ] If name missing: See profile completion prompt
4. [ ] Complete profile
5. [ ] Check database: User created with Microsoft externalId

### Automated Tests

```bash
# Unit tests (validation, utilities)
cd frontend && npm run test:unit
cd backend && npm run test:unit

# Integration tests (API endpoints)
cd backend && npm run test:integration

# E2E tests (full signup flow)
cd frontend && npm run test:e2e
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup/profile` | Complete profile after B2C signup |
| POST | `/api/signup/check-email` | Check email availability |
| POST | `/api/signup/validate-password` | Check password against breach list |
| POST | `/api/signup/consent` | Record user consent |
| GET | `/api/signup/consent` | Get user's consent records |
| POST | `/api/signup/resend-verification` | Resend verification email |

See [contracts/signup-api.yaml](./contracts/signup-api.yaml) for full OpenAPI spec.

---

## Troubleshooting

### "Invalid redirect URI" from B2C
- Verify redirect URI in B2C app registration matches `VITE_AUTH_REDIRECT_URI`
- For local dev: `http://localhost:5173` (not https)

### Social login button not appearing
- Check identity provider is enabled in B2C user flow
- Verify OAuth credentials are correctly configured

### Password breach check failing
- Verify backend can reach `api.pwnedpasswords.com`
- Check firewall/proxy settings

### Consent records not created
- Check `TOS_VERSION` and `PRIVACY_VERSION` env vars are set
- Verify user is authenticated (valid access token)

### Rate limit errors during testing
- SignupAttempt records may trigger rate limiting
- Delete test records: `DELETE FROM "SignupAttempt" WHERE email LIKE '%test%'`

---

## B2C User Flow Customization (Optional)

To customize the signup page appearance:

1. In B2C Portal → User flows → B2C_1_signup_signin
2. Select "Page layouts"
3. Upload custom HTML/CSS templates
4. Or use Company Branding for logo/colors

---

## Security Checklist

- [ ] HTTPS enabled in production
- [ ] hCaptcha configured with production keys
- [ ] Rate limiting tested
- [ ] CSRF protection verified
- [ ] Input sanitization tested (XSS)
- [ ] Password breach checking operational
- [ ] Consent records being created
- [ ] Audit logging to Application Insights

---

## Implementation Complete - Final Testing

### New Components Created

#### Frontend
- `frontend/src/pages/SignupPage.tsx` - Main signup page
- `frontend/src/pages/VerifyEmailPage.tsx` - Email verification landing
- `frontend/src/pages/InviteSignupPage.tsx` - Organization invite signup
- `frontend/src/components/auth/*` - Auth components:
  - `SignupForm.tsx` - Main form with all validation
  - `FormField.tsx` - Accessible form field
  - `PasswordStrength.tsx` - Visual strength indicator
  - `PasswordRequirements.tsx` - Requirements checklist
  - `SocialLoginButtons.tsx` - Google/Microsoft buttons
  - `ConsentCheckboxes.tsx` - ToS/Privacy checkboxes
  - `DuplicateEmailMessage.tsx` - Existing email options
  - `ResendVerificationBanner.tsx` - Resend verification
  - `TermsModal.tsx` / `PrivacyModal.tsx` - Document modals
  - `CaptchaChallenge.tsx` - hCaptcha integration
- `frontend/src/hooks/useSignupForm.ts` - Form state management
- `frontend/src/hooks/useDebounce.ts` - Input debouncing
- `frontend/src/services/signupService.ts` - API calls
- `frontend/src/utils/emailTypoDetector.ts` - Typo suggestions
- `frontend/src/components/Toast.tsx` - Notifications
- `frontend/src/components/LoadingOverlay.tsx` - Loading states

#### Backend
- `backend/src/functions/signup.ts` - Signup API endpoints
- `backend/src/functions/organization.ts` - Org invite endpoints
- `backend/src/services/consentService.ts` - Consent management
- `backend/src/services/signupAttemptService.ts` - Rate limiting
- `backend/src/services/organizationInviteService.ts` - Invites
- `backend/src/utils/passwordValidator.ts` - HIBP breach check
- `backend/src/models/signupSchema.ts` - Zod validation

### Verification Steps

```bash
# 1. Apply database migration (if not already applied)
cd backend
npx prisma generate

# 2. Start backend
npm run build && npm run start

# 3. In another terminal, start frontend
cd frontend
npm run dev

# 4. Test routes
# - http://localhost:5173/signup-new (new signup page)
# - http://localhost:5173/verify-email (verification landing)
# - http://localhost:5173/invite/test-token (invite signup - will show error)
```

### Lighthouse Accessibility Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit on signup page
lighthouse http://localhost:5173/signup-new --view --only-categories=accessibility

# Expected score: 95+ (WCAG 2.1 AA compliant)
```

### Key Features Implemented

1. **Real-time validation** - Email typo detection, password strength
2. **Breach checking** - HIBP k-Anonymity API integration
3. **Rate limiting** - 5/hr per email, 10/hr per IP
4. **hCaptcha** - Shows after 3 failed attempts
5. **Consent tracking** - ToS/Privacy with audit trail
6. **Social login** - Google and Microsoft via B2C
7. **Organization invites** - Token-based team signup
8. **Accessibility** - ARIA labels, focus management, skip links

