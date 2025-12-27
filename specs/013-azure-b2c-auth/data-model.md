# Data Model: Microsoft Entra External ID Authentication

**Date**: 2025-12-27 | **Plan**: [plan.md](./plan.md)

> **Migration Note**: Updated from Azure AD B2C to Microsoft Entra External ID. Token claim structure is identical.

## Overview

This feature **does not introduce new database entities**. It leverages the existing `User` model to store users authenticated via Microsoft Entra External ID.

## Existing Entity: User

The `User` model in `backend/prisma/schema.prisma` already contains all required fields for External ID integration:

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  externalId    String?   @unique  // Maps to External ID oid claim
  firstName     String    @default("")
  lastName      String    @default("")
  emailVerified Boolean   @default(false)
  subscription  String    @default("free")
  // ... other fields
}
```

## External ID Claim to User Field Mapping

| External ID JWT Claim | User Model Field | Notes |
|----------------------|------------------|-------|
| `oid` | `externalId` | Unique External ID user object ID |
| `email` / `emails[0]` | `email` | User's email address |
| `given_name` | `firstName` | User's first name |
| `family_name` | `lastName` | User's last name |
| `email_verified` | `emailVerified` | Always true for External ID signup |

## Claim Extraction Logic

External ID tokens may include claims in different formats. The backend handles both:

```typescript
// Token claims interface (same as B2C - MSAL compatible)
interface ExternalIdTokenClaims {
  oid: string;                    // Always present - unique user identifier
  email?: string;                 // Present for local accounts
  emails?: string[];              // Array format (social accounts)
  given_name?: string;            // Optional
  family_name?: string;           // Optional
  email_verified?: boolean;       // Optional
  idp?: string;                   // Identity provider (e.g., "google.com")
}

// Extraction helper
const extractEmail = (claims: ExternalIdTokenClaims): string => {
  return claims.email || claims.emails?.[0] || '';
};
```

## User Sync Behavior

| Scenario | Behavior |
|----------|----------|
| New External ID user | Create User record with externalId |
| Existing External ID user | Update User record (name, email changes) |
| Email conflict | Error - email already registered |
| No externalId (legacy) | Link if email matches |
| Social login user | Create/link user based on email from social provider |

## Social Identity Provider Claims

When users authenticate via Google or Microsoft social login:

| Provider | Claims Included |
|----------|----------------|
| Google | `email`, `given_name`, `family_name`, `idp: "google.com"` |
| Microsoft | `email`, `given_name`, `family_name`, `idp: "live.com"` |
| Local (email) | `email`, `given_name`, `family_name`, `idp: null` |

## No Schema Migration Required

The current schema fully supports External ID integration:
- ✅ `externalId` field exists and is unique
- ✅ `email` field for account identification
- ✅ `emailVerified` field for email status
- ✅ `firstName`/`lastName` for profile data

## Token Validation Endpoints

External ID JWKS and OpenID configuration:

```
JWKS: https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/discovery/v2.0/keys

OpenID Config: https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/v2.0/.well-known/openid-configuration
```

> **Note**: Uses `ciamlogin.com` domain (External ID) instead of `b2clogin.com` (deprecated B2C)
