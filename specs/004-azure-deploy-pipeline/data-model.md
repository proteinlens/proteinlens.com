# Data Model: Azure Deployment Pipeline

**Phase**: 1 (Design & Contracts)  
**Date**: December 22, 2024  
**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Purpose

This document defines the data structures, configuration entities, and relationships involved in the Azure deployment pipeline. Unlike application data models (database schemas), this focuses on deployment artifacts: configuration files, secrets, parameters, and workflow outputs.

## Entity Definitions

### 1. GitHub Secrets (Configuration Entity)

**Purpose**: Encrypted key-value pairs stored in GitHub repository for workflow authentication and deployment

**Attributes**:
| Name | Type | Required | Description | Example Value |
|------|------|----------|-------------|---------------|
| `AZURE_CREDENTIALS` | JSON | Yes | Service principal credentials for Azure login | `{"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}` |
| `AZURE_SUBSCRIPTION_ID` | String | Yes | Azure subscription ID | `12345678-1234-1234-1234-123456789abc` |
| `AZURE_RESOURCE_GROUP` | String | Yes | Resource group name for deployments | `proteinlens-prod` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | String | Yes | Deployment token for Static Web Apps | `abc123...` (64-char token) |
| `DATABASE_ADMIN_PASSWORD` | String | Yes | PostgreSQL admin password (stored in KV, seed value) | `P@ssw0rd123!` (strong password) |
| `OPENAI_API_KEY` | String | Yes | OpenAI API key (stored in KV, seed value) | `sk-...` |
| `STRIPE_SECRET_KEY` | String | Yes | Stripe API secret key (stored in KV, seed value) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | String | Yes | Stripe webhook signing secret (stored in KV, seed value) | `whsec_...` |

**Lifecycle**:
- Created manually via GitHub Settings > Secrets and variables > Actions
- Updated when rotating credentials (every 90 days for service principal)
- Never logged or exposed in workflow outputs
- Accessed in workflows via `${{ secrets.SECRET_NAME }}`

**Relationships**:
- Used by GitHub Actions workflows during deployment
- Seed values for Key Vault secrets (one-time copy during infrastructure setup)

---

### 2. Azure Key Vault Secrets (Configuration Entity)

**Purpose**: Secure storage for runtime secrets accessed by Function App via Key Vault references

**Attributes**:
| Name | Type | Required | Description | Example Value |
|------|------|----------|-------------|---------------|
| `database-url` | String | Yes | PostgreSQL connection string | `postgresql://admin:pwd@server.postgres.database.azure.com:5432/proteinlens?sslmode=require` |
| `openai-api-key` | String | Yes | OpenAI API key for GPT-5.1 Vision | `sk-...` |
| `stripe-secret-key` | String | Yes | Stripe API secret key | `sk_live_...` |
| `stripe-webhook-secret` | String | Yes | Stripe webhook signing secret | `whsec_...` |
| `storage-connection-string` | String | No | Storage account connection string (fallback, prefer Managed Identity) | `DefaultEndpointsProtocol=https;AccountName=...` |

**Metadata**:
- **Content Type**: `text/plain` or `application/x-pem-file` (for certificates)
- **Enabled**: `true`
- **Expiration Date**: Optional (for auto-rotation)
- **Tags**: `{ "environment": "prod", "managed-by": "github-actions" }`

**Lifecycle**:
- Created by infrastructure workflow (Bicep template or CLI commands)
- Seeded with initial values from GitHub Secrets during first deployment
- Rotated manually or via Azure automation (not handled by this feature)
- Accessed by Function App via Managed Identity

**Access Control**:
- Function App Managed Identity: `Get`, `List` permissions
- Service Principal (for infrastructure): `Set`, `Delete`, `Get`, `List` permissions
- No user access (admin access requires privileged identity)

**Relationships**:
- Referenced by Function App application settings via Key Vault reference syntax
- Seeded from GitHub Secrets during infrastructure deployment

---

### 3. Bicep Parameters (Configuration Entity)

**Purpose**: Environment-specific values passed to Bicep templates during infrastructure deployment

