# Research: Azure Deployment Pipeline

**Phase**: 0 (Outline & Research)  
**Date**: December 22, 2024  
**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Purpose

This document consolidates research findings for implementing a production-ready CI/CD pipeline for ProteinLens. It addresses all NEEDS CLARIFICATION items from the Technical Context and provides best practices for each technology choice.

## Research Tasks Completed

### 1. Database Migration Strategy from GitHub Actions

**Decision**: Run Prisma migrations from GitHub Actions runner with temporary firewall rule

**Rationale**:
- Azure PostgreSQL Flexible Server requires IPv4 firewall rules for public access
- GitHub Actions runners have dynamic IPv4 addresses that change per run
- Alternative (Azure-hosted migration runner) requires additional infrastructure (Azure Container Instances or VM)
- Temporary firewall rule approach is simpler and uses existing infrastructure

**Implementation Approach**:
1. GitHub Actions workflow retrieves runner's public IPv4 using `curl ifconfig.me`
2. Workflow adds temporary firewall rule using Azure CLI: `az postgres flexible-server firewall-rule create`
3. Workflow runs `prisma migrate deploy` from runner
4. Workflow removes temporary firewall rule using Azure CLI: `az postgres flexible-server firewall-rule delete`
5. Firewall rule lifespan: ~30 seconds (only during migration execution)

**Security Considerations**:
- Firewall rule uses unique name with timestamp to avoid conflicts: `github-actions-${GITHUB_RUN_ID}`
- Rule is removed in workflow's `always()` block to ensure cleanup even on failure
- Database credentials still required (fetched from Key Vault) - firewall rule alone is insufficient for access
- Minimal exposure window (seconds, not minutes or hours)

**Alternatives Considered**:
- **Azure-hosted migration runner**: Rejected due to additional cost and complexity (requires ACI or VM, increases deployment time)
- **Private endpoint + self-hosted runner**: Rejected due to high setup cost (requires VNet, self-hosted runner infrastructure)
- **Service endpoint**: Rejected because GitHub Actions runs on Microsoft-managed infrastructure outside Azure VNet

**Best Practices Reference**: 
- [Prisma + GitHub Actions deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-azure-functions)
- [Azure PostgreSQL Flexible Server firewall](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-firewall-rules)

---

### 2. Key Vault References in Function App Settings

**Decision**: Use Key Vault references for all sensitive Function App settings

**Rationale**:
- Eliminates need to store secrets in application settings (plain text or encrypted)
- Supports automatic secret rotation without redeploying Function App
- Provides audit trail via Key Vault access logs
- Enables centralized secret management across multiple services

**Implementation Syntax**:
```json
{
  "name": "DATABASE_URL",
  "value": "@Microsoft.KeyVault(SecretUri=https://proteinlens-kv-prod.vault.azure.net/secrets/database-url/)",
  "slotSetting": false
}
```

**Configuration via Bicep**:
```bicep
resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    siteConfig: {
      appSettings: [
        {
          name: 'DATABASE_URL'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultSecretUri})'
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: '@Microsoft.KeyVault(SecretUri=${openAiKeyUri})'
        }
        // ... other settings
      ]
    }
  }
}
```

**Prerequisites**:
1. Function App must have System Managed Identity enabled
2. Key Vault must grant Function App identity `Get` and `List` permissions via access policy or RBAC
3. Key Vault secret must exist before Function App deployment

**Supported Secrets**:
- `DATABASE_URL`: PostgreSQL connection string
- `AZURE_OPENAI_API_KEY`: OpenAI API key for GPT-5.1 Vision
- `STRIPE_SECRET_KEY`: Stripe API key for billing
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- Any other runtime secrets

**Best Practices**:
- Omit version in SecretUri to always fetch latest version: `https://vault.../secrets/name/` (not `.../name/v1`)
- Use RBAC over access policies for Key Vault (more granular, integrates with Entra ID)
- Set Key Vault firewall to allow Azure services: `"networkAcls": { "bypass": "AzureServices" }`
- Monitor Key Vault access via diagnostic logs in Application Insights

