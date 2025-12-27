# API Contracts: Microsoft Entra External ID Authentication

**Date**: 2025-12-27 | **Plan**: [../plan.md](../plan.md)

> **Migration Note**: Updated from Azure AD B2C to Microsoft Entra External ID. Token structure is MSAL-compatible.

## Overview

Microsoft Entra External ID handles all authentication endpoints. This document defines the **token contract** between External ID and the ProteinLens application.

## JWT Token Structure

### ID Token Claims (from External ID)

```json
{
  "iss": "https://proteinlenscustomers.ciamlogin.com/<tenant-id>/v2.0/",
  "aud": "<external-id-client-id>",
  "exp": 1735286400,
  "nbf": 1735282800,
  "iat": 1735282800,
  "sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "oid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "email": "user@example.com",
  "emails": ["user@example.com"],
  "given_name": "John",
  "family_name": "Doe",
  "name": "John Doe",
  "idp": "google.com",
  "ver": "2.0"
}
```

### Claim Descriptions

| Claim | Type | Description |
|-------|------|-------------|
| `iss` | string | Issuer - External ID authority URL (uses `ciamlogin.com`) |
| `aud` | string | Audience - External ID app client ID |
| `oid` | string (UUID) | Object ID - unique user identifier in External ID |
| `sub` | string (UUID) | Subject - same as oid for External ID |
| `email` | string | User's email (local accounts) |
| `emails` | string[] | User's emails (social accounts) |
| `given_name` | string | User's first name |
| `family_name` | string | User's last name |
| `name` | string | User's display name |
| `idp` | string | Identity provider (e.g., `google.com`, `live.com`, or absent for local) |

## Backend API Authentication

### Request Format

All authenticated requests to `/api/*` must include:

```http
Authorization: Bearer <id_token>
Content-Type: application/json
```

### Validation Endpoints

External ID exposes standard OAuth 2.0 endpoints:

| Endpoint | URL |
|----------|-----|
| Authorize | `https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/oauth2/v2.0/authorize` |
| Token | `https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/oauth2/v2.0/token` |
| JWKS | `https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/discovery/v2.0/keys` |
| OpenID Config | `https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/v2.0/.well-known/openid-configuration` |

> **Key Difference from B2C**: External ID uses `ciamlogin.com` domain and does not include policy name in URL path.

## Existing API Endpoints

The following existing endpoints accept External ID tokens:

### GET /api/me

Returns current user profile.

**Response (200 OK)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "subscription": "free",
  "emailVerified": true
}
```

### POST /api/signup/check-email

Checks if email is available (called before External ID signup).

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "available": true
}
```

## No New Endpoints Required

External ID handles all authentication flows:
- User registration
- User sign-in
- Password reset
- Social login (Google, Microsoft)
- Token issuance

The backend only needs to validate tokens and sync users.

## Token Validation Logic

```typescript
// Backend token validation pseudocode
async function validateExternalIdToken(token: string): Promise<TokenClaims> {
  // 1. Fetch JWKS from External ID
  const jwks = await fetchJwks('https://proteinlenscustomers.ciamlogin.com/...');
  
  // 2. Verify signature
  const decoded = verifyJwtSignature(token, jwks);
  
  // 3. Validate claims
  assertIssuer(decoded.iss, 'https://proteinlenscustomers.ciamlogin.com/');
  assertAudience(decoded.aud, process.env.EXTERNAL_ID_CLIENT_ID);
  assertNotExpired(decoded.exp);
  
  // 4. Return validated claims
  return decoded as TokenClaims;
}
```
