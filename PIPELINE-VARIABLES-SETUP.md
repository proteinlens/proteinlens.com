# Pipeline Configuration Guide - Database Credentials Sync

## Overview

The `SyncInfrastructure` stage in Azure Pipelines requires certain variables to be set for secure credential synchronization.

## Required Pipeline Variables

Add these to your Azure Pipelines (Library → Variables or in the pipeline YAML):

### 1. Basic Azure Configuration

```
AZURE_SUBSCRIPTION_ID: 15728494-f8c0-46c5-aea9-553e6c28e19c
```

### 2. Resource Names

```
RESOURCE_GROUP_NAME: proteinlens-prod
POSTGRES_SERVER_NAME: proteinlens-db-prod-1523
KEY_VAULT_NAME: proteinlens-kv-fzpkp4yb
FUNCTION_APP_NAME: proteinlens-api-prod
```

### 3. Application Insights (Feature 011)

```
APPLICATIONINSIGHTS_CONNECTION_STRING: InstrumentationKey=xxx;IngestionEndpoint=https://northeurope-0.in.applicationinsights.azure.com/;...
VITE_APPINSIGHTS_CONNECTION_STRING: (same as above for frontend)
```

**Note:** The connection string is output by `monitoring.bicep` during infrastructure deployment. 
You can retrieve it from the Azure Portal → Application Insights → Overview → Connection String.

### 4. Secrets (MUST be marked as Secret)

```
POSTGRES_ADMIN_PASSWORD: ProteinLens2025SecureDB
```

**⚠️ IMPORTANT:** 
- Mark `POSTGRES_ADMIN_PASSWORD` as a secret variable
- Use the same password you set when creating the PostgreSQL server
- This is passed through the `DATABASE_PASSWORD` environment variable

## Setup Instructions

### Option A: Via Azure Pipelines UI

1. Go to **Pipelines** → Your pipeline → **Edit**
2. Click **Variables** button (top right)
3. Click **+ New variable** for each:
   - Name: `AZURE_SUBSCRIPTION_ID`
   - Value: `15728494-f8c0-46c5-aea9-553e6c28e19c`
   - ☐ Keep this value secret (unchecked)

4. Repeat for other non-secret variables (RESOURCE_GROUP_NAME, etc.)

5. For `POSTGRES_ADMIN_PASSWORD`:
   - Name: `POSTGRES_ADMIN_PASSWORD`
   - Value: (your actual password)
   - ☑️ Keep this value secret (CHECKED)

6. Click **Save**

### Option B: Via YAML (In Repository)

Create a file `.azure/variables.yml`:

```yaml
variables:
  AZURE_SUBSCRIPTION_ID: '15728494-f8c0-46c5-aea9-553e6c28e19c'
  RESOURCE_GROUP_NAME: 'proteinlens-prod'
  POSTGRES_SERVER_NAME: 'proteinlens-db-prod-1523'
  KEY_VAULT_NAME: 'proteinlens-kv-fzpkp4yb'
  FUNCTION_APP_NAME: 'proteinlens-api-prod'
  POSTGRES_ADMIN_PASSWORD: '$(postgres-password)'  # References secret from UI
```

Then in `infra/azure-pipelines.yml`:

```yaml
variables:
  - template: ../.azure/variables.yml
```

### Option C: Via Variable Groups (Recommended for Staging/Prod)

1. Go to **Pipelines** → **Library** → **Variable groups**
2. Click **+ Variable group**
3. Name: `proteinlens-prod-secrets`
4. Add variables:
   ```
   AZURE_SUBSCRIPTION_ID = 15728494-f8c0-46c5-aea9-553e6c28e19c
   RESOURCE_GROUP_NAME = proteinlens-prod
   POSTGRES_SERVER_NAME = proteinlens-db-prod-1523
   KEY_VAULT_NAME = proteinlens-kv-fzpkp4yb
   FUNCTION_APP_NAME = proteinlens-api-prod
   POSTGRES_ADMIN_PASSWORD = ProteinLens2025SecureDB (mark as secret)
   ```
5. Link to pipeline in YAML:

```yaml
trigger:
  - main
  - develop

variables:
  - group: proteinlens-prod-secrets
```

## Validating Configuration

After setting variables, test by triggering a dummy pipeline run:

```bash
# Verify variables are available
az pipelines variable list --pipeline-name "ProteinLens-CI-CD"
```

Or check in the pipeline run logs (they will show which variables were loaded).

## Current Values (for Reference)

| Variable | Value | Secret? |
|----------|-------|---------|
| AZURE_SUBSCRIPTION_ID | 15728494-f8c0-46c5-aea9-553e6c28e19c | No |
| RESOURCE_GROUP_NAME | proteinlens-prod | No |
| POSTGRES_SERVER_NAME | proteinlens-db-prod-1523 | No |
| KEY_VAULT_NAME | proteinlens-kv-fzpkp4yb | No |
| FUNCTION_APP_NAME | proteinlens-api-prod | No |
| POSTGRES_ADMIN_PASSWORD | ProteinLens2025SecureDB | **Yes** |

## Getting Current Values (if unsure)

If you don't remember the exact names, query Azure:

```bash
# Find resource group
az group list --query "[?contains(name, 'proteinlens')].name" -o table

# Find PostgreSQL server in resource group
az postgres flexible-server list --resource-group proteinlens-prod --query "[].name" -o table

# Find Key Vault in resource group
az keyvault list --resource-group proteinlens-prod --query "[].name" -o table

# Find Function App in resource group
az functionapp list --resource-group proteinlens-prod --query "[].name" -o table
```

## Troubleshooting

### "Variable not found" error during SyncInfrastructure stage

**Solution:** 
1. Ensure all variables are defined in the pipeline (not just YAML)
2. Check that secret variables are properly marked as secret
3. Verify variable group is linked to the pipeline

### "Access denied" error when syncing credentials

**Solution:**
1. Verify the service connection has Contributor role on the resource group
2. Run: `az role assignment list --resource-group proteinlens-prod --include-inherited`
3. Add role if needed: `az role assignment create --role Contributor --assignee <service-principal-id> --scope <resource-group-id>`

### Function App doesn't restart

**Solution:**
1. Check that Function App name is correct
2. Ensure service principal has permissions to restart the app
3. Manually restart: `az functionapp restart -n proteinlens-api-prod -g proteinlens-prod`

## Next Steps

1. ✅ Set all variables using Option A, B, or C above
2. ✅ Commit `infra/azure-pipelines.yml` changes to repository
3. ✅ Push to main/develop branch
4. ✅ Monitor the pipeline run - look for **SyncInfrastructure** stage
5. ✅ Verify deployment succeeds without database auth errors

## Testing After Setup

Once configured, do a test deployment:

```bash
# Push a small change to trigger pipeline
git add .
git commit -m "chore: test database sync pipeline"
git push origin develop

# Monitor in Azure Pipelines UI
# Should see SyncInfrastructure stage run and succeed
```

Then verify the app works:

```bash
# Test the API
curl -X POST "https://proteinlens-api-prod.azurewebsites.net/api/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileSize":1000,"contentType":"image/jpeg"}'

# Should work without "Authentication failed" error
```

## Support

If you encounter issues:
1. Check pipeline logs (SyncInfrastructure stage)
2. Run `scripts/sync-db-credentials.ps1` manually to debug
3. Check Key Vault secrets: `az keyvault secret list --vault-name proteinlens-kv-fzpkp4yb`
4. Check Function App settings: `az functionapp config appsettings list -n proteinlens-api-prod -g proteinlens-prod`
