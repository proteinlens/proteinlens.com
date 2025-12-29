# JWT & Authentication Secrets Deployment

This document describes how JWT authentication secrets are managed and deployed systematically in ProteinLens.

## Overview

JWT (JSON Web Tokens) are used for authentication in ProteinLens. The JWT secret is stored securely in Azure Key Vault and referenced by the Azure Function App via Key Vault references.

## Architecture

```
┌─────────────────────┐      ┌──────────────────────┐
│   Azure Key Vault   │      │  Azure Function App  │
│                     │      │                      │
│  jwt-secret ────────┼──────┼─> JWT_SECRET         │
│  database-url ──────┼──────┼─> DATABASE_URL       │
│                     │      │   JWT_ISSUER         │
│                     │      │   JWT_AUDIENCE       │
└─────────────────────┘      └──────────────────────┘
```

## Scripts

### 1. setup-jwt-secrets.sh (Standalone)

Full-featured JWT management script for manual operations:

```bash
# Check current status
./scripts/setup-jwt-secrets.sh status

# Initial setup (generates secret if missing)
./scripts/setup-jwt-secrets.sh setup

# Verify configuration
./scripts/setup-jwt-secrets.sh verify

# Rotate secret (invalidates all sessions)
./scripts/setup-jwt-secrets.sh rotate
```

### 2. fix-db-credentials.sh jwt (Integrated)

JWT commands integrated into the main troubleshooting script:

```bash
# Check JWT status
./scripts/fix-db-credentials.sh jwt status

# Setup JWT (if missing)
./scripts/fix-db-credentials.sh jwt setup

# Rotate JWT secret
./scripts/fix-db-credentials.sh jwt rotate

# Full diagnostics (includes JWT check)
./scripts/fix-db-credentials.sh diagnose
```

### 3. sync-db-credentials.ps1 (CI/CD)

PowerShell script used in Azure Pipelines that handles both database credentials AND JWT secrets:

- Automatically generates JWT secret if missing
- Updates Key Vault references in Function App
- Supports `-RotateJwtSecret` flag for forced rotation
- Sets `JWT_ISSUER` and `JWT_AUDIENCE` settings

## Pipeline Variables

### Azure DevOps Pipeline Variables

The following variables must be configured in Azure DevOps pipeline:

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_SUBSCRIPTION_ID` | Azure subscription GUID | `12345678-...` |
| `RESOURCE_GROUP_NAME` | Resource group name | `proteinlens-prod` |
| `KEY_VAULT_NAME` | Key Vault name | `proteinlens-kv-fzpkp4yb` |
| `FUNCTION_APP_NAME` | Function App name | `proteinlens-api-prod` |
| `POSTGRES_SERVER_NAME` | PostgreSQL server name | `proteinlens-db-prod-1523` |
| `DATABASE_PASSWORD` | Database password (secret) | `***` |
| `JWT_ISSUER` | JWT issuer claim | `proteinlens-api` |
| `JWT_AUDIENCE` | JWT audience claim | `proteinlens-frontend` |

### GitHub Actions Variables

Configure these in GitHub repository Settings → Secrets and Variables → Actions:

**Variables (non-sensitive):**

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_ISSUER` | JWT issuer claim | `proteinlens-api` |
| `JWT_AUDIENCE` | JWT audience claim | `proteinlens-frontend` |
| `AZURE_TENANT_ID` | Azure AD tenant ID | - |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID | - |

**Secrets (sensitive):**

| Secret | Description |
|--------|-------------|
| `AZURE_CLIENT_ID` | Service principal client ID |
| `DATABASE_ADMIN_PASSWORD` | PostgreSQL admin password |
| `OPENAI_API_KEY` | OpenAI/Azure OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### Setting Pipeline Variables

**In Azure DevOps:**
1. Go to Pipelines → Your Pipeline → Edit
2. Click "Variables" button
3. Add each variable (mark `DATABASE_PASSWORD` as secret)
4. Save

