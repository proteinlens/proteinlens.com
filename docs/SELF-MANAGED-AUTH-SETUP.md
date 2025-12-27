# Self-Managed Authentication Setup Guide

This guide covers setting up the self-managed authentication system for ProteinLens.

## Quick Start

### 1. Run Database Migration

When the database is accessible, run the migration:

```bash
cd backend

# Option A: Using Prisma (recommended for development)
npx prisma migrate deploy

# Option B: Manual SQL execution (for production)
# Connect to PostgreSQL and run:
# prisma/migrations/20251227_add_self_managed_auth/migration.sql
```

### 2. Configure Environment Variables

Add these to your Azure Function App settings (or local.settings.json for development):

```env
# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars  # Generate with: openssl rand -hex 64
JWT_ISSUER=https://proteinlens.com
JWT_AUDIENCE=proteinlens-api

# URLs (REQUIRED)
FRONTEND_URL=https://www.proteinlens.com
API_BASE_URL=https://proteinlens-api.azurewebsites.net

# OAuth - Google (OPTIONAL)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# OAuth - Microsoft (OPTIONAL)
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

# Document Versions
TOS_VERSION=1.0.0
PRIVACY_VERSION=1.0.0

# Email Service (console for dev, sendgrid for prod)
EMAIL_SERVICE=console
```

### 3. Set Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - Development: `http://localhost:7071/api/auth/callback/google`
   - Production: `https://your-api.azurewebsites.net/api/auth/callback/google`
4. Copy Client ID and Secret to environment variables

### 4. Set Up Microsoft OAuth (Optional)

1. Go to [Azure Portal > App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Register a new application
3. Add redirect URIs under Authentication:
   - Development: `http://localhost:7071/api/auth/callback/microsoft`
   - Production: `https://your-api.azurewebsites.net/api/auth/callback/microsoft`
4. Create a client secret under Certificates & Secrets
5. Copy Application (client) ID and Secret to environment variables

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register with email/password |
| POST | `/api/auth/signin` | Login with email/password |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/resend-verification` | Request new verification email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/check-email` | Check email availability |
| POST | `/api/auth/validate-password` | Validate password strength |

### OAuth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/login/google` | Initiate Google OAuth |
| GET | `/api/auth/login/microsoft` | Initiate Microsoft OAuth |
| GET | `/api/auth/callback/google` | Google OAuth callback |
| GET | `/api/auth/callback/microsoft` | Microsoft OAuth callback |
| GET | `/api/auth/providers` | List available OAuth providers |

## Security Features

- **Password Requirements**: 12+ characters, uppercase, lowercase, number, special character
- **Breach Detection**: Passwords checked against Have I Been Pwned database (k-Anonymity)
- **Token Security**: 
  - Access tokens: 15 minutes, HS256 signed
  - Refresh tokens: 7 days, stored as SHA-256 hash, with rotation
- **Rate Limiting**: 
  - Verification emails: 3/hour, 10/day
  - Password reset: 3/hour
- **Email Verification**: Required before sign-in for LOCAL auth

## Frontend Integration

The frontend uses localStorage for token storage:
- `proteinlens_access_token`: JWT access token
- `proteinlens_refresh_token`: Refresh token
- `proteinlens_token_expiry`: Token expiration timestamp

OAuth flow stores tokens in URL params and redirects to frontend, which extracts and stores them.

## Migrating from Azure B2C

Existing users with `externalId` (from B2C) can:
1. Use "Forgot Password" to set a new password for LOCAL auth
2. Link their account to Google/Microsoft OAuth by signing in with the same email

The system automatically handles email conflicts during OAuth signup.
