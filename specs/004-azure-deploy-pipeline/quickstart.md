# Quick Start: Azure Deployment Pipeline

**Feature**: Azure Deployment Pipeline (004-azure-deploy-pipeline)  
**Audience**: Developers and DevOps engineers deploying ProteinLens to Azure

## Prerequisites

Before deploying, ensure you have:

### Required Tools

- **Azure CLI 2.50+**: `az --version` (install: https://aka.ms/azure-cli)
- **Bicep CLI**: `az bicep version` (install: `az bicep install`)
- **Node.js 20+**: `node --version` (install: https://nodejs.org)
- **Git**: `git --version`
- **GitHub CLI** (optional): `gh --version` (install: https://cli.github.com)

### Azure Resources

- Azure subscription with Contributor access
- Sufficient quota for:
  - 1× Function App (Consumption Plan)
  - 1× PostgreSQL Flexible Server (Standard_B1ms)
  - 1× Static Web App (Free tier)
  - 1× Storage Account
  - 1× Key Vault

### GitHub Setup

- GitHub repository with Actions enabled
- Admin access to configure Secrets

### Credentials Ready

- OpenAI API key (for GPT-5.1 Vision)
- Stripe API keys (secret key, webhook secret)
- Strong PostgreSQL admin password (min 8 chars, mixed case, digit, special char)

---

## Step 1: Create Azure Service Principal

This service principal authenticates GitHub Actions to deploy to Azure.

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "Your Subscription Name"

# Create service principal with Contributor role
az ad sp create-for-rbac \
  --name "proteinlens-github-deploy" \
  --role Contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv) \
  --sdk-auth

# Copy the JSON output (you'll need it for GitHub Secrets)
```

**Output example**:
```json
{
  "clientId": "12345678-1234-1234-1234-123456789abc",
  "clientSecret": "abcd1234-5678-90ef-ghij-klmnopqrstuv",
  "subscriptionId": "87654321-4321-4321-4321-cba987654321",
  "tenantId": "11111111-2222-3333-4444-555555555555"
}
```

⚠️ **Save this JSON**—you cannot retrieve the `clientSecret` again.

---

## Step 2: Configure GitHub Secrets

Add secrets to your GitHub repository:

### Via GitHub Web UI

1. Go to `https://github.com/YOUR_ORG/proteinlens.com/settings/secrets/actions`
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `AZURE_CREDENTIALS` | Service principal JSON from Step 1 | `{"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}` |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID | `87654321-4321-4321-4321-cba987654321` |
| `AZURE_RESOURCE_GROUP` | Resource group name | `proteinlens-rg-prod` |
| `DATABASE_ADMIN_PASSWORD` | Strong PostgreSQL password | `P@ssw0rd123!Complex` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |

### Via GitHub CLI (Optional)

```bash
gh secret set AZURE_CREDENTIALS < azure-credentials.json
gh secret set AZURE_SUBSCRIPTION_ID --body "87654321-4321-4321-4321-cba987654321"
gh secret set AZURE_RESOURCE_GROUP --body "proteinlens-rg-prod"
gh secret set DATABASE_ADMIN_PASSWORD --body "YourStrongPassword123!"
gh secret set OPENAI_API_KEY --body "sk-proj-..."
gh secret set STRIPE_SECRET_KEY --body "sk_live_..."
gh secret set STRIPE_WEBHOOK_SECRET --body "whsec_..."
```

---

## Step 3: Create Bicep Parameter File

Create `infra/parameters/prod.parameters.json`:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "environmentName": { "value": "prod" },
    "location": { "value": "eastus" },
    "appNamePrefix": { "value": "proteinlens" },
    "functionAppSku": { "value": "Y1" },
    "postgresSkuName": { "value": "Standard_B1ms" },
    "postgresStorageSizeGB": { "value": 32 },
    "postgresAdminUsername": { "value": "pgadmin" },
    "enableFrontDoor": { "value": false }
  }
}
```

**Note**: `postgresAdminPassword` will be set from GitHub Secrets during deployment.

---

## Step 4: Deploy Infrastructure

### Option A: Via GitHub Actions (Recommended)

1. Go to `https://github.com/YOUR_ORG/proteinlens.com/actions`
2. Select **"Infrastructure Deployment"** workflow
3. Click **"Run workflow"**
4. Select environment: **prod**
5. Type confirmation: **DEPLOY**
6. Click **"Run workflow"**