**In GitHub Actions:**
1. Go to repository Settings → Secrets and Variables → Actions
2. Add variables under "Variables" tab
3. Add secrets under "Secrets" tab

## JWT Configuration Details

### Token Expiry

| Token Type | Default Expiry |
|------------|---------------|
| Access Token | 15 minutes |
| Refresh Token | 7 days |

### Claims

Access tokens include:
- `userId` - User's UUID
- `email` - User's email
- `type` - "access"
- `iat` - Issued at timestamp
- `exp` - Expiration timestamp
- `iss` - Issuer (JWT_ISSUER)
- `aud` - Audience (JWT_AUDIENCE)

Refresh tokens additionally include:
- `jti` - Unique token ID for revocation

## Security Considerations

1. **Key Vault References**: JWT_SECRET is never stored as plain text in Function App settings. It uses Key Vault references (`@Microsoft.KeyVault(SecretUri=...)`).

2. **Managed Identity**: Function App uses system-assigned managed identity to access Key Vault secrets.

3. **Secret Rotation**: When rotating JWT secrets:
   - All existing access tokens become invalid immediately
   - All existing refresh tokens become invalid
   - Users must re-authenticate
   - Consider doing this during low-traffic periods

4. **Access Policies**: The Function App's managed identity needs `get` permission on Key Vault secrets.

## Troubleshooting

### "An unexpected error occurred during signin"

This typically means JWT_SECRET is not configured:

```bash
# Check configuration
./scripts/fix-db-credentials.sh jwt status

# Setup if missing
./scripts/fix-db-credentials.sh jwt setup
```

### Key Vault Reference Not Resolving

1. Check Function App has managed identity enabled
2. Verify Key Vault access policy includes the identity
3. Check the secret URI is correct
4. Restart Function App after changes

```bash
# Verify access
az functionapp identity show -n proteinlens-api-prod -g proteinlens-prod

# Check Key Vault access
az keyvault show --name proteinlens-kv-fzpkp4yb --query "properties.accessPolicies"
```

### Manual JWT Secret Reset

If automated scripts fail:

```bash
# 1. Generate new secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# 2. Store in Key Vault
az keyvault secret set \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name jwt-secret \
  --value "$JWT_SECRET"

# 3. Get Key Vault URI
KV_URI="https://proteinlens-kv-fzpkp4yb.vault.azure.net/secrets/jwt-secret"

# 4. Configure Function App
az functionapp config appsettings set \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod \
  --settings \
    "JWT_SECRET=@Microsoft.KeyVault(SecretUri=$KV_URI)" \
    "JWT_ISSUER=proteinlens-api" \
    "JWT_AUDIENCE=proteinlens-frontend"

# 5. Restart Function App
az functionapp restart --name proteinlens-api-prod --resource-group proteinlens-prod
```

## CI/CD Integration

### GitHub Actions (deploy.yml)

The GitHub Actions workflow in `.github/workflows/infra.yml` automatically:

1. Checks if JWT secret exists in Key Vault during infrastructure deployment
2. Generates new secret if missing (using `openssl rand -base64 64`)
3. Stores JWT secret in Key Vault with content type "JWT signing key"
4. Configures Function App with Key Vault reference for JWT_SECRET
5. Sets JWT_ISSUER and JWT_AUDIENCE from repository variables (or defaults)

**Key workflow steps:**
- `Setup JWT Authentication Secrets` - Creates JWT secret in Key Vault if missing
- `Configure JWT Authentication Settings` - Configures Function App settings

### Azure DevOps (azure-pipelines.yml)

The `SyncInfrastructure` stage in `azure-pipelines.yml` automatically:

1. Checks if JWT secret exists in Key Vault
2. Generates new secret if missing
3. Updates Function App with Key Vault references
4. Sets JWT_ISSUER and JWT_AUDIENCE
5. Restarts Function App

This ensures every deployment has proper JWT configuration.