**Attributes**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `location` | String | Yes | `resourceGroup().location` | Azure region (e.g., `eastus`, `westeurope`) |
| `environmentName` | String | Yes | `dev` | Environment identifier (`dev`, `staging`, `prod`) |
| `storageAccountName` | String | No | `proteinlens{env}{unique}` | Storage account name (globally unique, 3-24 lowercase alphanumeric) |
| `functionAppName` | String | No | `proteinlens-api-{env}` | Function App name |
| `staticWebAppName` | String | No | `proteinlens-web-{env}` | Static Web App name |
| `keyVaultName` | String | No | `proteinlens-kv-{env}` | Key Vault name (globally unique, 3-24 alphanumeric + hyphens) |
| `postgresServerName` | String | No | `proteinlens-db-{env}` | PostgreSQL server name (globally unique) |
| `postgresDatabaseName` | String | No | `proteinlens` | Database name |
| `postgresAdminUsername` | String | No | `pgadmin` | Admin username |
| `postgresAdminPassword` | String (secure) | Yes | N/A | Admin password (from GitHub Secret) |
| `appInsightsName` | String | No | `proteinlens-ai-{env}` | Application Insights name |
| `frontDoorName` | String | No | `proteinlens-fd-{env}` | Front Door name (optional) |

**Usage**:
```bash
az deployment group create \
  --resource-group proteinlens-prod \
  --template-file infra/bicep/main.bicep \
  --parameters \
    environmentName=prod \
    postgresAdminPassword="${{ secrets.DATABASE_ADMIN_PASSWORD }}"
```

**Relationships**:
- Consumed by Bicep templates during deployment
- Determines resource naming conventions and SKUs
- Some values derived from GitHub Secrets

---

### 4. Bicep Outputs (Configuration Entity)

**Purpose**: Resource identifiers and URLs returned by Bicep deployments for use in subsequent workflows

**Attributes**:
| Name | Type | Description | Example Value |
|------|------|-------------|---------------|
| `storageAccountName` | String | Storage account name | `proteinlensprodabc123` |
| `functionAppName` | String | Function App name | `proteinlens-api-prod` |
| `functionAppUrl` | String | Function App HTTPS endpoint | `https://proteinlens-api-prod.azurewebsites.net` |
| `staticWebAppName` | String | Static Web App name | `proteinlens-web-prod` |
| `staticWebAppUrl` | String | Static Web App default URL | `https://proteinlens-web-prod.azurestaticapps.net` |
| `keyVaultName` | String | Key Vault name | `proteinlens-kv-prod` |
| `keyVaultUri` | String | Key Vault URI | `https://proteinlens-kv-prod.vault.azure.net/` |
| `postgresServerFqdn` | String | PostgreSQL server FQDN | `proteinlens-db-prod.postgres.database.azure.com` |
| `frontDoorEndpoint` | String | Front Door endpoint (optional) | `https://proteinlens-prod.azurefd.net` |

**Usage**:
```yaml
# Extract outputs from infrastructure deployment
- name: Get Infrastructure Outputs
  id: infra
  run: |
    FUNCTION_APP_URL=$(az deployment group show \
      --resource-group ${{ secrets.AZURE_RESOURCE_GROUP }} \
      --name main-deployment \
      --query properties.outputs.functionAppUrl.value \
      --output tsv)
    echo "function_app_url=$FUNCTION_APP_URL" >> $GITHUB_OUTPUT

# Use outputs in subsequent steps
- name: Run Health Check
  run: curl -f "${{ steps.infra.outputs.function_app_url }}/api/health"
```

**Relationships**:
- Generated by Bicep deployments
- Consumed by backend and frontend deployment workflows
- Used for health checks and smoke tests

---

### 5. Workflow Inputs (Configuration Entity)

**Purpose**: User-provided parameters for manual workflow triggers

**Infrastructure Workflow Inputs**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `environmentName` | Choice | Yes | `dev` | Environment to deploy (`dev`, `staging`, `prod`) |
| `deployDatabase` | Boolean | No | `true` | Whether to deploy PostgreSQL server |
| `deployFrontDoor` | Boolean | No | `false` | Whether to deploy Front Door (optional) |

**Backend Workflow Inputs**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `skipMigrations` | Boolean | No | `false` | Skip database migrations (for rollback scenarios) |
| `skipHealthCheck` | Boolean | No | `false` | Skip health check verification |

**Frontend Workflow Inputs**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiUrl` | String | No | (auto-detected) | Override API base URL for build |

**Usage**:
```yaml
on:
  workflow_dispatch:
    inputs:
      environmentName:
        description: 'Environment name (dev, staging, prod)'
        required: true
        type: choice
        options:
          - dev
          - staging
          - prod
        default: 'dev'