**Best Practices Reference**:
- [Use Key Vault references for App Service](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references)
- [Azure Functions Key Vault integration](https://learn.microsoft.com/en-us/azure/azure-functions/functions-identity-access-azure-sql-with-managed-identity)

---

### 3. Static Web Apps Deployment Token Management

**Decision**: Store Static Web Apps deployment token in GitHub Secrets, use in workflow via `azure/static-web-apps-deploy@v1` action

**Rationale**:
- Static Web Apps requires deployment token for authentication (not service principal)
- Deployment token is generated once during Static Web App creation
- Token must be stored securely (GitHub Secrets provides encryption at rest and in transit)
- `azure/static-web-apps-deploy` action is official Microsoft-maintained action with built-in support

**Implementation Approach**:
1. Create Static Web App via Bicep (outputs deployment token as secure output)
2. Manually copy deployment token to GitHub Secrets: `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. GitHub Actions workflow references secret: `${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}`
4. Action builds frontend and deploys to Static Web Apps

**Workflow Configuration**:
```yaml
- name: Deploy to Azure Static Web Apps
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    repo_token: ${{ secrets.GITHUB_TOKEN }}
    action: 'upload'
    app_location: '/frontend'
    api_location: ''
    output_location: 'dist'
    app_build_command: 'npm run build'
```

**Security Considerations**:
- Deployment token has write access only to specific Static Web App (not entire Azure subscription)
- Token rotation requires manual update in GitHub Secrets
- Token does not expire (remains valid until manually regenerated)

**Alternative**: Use GitHub Actions OIDC with federated credentials (currently in preview for Static Web Apps)

**Best Practices Reference**:
- [Deploy to Azure Static Web Apps with GitHub Actions](https://learn.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow)
- [azure/static-web-apps-deploy action](https://github.com/Azure/static-web-apps-deploy)

---

### 4. GitHub Actions Service Principal Setup

**Decision**: Use Azure Service Principal with Contributor role scoped to resource group, authenticate via `azure/login@v1` action with GitHub Secrets

**Rationale**:
- Service Principal provides non-interactive authentication for GitHub Actions workflows
- Contributor role at resource group scope provides minimum permissions for deployment (create, update, delete resources)
- `azure/login` action supports multiple authentication methods (service principal, OIDC, managed identity)
- Credentials stored in GitHub Secrets ensures security (encrypted, audited, access-controlled)

**Service Principal Creation**:
```bash
# Create service principal and assign Contributor role to resource group
az ad sp create-for-rbac \
  --name "github-actions-proteinlens" \
  --role Contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group-name} \
  --json-auth

# Output (save to GitHub Secret AZURE_CREDENTIALS):
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  "resourceManagerEndpointUrl": "https://management.azure.com/"
}
```

**Workflow Authentication**:
```yaml
- name: Azure Login
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Deploy Infrastructure
  run: |
    az deployment group create \
      --resource-group proteinlens-prod \
      --template-file infra/bicep/main.bicep \
      --parameters environmentName=prod
```

**GitHub Secrets Required**:
- `AZURE_CREDENTIALS`: Service principal credentials (JSON format)
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID (redundant with AZURE_CREDENTIALS, but used for clarity)
- `AZURE_RESOURCE_GROUP`: Resource group name (for parameterization)

**Security Best Practices**:
- Rotate service principal secret every 90 days (set expiration during creation: `--years 0.25`)
- Use separate service principals for prod/staging environments
- Audit service principal usage via Azure Activity Log
- Consider migrating to Workload Identity Federation (OIDC) to eliminate long-lived secrets

**Alternative**: Workload Identity Federation (OIDC) - eliminates secret management but requires additional Azure AD configuration

**Best Practices Reference**:
- [Use Azure Login action with a service principal](https://github.com/Azure/login#login-with-a-service-principal-secret)
- [GitHub Actions for Azure](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure)

---

### 5. Bicep Module Organization Strategy

**Decision**: Use modular Bicep files with main orchestration template, pass outputs between modules via parameters

**Rationale**:
- Modular design improves maintainability (each resource type in separate file)
- Enables reusability across environments (dev, staging, prod)
- Supports incremental deployments (deploy only changed modules)
- Simplifies testing and validation (validate individual modules)

**Module Structure**:
```
infra/bicep/
├── main.bicep                  # Orchestration (calls all modules)
├── storage.bicep               # Storage Account + Blob Container
├── function-app.bicep          # Function App + App Service Plan
├── keyvault.bicep              # Key Vault + Access Policies
├── postgres.bicep              # PostgreSQL Flexible Server
├── static-web-app.bicep        # Static Web Apps
├── monitoring.bicep            # Application Insights
└── front-door.bicep            # Front Door (optional)
```

**Main Orchestration Pattern**:
```bicep
module storage './storage.bicep' = {
  name: 'storage-deployment'
  params: {
    location: location
    storageAccountName: storageAccountName
  }
}