⏱️ **Expected time**: 12-15 minutes (first run)

### Option B: Via Azure CLI (Local Testing)

```bash
# Create resource group
az group create \
  --name proteinlens-rg-prod \
  --location eastus

# Deploy Bicep template
az deployment group create \
  --resource-group proteinlens-rg-prod \
  --template-file infra/main.bicep \
  --parameters @infra/parameters/prod.parameters.json \
  --parameters postgresAdminPassword="$DATABASE_ADMIN_PASSWORD"

# View outputs
az deployment group show \
  --resource-group proteinlens-rg-prod \
  --name main \
  --query properties.outputs
```

⚠️ **Important**: After infrastructure deployment, note the following outputs:
- `functionAppName`: (e.g., `proteinlens-api-prod`)
- `staticWebAppDeploymentToken`: (needed for frontend deployment)

---

## Step 5: Configure Static Web App Deployment Token

After infrastructure deployment, add the Static Web App deployment token to GitHub Secrets:

```bash
# Get deployment token
az staticwebapp secrets list \
  --name proteinlens-web-prod \
  --resource-group proteinlens-rg-prod \
  --query properties.apiKey -o tsv

# Add to GitHub Secrets
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "paste-token-here"
```

---

## Step 6: Deploy Backend

Backend deploys automatically on push to `main` when `backend/**` files change.

### Trigger deployment:

```bash
# Make a trivial change to trigger deployment
cd backend
echo "// Trigger deployment" >> src/functions/health.ts
git add .
git commit -m "Deploy backend to production"
git push origin main
```

Or manually trigger via GitHub Actions UI.

⏱️ **Expected time**: 2-3 minutes

### Verify deployment:

```bash
# Get Function App URL from infrastructure outputs
FUNCTION_APP_URL=$(az deployment group show \
  --resource-group proteinlens-rg-prod \
  --name main \
  --query properties.outputs.functionAppUrl.value -o tsv)

# Test health endpoint
curl $FUNCTION_APP_URL/api/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-22T19:30:00.000Z",
  "version": "abc123",
  "checks": {
    "database": { "status": "ok" },
    "blobStorage": { "status": "ok" },
    "keyVault": { "status": "ok" }
  }
}
```

---

## Step 7: Deploy Frontend

Frontend deploys automatically on push to `main` when `frontend/**` files change.

### Trigger deployment:

```bash
# Make a trivial change
cd frontend
echo "// Trigger deployment" >> src/App.tsx
git add .
git commit -m "Deploy frontend to production"
git push origin main
```

⏱️ **Expected time**: 4-5 minutes

### Verify deployment:

```bash
# Get Static Web App URL
STATIC_WEB_APP_URL=$(az staticwebapp show \
  --name proteinlens-web-prod \
  --resource-group proteinlens-rg-prod \
  --query defaultHostname -o tsv)

# Open in browser
open "https://$STATIC_WEB_APP_URL"
```

---

## Step 8: Verify End-to-End Flow

1. **Open frontend**: Visit Static Web App URL
2. **Upload meal photo**: Test upload flow
3. **Verify backend**: Check API call succeeds
4. **Check database**: Verify meal saved in PostgreSQL
5. **View logs**: Check Application Insights for telemetry

---

## Troubleshooting

### Infrastructure Deployment Failed

**Symptom**: Bicep validation errors

**Solution**:
```bash
# Validate template locally
az deployment group validate \
  --resource-group proteinlens-rg-prod \
  --template-file infra/main.bicep \
  --parameters @infra/parameters/prod.parameters.json

# Check error details
az deployment group show \
  --resource-group proteinlens-rg-prod \
  --name main \
  --query properties.error
```

### Backend Health Check Fails

**Symptom**: `curl` returns 503 or timeout

