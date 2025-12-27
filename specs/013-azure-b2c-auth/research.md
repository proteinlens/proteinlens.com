# Research: Microsoft Entra External ID Authentication

**Date**: 2025-12-27 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

> **Migration Note**: This research document replaces the original Azure AD B2C research. Azure AD B2C is discontinued for new customers as of May 1, 2025. Microsoft Entra External ID is the successor CIAM platform.

## 1. Microsoft Entra External ID Tenant Creation

### Decision
Create a new Microsoft Entra External tenant named `proteinlenscustomers.onmicrosoft.com` via Microsoft Entra admin center.

### Rationale
- External ID uses a dedicated "External" tenant configuration (separate from workforce tenants)
- Created via Microsoft Entra admin center (https://entra.microsoft.com), not Azure Portal
- Same 50,000 MAU free tier as B2C
- MSAL library fully compatible (same as B2C)

### Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Microsoft Entra External ID | 50K MAU free, successor to B2C, MSAL compatible | Newer platform, less community docs |
| Auth0 | Good DX, easy setup | Cost ($23/month for 1K MAU), vendor lock-in |
| AWS Cognito | Good AWS integration | Poor Azure integration, additional vendor |

### External ID vs B2C Key Differences

| Aspect | Azure AD B2C (Deprecated) | Microsoft Entra External ID |
|--------|---------------------------|------------------------------|
| **Admin Portal** | Azure Portal → B2C blade | Microsoft Entra admin center |
| **Tenant Type** | B2C Tenant | External tenant configuration |
| **Login Domain** | `*.b2clogin.com` | `*.ciamlogin.com` |
| **Authority URL Format** | `https://tenant.b2clogin.com/tenant.onmicrosoft.com/B2C_1_policy` | `https://tenant.ciamlogin.com/tenant.onmicrosoft.com` |
| **User Flows** | B2C User Flows | External ID User Flows (simpler UI) |
| **Custom Policies** | XML-based Identity Experience Framework | Custom Authentication Extensions |
| **MSAL Compatibility** | ✅ Yes | ✅ Yes (same library) |
| **Free Tier** | 50K MAU | 50K MAU |

### Setup Requirements
1. Azure subscription with appropriate permissions
2. Tenant Creator role in Microsoft Entra ID
3. Access to Microsoft Entra admin center (https://entra.microsoft.com)

### External Tenant Region
- **Selected**: Default (External tenants are global with regional data residency options)
- External ID automatically handles global availability

---

## 2. External Tenant Creation Steps

### Via Microsoft Entra Admin Center

1. **Navigate to Entra admin center**: https://entra.microsoft.com
2. **Access tenant management**:
   - Click on your tenant name in the top-right corner
   - Select "Manage tenants"
   - Click "Create"
3. **Select tenant type**:
   - Choose "External" configuration
   - This creates a customer-facing (CIAM) tenant
4. **Configure tenant**:
   - Organization name: `ProteinLens Customers`
   - Domain name: `proteinlenscustomers` (results in `proteinlenscustomers.onmicrosoft.com`)
   - Country/Region: Select appropriate region
5. **Complete creation**: Wait for tenant provisioning (1-2 minutes)

### Alternative: Via Azure CLI (Preview)

```bash
# Note: External tenant creation via CLI is in preview
az rest --method post \
  --uri "https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.AzureActiveDirectory/tenants?api-version=2021-04-01-preview" \
  --body '{
    "location": "Global",
    "properties": {
      "displayName": "ProteinLens Customers",
      "countryCode": "US",
      "tenantType": "External"
    }
  }'
```

---

## 3. User Flow Configuration

### Decision
Use **Self-service sign-up** user flow with email/password and social identity providers.

### Rationale
- External ID user flows are simpler than B2C user flows
- Self-service sign-up allows users to create accounts without admin intervention
- Supports social identity providers (Google, Microsoft, Apple, Facebook)

### User Flow Settings

#### Sign-up and Sign-in Flow
| Setting | Value | Rationale |
|---------|-------|-----------|
| Name | `SignUpSignIn` | External ID naming (no B2C_ prefix) |
| Identity providers | Email signup, Google, Microsoft | Per spec requirements |
| User attributes to collect | Email, Display name | Minimal required info |
| Token claims | oid, email, given_name, family_name, email_verified | Map to User model |

### Creating User Flow in External ID

1. **Navigate to External ID tenant** in Entra admin center
2. **External Identities** → **User flows**
3. **New user flow** → Select "Sign up and sign in"
4. **Configure**:
   - Name: `SignUpSignIn`
   - Identity providers: Select Email signup + configured social providers
   - User attributes: Email (required), Display name (optional)
5. **Save and enable**

### Password Complexity (per FR-010)
External ID enforces password complexity automatically:
| Requirement | External ID Default |
|-------------|---------------------|
| Minimum 8 characters | ✅ Enforced |
| Uppercase letter | ✅ Required by default |
| Lowercase letter | ✅ Required by default |
| Number or symbol | ✅ Required by default |

### Email Verification
- External ID verifies email during signup automatically
- Verification code sent to email address
- One-time passcode option available for passwordless sign-in

---

## 4. Social Identity Providers

### Decision
Configure Google and Microsoft Account as federated identity providers in External ID.

### Rationale
- Google: Most widely used OAuth provider
- Microsoft: Native integration, enterprise users
- Both have generous free tiers for OAuth

### Google OAuth Setup for External ID

**Prerequisites**:
1. Google Cloud Console access
2. OAuth consent screen configured

**Steps**:
1. **Google Cloud Console** → APIs & Services → Credentials
2. **Create OAuth 2.0 Client ID**:
   - Application type: `Web application`
   - Name: `ProteinLens External ID`
   - Authorized redirect URI: `https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/federation/oauth2`
3. **Record Client ID and Client Secret**

**External ID Configuration**:
1. Navigate to **External Identities** → **All identity providers**
2. Select **Google**
3. Enter Client ID and Client secret from Google Cloud Console
4. Save configuration

> **Note**: The redirect URI uses `ciamlogin.com` domain, not `b2clogin.com`

### Microsoft Account Setup

Microsoft Account is a **built-in** identity provider in External ID. No additional configuration required.

1. Navigate to **External Identities** → **All identity providers**
2. Microsoft Account is already available
3. Enable it in your user flow

---

## 5. App Registration

### Decision
Create a Single-Page Application (SPA) registration in the External tenant.

### Steps

1. **Navigate to External ID tenant** in Entra admin center
2. **Applications** → **App registrations** → **New registration**
3. **Configure**:
   - Name: `ProteinLens Web`
   - Supported account types: `Accounts in this organizational directory only (External tenant)`
   - Redirect URI: `Single-page application (SPA)` → `https://www.proteinlens.com`
4. **Add additional redirect URIs**:
   - `http://localhost:5173` (local development)
5. **API permissions**:
   - Microsoft Graph → `openid` (delegated)
   - Microsoft Graph → `profile` (delegated)
   - Microsoft Graph → `email` (delegated)
   - Microsoft Graph → `offline_access` (delegated) - for refresh tokens
6. **Grant admin consent** for the External tenant

### Application (Client) ID
After registration, record the **Application (client) ID** - this is the `VITE_AUTH_CLIENT_ID`.

---

## 6. MSAL Configuration

### Decision
Update existing `msalConfig.ts` configuration for External ID authority format.

### Rationale
The current MSAL implementation is compatible with External ID, but the authority URL format differs from B2C.

### Authority URL Format Change

**Old B2C Format**:
```
https://tenant.b2clogin.com/tenant.onmicrosoft.com/B2C_1_policy
```

**New External ID Format**:
```
https://tenant.ciamlogin.com/tenant.onmicrosoft.com
```

### Required Configuration Updates

1. **Environment Variables in Static Web App**:
   ```
   VITE_AUTH_CLIENT_ID=<External ID App Registration Client ID>
   VITE_AUTH_AUTHORITY=https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com
   VITE_AUTH_REDIRECT_URI=https://www.proteinlens.com
   ```

2. **msalConfig.ts Update**:
   ```typescript
   // OLD (B2C):
   knownAuthorities: ['proteinlens.b2clogin.com']
   
   // NEW (External ID):
   knownAuthorities: ['proteinlenscustomers.ciamlogin.com']
   ```

### Redirect URI Configuration

| Environment | Redirect URI |
|-------------|--------------|
| Production | `https://www.proteinlens.com` |
| Local Dev | `http://localhost:5173` |

Both URIs must be registered in External ID App Registration.

### Token Refresh Strategy

**Already Implemented** in `AuthProvider.tsx` - no changes needed:
- Silent token acquisition via `acquireTokenSilent()`
- Falls back to `loginRedirect()` if silent fails
- Session timeout: 30 minutes inactivity, 7 days absolute

---

## 7. Backend Token Validation

### Decision
Backend validates External ID JWT tokens using standard JWT validation.

### Rationale
- External ID issues standard OAuth 2.0 JWT tokens
- Token format is identical to B2C
- JWKS endpoint changes to use `ciamlogin.com` domain

### Token Validation Details

**JWKS Endpoint**:
```
https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/discovery/v2.0/keys
```

**OpenID Configuration**:
```
https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/v2.0/.well-known/openid-configuration
```

### Token Validation Flow

1. Frontend acquires token via MSAL
2. Frontend sends token in `Authorization: Bearer <token>` header
3. Backend validates:
   - Signature (via JWKS)
   - Issuer: `https://proteinlenscustomers.ciamlogin.com/<tenant-id>/v2.0/`
   - Audience: External ID Client ID
   - Expiration: Not expired
4. Extract claims: `oid`, `email`, `given_name`, `family_name`
5. Sync/create user in PostgreSQL

### User Sync Logic

```typescript
// Pseudocode for user sync (unchanged from B2C)
const syncUser = async (claims: TokenClaims) => {
  const user = await prisma.user.upsert({
    where: { externalId: claims.oid },
    create: {
      externalId: claims.oid,
      email: claims.email,
      firstName: claims.given_name || '',
      lastName: claims.family_name || '',
      emailVerified: true, // External ID verifies email
    },
    update: {
      email: claims.email,
      firstName: claims.given_name || '',
      lastName: claims.family_name || '',
    },
  });
  return user;
};
```

---

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| Identity Provider | Microsoft Entra External ID |
| Tenant Name | proteinlenscustomers.onmicrosoft.com |
| Admin Portal | Microsoft Entra admin center (entra.microsoft.com) |
| Login Domain | ciamlogin.com |
| User Flow Type | Self-service sign-up and sign-in |
| Social Providers | Google + Microsoft Account |
| Password Policy | External ID default (8+ chars, complexity) |
| Email Verification | External ID built-in |
| Token Format | OAuth 2.0 JWT |
| Frontend Library | @azure/msal-browser (already installed) |

## Outstanding Questions

All items resolved:
1. ✅ B2C discontinuation → Migrated to External ID
2. ✅ Social login priority → Google + Microsoft in initial launch
3. ✅ Silent token refresh → Already implemented in AuthProvider (compatible)
4. ✅ Password requirements → External ID default complexity rules

## References

- [Microsoft Entra External ID Overview](https://learn.microsoft.com/en-us/entra/external-id/customers/overview-customers-ciam)
- [Create External Tenant](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-tenant-setup)
- [Register Application](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-register-ciam-app)
- [Configure Google Identity Provider](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-google-federation-customers)