module functionApp './function-app.bicep' = {
  name: 'function-app-deployment'
  params: {
    storageAccountName: storage.outputs.storageAccountName
    storageAccountId: storage.outputs.storageAccountId
  }
}
```

**Parameter Strategy**:
- Use `@secure()` decorator for sensitive parameters (passwords, connection strings)
- Use `uniqueString(resourceGroup().id)` for globally unique names (storage accounts)
- Use `environmentName` parameter to differentiate dev/staging/prod
- Use `location` parameter to support multi-region deployments

**Output Strategy**:
- Return resource names, IDs, and URLs as outputs
- Sensitive outputs (connection strings, keys) should be stored in Key Vault, not returned as outputs
- Outputs consumed by other modules or saved to GitHub environment variables

**Best Practices**:
- Validate Bicep files locally: `az bicep build --file main.bicep`
- Use Bicep linter: `az bicep lint --file main.bicep`
- Test deployments to dev environment before prod
- Use `--what-if` flag to preview changes: `az deployment group create --what-if`

**Best Practices Reference**:
- [Bicep modules documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/modules)
- [Bicep best practices](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices)

---

### 6. Frontend API URL Configuration

**Decision**: Inject `VITE_API_URL` environment variable at build time via GitHub Actions workflow

**Rationale**:
- Vite requires environment variables to be prefixed with `VITE_` to be exposed to client code
- Environment variables must be set at build time (not runtime) for Vite applications
- Build-time injection allows different API URLs for different environments (dev, staging, prod)
- API URL is public information (not a secret), safe to include in frontend build

**Implementation**:
```yaml
# In .github/workflows/deploy-web.yml
- name: Build Frontend
  run: |
    cd frontend
    npm ci
    npm run build
  env:
    VITE_API_URL: https://proteinlens-api-prod.azurewebsites.net
```

**Frontend Code Usage**:
```typescript
// frontend/src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071';
```

**Environment-Specific URLs**:
- **Development**: `http://localhost:7071` (local Functions emulator)
- **Production**: `https://proteinlens-api-prod.azurewebsites.net` (Function App URL)
- **With Front Door**: `https://api.proteinlens.com` (custom domain via Front Door)

**Best Practices**:
- Provide sensible default in code for local development
- Document required environment variables in README
- Validate API URL format at build time (must be valid HTTPS URL in production)
- Use Front Door URL if available (provides CDN, WAF, SSL termination)