**Possible causes**:
1. **Key Vault access denied**: Check Function App Managed Identity has access policy
2. **Database connection failed**: Check PostgreSQL firewall allows Azure services
3. **Secrets missing**: Verify all Key Vault secrets exist

**Solution**:
```bash
# Check Function App logs
az functionapp log tail \
  --name proteinlens-api-prod \
  --resource-group proteinlens-rg-prod

# Check Key Vault access policies
az keyvault show \
  --name proteinlens-kv-prod \
  --resource-group proteinlens-rg-prod \
  --query properties.accessPolicies
```

### Frontend Build Fails

**Symptom**: TypeScript compilation errors

**Solution**:
```bash
# Build locally to see full error
cd frontend
npm install
npm run build

# Fix TypeScript errors, then push
git add .
git commit -m "Fix TypeScript errors"
git push origin main
```

### Prisma Migrations Fail

**Symptom**: Backend deployment succeeds but database schema not updated

**Solution**:
```bash
# Check migration status
az functionapp config appsettings list \
  --name proteinlens-api-prod \
  --resource-group proteinlens-rg-prod \
  --query "[?name=='DATABASE_URL'].value" -o tsv

# Manually run migrations (emergency)
cd backend
export DATABASE_URL="postgresql://..." # Get from Key Vault
npx prisma migrate deploy
```

---

## Routine Operations

### Rotate Secrets

**Database password**:
```bash
# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update PostgreSQL
az postgres flexible-server update \
  --name proteinlens-pg-prod \
  --resource-group proteinlens-rg-prod \
  --admin-password "$NEW_PASSWORD"

# Update Key Vault
az keyvault secret set \
  --vault-name proteinlens-kv-prod \
  --name database-url \
  --value "postgresql://pgadmin:$NEW_PASSWORD@proteinlens-pg-prod.postgres.database.azure.com:5432/proteinlens?sslmode=require"

# Restart Function App to pick up new secret
az functionapp restart \
  --name proteinlens-api-prod \
  --resource-group proteinlens-rg-prod
```

**API keys**:
```bash
# Update Key Vault secret
az keyvault secret set \
  --vault-name proteinlens-kv-prod \
  --name openai-api-key \
  --value "sk-new-key-here"

# Restart Function App
az functionapp restart \
  --name proteinlens-api-prod \
  --resource-group proteinlens-rg-prod
```

### View Logs

**Function App**:
```bash
az functionapp log tail \
  --name proteinlens-api-prod \
  --resource-group proteinlens-rg-prod
```

**Application Insights**:
```bash
# Query logs via Azure Portal
# Or use Kusto Query Language (KQL) via Azure CLI
az monitor app-insights query \
  --app proteinlens-appinsights-prod \
  --analytics-query "requests | where timestamp > ago(1h) | summarize count() by resultCode"
```

### Rollback Deployment

**Backend**:
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or deploy specific commit
git checkout <previous-commit-sha>
git push origin main
```

**Frontend**:
```bash
# Same as backend (workflows re-deploy previous version)
git revert HEAD
git push origin main
```

---

## Next Steps

- **Configure custom domain**: Add custom domain to Static Web App and Function App
- **Enable Front Door**: Set `enableFrontDoor: true` in parameters file, re-run infrastructure workflow
- **Set up monitoring alerts**: Configure Azure Monitor alerts for errors, performance
- **Add staging environment**: Create `infra/parameters/staging.parameters.json`, deploy to separate resource group
- **Implement blue-green deployments**: Use Function App deployment slots for zero-downtime updates

---

## Summary

✅ **You've successfully deployed ProteinLens to Azure!**

**Infrastructure**: 8 Azure resources provisioned via Bicep  
**Backend**: Azure Functions with Prisma migrations  
**Frontend**: Static Web App with optimized build  
**Secrets**: Secured in Key Vault with Managed Identity access  
**CI/CD**: Automated deployments on every push to main

**Deployment time**: ~20 minutes (first run), ~5 minutes (subsequent deployments)

For implementation details, see:
- [Plan](./plan.md) - Full implementation plan
- [Data Model](./data-model.md) - Deployment entities and relationships
- [Contracts](./contracts/) - Workflow and parameter schemas
