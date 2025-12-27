# Quickstart: Microsoft Entra External ID Setup for ProteinLens

**Date**: 2025-12-27 | **Time Required**: 30-45 minutes

> **Migration Note**: This guide replaces the original Azure AD B2C quickstart. Azure AD B2C is discontinued for new customers as of May 1, 2025. Microsoft Entra External ID is the successor CIAM platform.

## Prerequisites

- [ ] Azure subscription with appropriate permissions
- [ ] Access to Microsoft Entra admin center (https://entra.microsoft.com)
- [ ] Google Cloud Console access (for Google OAuth)
- [ ] Azure Portal access (for Static Web App configuration)

## Step 1: Create Microsoft Entra External Tenant (10 min)

### Via Microsoft Entra Admin Center

1. Go to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Click on your tenant name in the top-right corner
3. Select **"Manage tenants"**
4. Click **"Create"**
5. Select **"External"** configuration type
6. Configure:
   - **Organization name**: `ProteinLens Customers`
   - **Domain name**: `proteinlenscustomers` (becomes `proteinlenscustomers.onmicrosoft.com`)
   - **Country/Region**: Select your region
7. Click **"Review + create"** → **"Create"**
8. Wait for tenant creation (1-2 minutes)

### Switch to External Tenant

1. After creation, click **"Switch tenant"** to switch to the new External tenant
2. Or use the tenant switcher in the top-right corner

---

## Step 2: Create App Registration (5 min)

1. In the External tenant, go to **"Applications"** → **"App registrations"**
2. Click **"New registration"**
3. Configure:
   - **Name**: `ProteinLens Web`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: 
     - Platform: `Single-page application (SPA)`
     - URI: `https://www.proteinlens.com`
4. Click **"Register"**
5. **Record the Application (client) ID** - you'll need this!

### Add Local Development Redirect URI

1. Go to **"Authentication"** in the app registration
2. Under **"Single-page application"**, click **"Add URI"**
3. Add: `http://localhost:5173`
4. Click **"Save"**

### Configure API Permissions

1. Go to **"API permissions"**
2. Click **"Add a permission"** → **"Microsoft Graph"** → **"Delegated permissions"**
3. Select: 
   - `openid` (may already be present)
   - `profile` (may already be present)
   - `email`
   - `offline_access` (for refresh tokens)
4. Click **"Add permissions"**
5. Click **"Grant admin consent for [Tenant Name]"** (External tenants require admin consent)

---

## Step 3: Create User Flows (10 min)

### Sign Up and Sign In Flow

1. In the External tenant, go to **"External Identities"** → **"User flows"**
2. Click **"New user flow"**
3. Select **"Sign up and sign in"**
4. Configure:
   - **Name**: `SignUpSignIn`
   - **Identity providers**: Select `Email signup` (social providers added later)
5. **User attributes**:
   - Collect: `Display Name`, `Email Address`
   - Token claims: `Display Name`, `Email Address`, `Object ID`
6. Click **"Create"**

### Test Sign Up Flow

1. Select `SignUpSignIn` flow
2. Click **"Run user flow"**
3. Select application: `ProteinLens Web`
4. Reply URL: `https://www.proteinlens.com`
5. Click **"Run"**
6. Complete a test signup

---

## Step 4: Configure Social Identity Providers (15 min)

### Google Setup

#### In Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Go to **"APIs & Services"** → **"OAuth consent screen"**
4. Configure:
   - User type: `External`
   - App name: `ProteinLens`
   - Support email: your email
   - Authorized domains: `ciamlogin.com`, `proteinlens.com`
5. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
6. Configure:
   - Application type: `Web application`
   - Name: `ProteinLens External ID`
   - Authorized redirect URIs: 
     ```
     https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com/federation/oauth2
     ```
7. **Record Client ID and Client Secret**

#### In Microsoft Entra External ID:

1. Go to **"External Identities"** → **"All identity providers"**
2. Select **"Google"**
3. Configure:
   - Client ID: (from Google Cloud Console)
   - Client secret: (from Google Cloud Console)
4. Click **"Save"**
5. Go to your `SignUpSignIn` user flow → **"Identity providers"** → Enable `Google`

### Microsoft Account Setup

Microsoft Account is **built-in** to External ID. No additional configuration needed!

1. Go to **"External Identities"** → **"All identity providers"**
2. Verify **"Microsoft Account"** is available
3. Go to your `SignUpSignIn` user flow → **"Identity providers"** → Enable `Microsoft Account`

---

## Step 5: Configure Static Web App Environment (5 min)

### Via Azure Portal:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **"Static Web Apps"** → **"proteinlens-web-prod"**
3. Go to **"Configuration"** → **"Application settings"**
4. Add the following settings:

| Name | Value |
|------|-------|
| `VITE_AUTH_CLIENT_ID` | `<your-external-id-app-client-id>` |
| `VITE_AUTH_AUTHORITY` | `https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com` |
| `VITE_AUTH_REDIRECT_URI` | `https://www.proteinlens.com` |

5. Click **"Save"**

### Via Azure CLI:

```bash
az staticwebapp appsettings set \
  --name proteinlens-web-prod \
  --resource-group proteinlens-prod \
  --setting-names \
    VITE_AUTH_CLIENT_ID=<your-external-id-app-client-id> \
    VITE_AUTH_AUTHORITY=https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com \
    VITE_AUTH_REDIRECT_URI=https://www.proteinlens.com
```

---

## Step 6: Update Frontend Code (2 min)

### Update msalConfig.ts

Update the `knownAuthorities` array in `frontend/src/auth/msalConfig.ts`:

```typescript
auth: {
  // ...existing code...
  knownAuthorities: ['proteinlenscustomers.ciamlogin.com'],
  // ...existing code...
}
```

> **Key Change**: External ID uses `ciamlogin.com` instead of `b2clogin.com`

---

## Step 7: Local Development Setup (5 min)

### Create .env.local

Copy the template and fill in your External ID values:

```bash
cp frontend/.env.local.template frontend/.env.local
```

Edit `frontend/.env.local`:

```env
VITE_AUTH_CLIENT_ID=<your-external-id-app-client-id>
VITE_AUTH_AUTHORITY=https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com
VITE_AUTH_REDIRECT_URI=http://localhost:5173
```

### Run Local Development

```bash
cd frontend
npm run dev
```

---

## Verification Checklist

### External Tenant Created
- [ ] External tenant accessible at https://entra.microsoft.com
- [ ] Tenant name: `proteinlenscustomers.onmicrosoft.com`

### App Registration Complete
- [ ] Application (client) ID recorded
- [ ] Redirect URIs configured (production + localhost)
- [ ] API permissions granted admin consent

### User Flow Working
- [ ] `SignUpSignIn` flow created
- [ ] Test signup successful
- [ ] Test sign-in successful

### Social Identity Providers
- [ ] Google OAuth configured
- [ ] Google enabled in user flow
- [ ] Microsoft Account enabled in user flow

### Static Web App Configured
- [ ] `VITE_AUTH_CLIENT_ID` set
- [ ] `VITE_AUTH_AUTHORITY` set (using `ciamlogin.com`)
- [ ] `VITE_AUTH_REDIRECT_URI` set

### Frontend Updated
- [ ] `msalConfig.ts` updated with `ciamlogin.com` domain
- [ ] Local `.env.local` created

---

## Troubleshooting

### "AADSTS50011: Reply URL mismatch"

**Cause**: Redirect URI not registered in External ID app registration

**Fix**: Add the exact redirect URI to the app registration under Authentication → Single-page application

### "AADSTS700054: Application needs to have an authority set"

**Cause**: Authority URL format incorrect

**Fix**: Ensure authority URL is:
```
https://proteinlenscustomers.ciamlogin.com/proteinlenscustomers.onmicrosoft.com
```
Note: No policy suffix needed (unlike B2C)

### "Invalid configuration" in browser console

**Cause**: `knownAuthorities` doesn't match authority URL domain

**Fix**: Update `msalConfig.ts`:
```typescript
knownAuthorities: ['proteinlenscustomers.ciamlogin.com']
```

### Google sign-in not appearing

**Cause**: Google not configured or not enabled in user flow

**Fix**: 
1. Configure Google in External Identities → All identity providers
2. Enable Google in the SignUpSignIn user flow

---

## Reference URLs

| Resource | URL |
|----------|-----|
| Microsoft Entra admin center | https://entra.microsoft.com |
| Azure Portal | https://portal.azure.com |
| External ID Documentation | https://learn.microsoft.com/en-us/entra/external-id/customers/ |
| Google Cloud Console | https://console.cloud.google.com |
| ProteinLens Production | https://www.proteinlens.com |

---

## Key Differences from Azure AD B2C

| Aspect | B2C (Deprecated) | External ID |
|--------|------------------|-------------|
| Admin Portal | Azure Portal → B2C blade | Microsoft Entra admin center |
| Login Domain | `*.b2clogin.com` | `*.ciamlogin.com` |
| Authority URL | `https://tenant.b2clogin.com/tenant.onmicrosoft.com/B2C_1_policy` | `https://tenant.ciamlogin.com/tenant.onmicrosoft.com` |
| User Flow Names | `B2C_1_policyname` | Just the name (no prefix) |
| Microsoft Account | Requires separate app registration | Built-in identity provider |