**Best Practices Reference**:
- [Vite environment variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Actions environment variables](https://docs.github.com/en/actions/learn-github-actions/variables)

---

### 7. Workflow Triggers and Path Filters

**Decision**: Use `push` trigger with path filters to skip irrelevant deployments

**Rationale**:
- Prevents unnecessary deployments when only documentation or tests change
- Reduces GitHub Actions minutes consumption
- Improves deployment speed (skip unaffected components)
- Maintains workflow idempotency (safe to re-run on same commit)

**Trigger Configuration**:

**Infrastructure Workflow** (`infra.yml`):
```yaml
on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      environmentName:
        description: 'Environment name (dev, staging, prod)'
        required: true
        default: 'dev'
```

**Backend Workflow** (`deploy-api.yml`):
```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-api.yml'
      - 'infra/bicep/function-app.bicep'
  workflow_dispatch:  # Allow manual trigger
```

**Frontend Workflow** (`deploy-web.yml`):
```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-web.yml'
      - 'infra/bicep/static-web-app.bicep'
  workflow_dispatch:  # Allow manual trigger
```

**Path Filter Strategy**:
- Include source code directory (`backend/`, `frontend/`)
- Include workflow file itself (re-deploy when workflow changes)
- Include relevant Bicep templates (infrastructure changes may require redeployment)
- Exclude tests, documentation, specs (changes don't affect deployment)

**Best Practices**:
- Always include `workflow_dispatch` for manual triggering (useful for rollbacks, testing)
- Test path filters by making changes and verifying correct workflows trigger
- Document path filter logic in workflow comments

**Best Practices Reference**:
- [GitHub Actions trigger events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Workflow path filters](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)

---

### 8. Health Check and Smoke Test Strategy

**Decision**: Call `/api/health` endpoint after backend deployment to verify successful deployment

**Rationale**:
- Provides immediate feedback on deployment success
- Catches common issues (Function App failed to start, missing environment variables, database connection failures)
- Enables fail-fast behavior (stop deployment if health check fails)
- Supports deployment notifications (report health check status to team)

**Health Endpoint Implementation**:
```typescript
// backend/src/functions/health.ts
export async function health(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check blob storage access
    const containerClient = blobServiceClient.getContainerClient('meal-photos');
    await containerClient.exists();
    
    return {
      status: 200,
      jsonBody: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || 'unknown',
      },
    };
  } catch (error) {
    return {
      status: 503,
      jsonBody: {
        status: 'unhealthy',
        error: error.message,
      },
    };
  }
}
```

**Workflow Health Check**:
```yaml
- name: Verify Deployment
  run: |
    HEALTH_URL="https://proteinlens-api-prod.azurewebsites.net/api/health"
    MAX_RETRIES=5
    RETRY_INTERVAL=10
    
    for i in $(seq 1 $MAX_RETRIES); do
      echo "Health check attempt $i/$MAX_RETRIES..."
      HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
      
      if [ "$HTTP_STATUS" = "200" ]; then
        echo "✓ Health check passed"
        exit 0
      fi
      
      echo "✗ Health check failed (HTTP $HTTP_STATUS). Retrying in ${RETRY_INTERVAL}s..."
      sleep $RETRY_INTERVAL
    done
    
    echo "✗ Health check failed after $MAX_RETRIES attempts"
    exit 1
```

**Checks Performed**:
1. HTTP 200 response (Function App is running)
2. Database connectivity (Prisma can connect to PostgreSQL)
3. Blob storage access (Managed Identity can access Storage Account)
4. Environment variables loaded (no missing Key Vault references)

**Best Practices**:
- Implement retries with exponential backoff (Function App may take 30-60s to start after deployment)
- Log health check response body on failure (for debugging)
- Include version in health response (verify correct version deployed)
- Monitor health endpoint via Application Insights (track availability)

**Best Practices Reference**:
- [Azure Functions health check patterns](https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices)
- [GitHub Actions HTTP requests](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions)

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Database Migrations** | Run from GitHub Actions with temporary firewall rule | Simplest approach, no additional infrastructure required |
| **Secrets Management** | Key Vault references for all Function App secrets | Eliminates secrets in application settings, supports rotation |
| **Static Web Apps Deployment** | Use deployment token in GitHub Secrets | Official authentication method for Static Web Apps |
| **GitHub Actions Auth** | Service Principal with Contributor role | Standard approach, supports all Azure operations |
| **Bicep Organization** | Modular files with main orchestration | Maintainability, reusability, incremental deployments |
| **Frontend API URL** | Inject VITE_API_URL at build time | Required for Vite, allows environment-specific URLs |
| **Workflow Triggers** | Push to main with path filters | Prevents unnecessary deployments, saves runner minutes |
| **Health Checks** | Call /api/health after deployment | Immediate feedback, fail-fast on deployment issues |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| GitHub Actions runner IP changes during migration | Migration fails due to firewall rule not matching | Add firewall rule immediately before migration, remove immediately after |
| Service Principal secret expires | Workflows fail to authenticate | Set calendar reminder to rotate secret every 90 days, consider OIDC migration |
| Static Web Apps deployment token leaked | Unauthorized deployments to production | Rotate token immediately, enable audit logging, consider IP restrictions |
| Prisma migration failure | Backend deployment fails, database in inconsistent state | Implement migration rollback procedure, test migrations in dev environment first |
| Key Vault unreachable during deployment | Function App fails to start, secrets unavailable | Monitor Key Vault availability, ensure network rules allow Azure services |
| Front Door configuration errors | Frontend cannot reach backend APIs | Validate Front Door routes in dev environment before prod deployment |

## Next Steps (Phase 1)

1. Design data model for deployment artifacts (GitHub Secrets, Key Vault secrets, Bicep parameters)
2. Define API contracts (Bicep module interfaces, GitHub Actions workflow inputs/outputs)
3. Create quickstart guide for setting up deployment pipeline from scratch