```

---

### 6. Deployment Artifacts (Generated Entity)

**Purpose**: Build outputs and deployment packages created during workflows

**Backend Artifacts**:
| Artifact | Type | Size | Description |
|----------|------|------|-------------|
| Function App Package | ZIP | ~5-10 MB | Compiled TypeScript, node_modules, host.json, function.json |
| Prisma Client | Directory | ~2 MB | Generated Prisma client in node_modules/@prisma/client |
| Source Maps | Files | ~1-2 MB | .map files for debugging (excluded from production) |

**Frontend Artifacts**:
| Artifact | Type | Size | Description |
|----------|------|------|-------------|
| Static Assets | Directory | ~300 KB gzipped | HTML, CSS, JS, images in dist/ folder |
| index.html | File | ~500 bytes | SPA entry point |
| assets/*.js | Files | ~270 KB (85 KB gzipped) | Bundled JavaScript |
| assets/*.css | Files | ~57 KB (11 KB gzipped) | Compiled CSS |

**Lifecycle**:
- Generated during workflow build steps
- Uploaded to Azure during deployment steps
- Not stored as GitHub Actions artifacts (deployed directly)
- Retained by Azure for rollback (Function App: last 10 deployments, Static Web Apps: production + preview)

---

### 7. Environment Variables (Runtime Entity)

**Purpose**: Configuration values injected at runtime for backend and frontend

**Backend (Function App)**:
| Name | Source | Example Value |
|------|--------|---------------|
| `DATABASE_URL` | Key Vault Reference | `@Microsoft.KeyVault(SecretUri=https://...)` |
| `AZURE_OPENAI_API_KEY` | Key Vault Reference | `@Microsoft.KeyVault(SecretUri=https://...)` |
| `STRIPE_SECRET_KEY` | Key Vault Reference | `@Microsoft.KeyVault(SecretUri=https://...)` |
| `STRIPE_WEBHOOK_SECRET` | Key Vault Reference | `@Microsoft.KeyVault(SecretUri=https://...)` |
| `STORAGE_ACCOUNT_NAME` | Application Setting | `proteinlensprodabc123` |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Application Setting | `abc-123-def-456` |
| `FUNCTIONS_WORKER_RUNTIME` | Application Setting | `node` |
| `WEBSITE_NODE_DEFAULT_VERSION` | Application Setting | `~20` |

**Frontend (Build-Time)**:
| Name | Source | Example Value |
|------|--------|---------------|
| `VITE_API_URL` | GitHub Actions Env | `https://proteinlens-api-prod.azurewebsites.net` |

**Relationships**:
- Backend environment variables resolved at Function App startup
- Frontend environment variables embedded in build artifacts at build time
- Key Vault references resolved via Managed Identity

---

## Entity Relationships

```
┌─────────────────┐
│ GitHub Secrets  │ (AZURE_CREDENTIALS, tokens, passwords)
└────────┬────────┘
         │ Used by
         ↓
┌────────────────────┐
│ GitHub Actions     │ (infra.yml, deploy-api.yml, deploy-web.yml)
│ Workflows          │
└────────┬───────────┘
         │ Executes
         ↓
┌────────────────────┐     Provisions      ┌──────────────────┐
│ Bicep Deployment   │ ──────────────────> │ Azure Resources  │
│                    │                      │ (Function App,   │
└────────┬───────────┘                      │  Static Web App, │
         │                                  │  PostgreSQL,     │
         │ Creates                          │  Key Vault)      │
         ↓                                  └──────┬───────────┘
┌────────────────────┐                             │
│ Bicep Outputs      │                             │ Stores secrets
│ (resource names,   │                             ↓
│  URLs)             │                      ┌──────────────────┐
└────────┬───────────┘                      │ Key Vault        │
         │                                  │ Secrets          │
         │ Consumed by                      └──────┬───────────┘
         ↓                                         │
┌────────────────────┐                             │ Referenced by
│ Deployment         │                             │ (KV refs)
│ Workflows          │                             ↓
│ (backend, frontend)│                      ┌──────────────────┐
└────────┬───────────┘                      │ Function App     │
         │                                  │ Settings         │
         │ Builds & Deploys                 └──────────────────┘
         ↓
┌────────────────────┐
│ Deployment         │
│ Artifacts          │
│ (ZIP, static files)│
└────────────────────┘
```

## State Transitions

### Infrastructure Provisioning

```
[Not Exists] 
    │
    │ (Run infra.yml workflow)
    ↓
[Provisioning]
    │
    │ (Bicep deployment succeeds)
    ↓
[Provisioned] ←──────┐
    │                 │
    │ (Update infra)  │
    ↓                 │
[Updating] ───────────┘
```

### Backend Deployment

```
[Idle]
    │
    │ (Push to main, backend files changed)
    ↓
[Building]
    │
    │ (Build succeeds)
    ↓
[Migrating Database]
    │
    │ (Prisma migrate succeeds)
    ↓
[Deploying]
    │
    │ (Deployment succeeds)
    ↓
[Health Checking]
    │
    ├─ (Health check succeeds) ──> [Deployed]
    │
    └─ (Health check fails) ──> [Failed] ──> [Manual Rollback Required]
```

### Frontend Deployment

```
[Idle]
    │
    │ (Push to main, frontend files changed)
    ↓
[Building]
    │
    │ (Build succeeds)
    ↓
[Deploying to SWA]
    │
    ├─ (Upload succeeds) ──> [Deployed]
    │
    └─ (Upload fails) ──> [Failed] ──> [Retry or Manual Fix]
```

## Validation Rules

### GitHub Secrets
- `AZURE_CREDENTIALS` must be valid JSON with required keys (clientId, clientSecret, subscriptionId, tenantId)
- `AZURE_SUBSCRIPTION_ID` must be valid GUID format
- `AZURE_RESOURCE_GROUP` must exist in subscription
- `DATABASE_ADMIN_PASSWORD` must meet Azure PostgreSQL complexity requirements (8+ chars, uppercase, lowercase, digit, special char)

### Bicep Parameters
- `environmentName` must be one of: `dev`, `staging`, `prod`
- `location` must be valid Azure region (e.g., `eastus`, `westus2`)
- `storageAccountName` must be 3-24 lowercase alphanumeric characters
- `keyVaultName` must be 3-24 alphanumeric + hyphens, globally unique
- `postgresAdminPassword` must be 8-128 characters, meet complexity requirements

### Key Vault Secrets
- Secret names must be 1-127 alphanumeric characters and hyphens
- Secret values must not exceed 25 KB
- Secrets with expiration dates must be renewed before expiration

### Environment Variables
- `VITE_API_URL` must be valid HTTPS URL (http:// only allowed for localhost)
- Key Vault references must follow format: `@Microsoft.KeyVault(SecretUri=https://...)`

## Data Flow Examples

### Example 1: Infrastructure Deployment
```
1. Developer triggers infra.yml workflow (manual)
2. Workflow authenticates using AZURE_CREDENTIALS (GitHub Secret)
3. Workflow deploys main.bicep with parameters (environmentName=prod, postgresAdminPassword=secret)
4. Bicep creates resources: Storage, Function App, PostgreSQL, Key Vault, Static Web App
5. Bicep copies secrets from GitHub to Key Vault (one-time seed)
6. Bicep returns outputs: functionAppUrl, keyVaultUri, postgresServerFqdn
7. Outputs saved to GitHub environment variables for subsequent workflows
```

### Example 2: Backend Deployment with Migration
```
1. Developer pushes code to main (backend files changed)
2. deploy-api.yml workflow triggers automatically
3. Workflow builds backend (npm ci, npm run build)
4. Workflow retrieves runner's public IPv4
5. Workflow adds temporary firewall rule to PostgreSQL
6. Workflow runs prisma migrate deploy (DATABASE_URL from Key Vault)
7. Workflow removes temporary firewall rule
8. Workflow deploys Function App package to Azure
9. Workflow calls /api/health endpoint (retries 5 times with 10s interval)
10. Health check succeeds → Deployment marked successful
```

### Example 3: Frontend Deployment
```
1. Developer pushes code to main (frontend files changed)
2. deploy-web.yml workflow triggers automatically
3. Workflow builds frontend with VITE_API_URL=https://proteinlens-api-prod.azurewebsites.net
4. Vite bundles app with API URL embedded
5. Workflow deploys dist/ folder to Static Web Apps using deployment token
6. Static Web Apps publishes new version (live within 1-2 minutes)
7. Users access https://proteinlens-web-prod.azurestaticapps.net with new frontend
```

## Security Considerations

### Secret Handling
- GitHub Secrets encrypted at rest, decrypted only during workflow execution
- Key Vault secrets encrypted at rest with Azure-managed keys
- Key Vault references in Function App settings never expose raw secret values
- Workflow logs mask secret values (GitHub Actions automatic masking)

### Access Control
- Service Principal has Contributor role (create/update/delete resources, cannot manage access)
- Function App Managed Identity has Key Vault Get/List permissions only
- GitHub repository requires admin access to modify secrets
- Azure RBAC enforced at resource group level

### Network Security
- PostgreSQL firewall rules restrict access to specific IPs
- Temporary firewall rule removed immediately after migration (30s exposure window)
- Key Vault can use private endpoints (optional, not in scope)
- Static Web Apps accessed via HTTPS only

## Next Steps (Contract Definition)

1. Define Bicep module interfaces (parameters, outputs) in `/contracts/bicep/`
2. Define GitHub Actions workflow schemas (inputs, outputs) in `/contracts/workflows/`
3. Create quickstart guide with step-by-step setup instructions
