# ProteinLens Infrastructure Deployment with Azure AI Foundry

## Summary

The infrastructure is now ready for deployment with full Azure AI Foundry integration (GPT-5.1 support) to the **westus2** region.

## What's Included

### Core Infrastructure
- **Function App**: `proteinlens-api-prod` (Consumption tier with Node 20 runtime)
- **PostgreSQL**: `proteinlens-db-prod.postgres.database.azure.com` (Flexible Server)
- **Storage Account**: `plprodsa85` (for Function App jobs and meal photo storage)
- **Key Vault**: `proteinlens-kv-prod` (with soft-delete enabled)
- **Application Insights**: Integrated monitoring for Function App
- **Static Web App**: `proteinlens-web-prod` (React/Vite frontend)

### AI Capabilities (NEW)
- **Azure ML Hub**: `proteinlens-ai-hub-prod` - Manages AI resources and model deployments
- **Azure ML Project**: `proteinlens-ai-project-prod` - Workspace for GPT-5.1 integration
- **Managed Identity**: SystemAssigned for both hub and project for secure Azure AI access

## Regional Configuration

**Region**: westus2 (supports all required services including PostgreSQL Flexible Server)
- Previously attempted eastus but failed with `LocationIsOfferRestricted` for PostgreSQL

## Key Updates

1. **ai-foundry.bicep** module created with:
   - Azure ML Hub resource configuration
   - Azure ML Project workspace with hub dependency
   - SystemAssigned Managed Identities for both resources
   - Integration with Key Vault and Storage Account
   - Outputs: aiHubName, aiHubId, aiProjectName, aiProjectId, Managed Identity principals

2. **main.bicep** updated with:
   - aiHubName parameter (default: `proteinlens-ai-hub-prod`)
   - aiProjectName parameter (default: `proteinlens-ai-project-prod`)
   - enableAIFoundry feature flag (default: true)
   - AI Foundry module orchestration with proper dependencies
   - Outputs for AI resource identifiers

3. **Parameter files** (prod.parameters.json, dev.parameters.json):
   - Location changed from eastus to westus2
   - Added aiHubName and aiProjectName values
   - enableAIFoundry set to true

4. **Bicep validation**: ✅ PASSED
   ```bash
   az bicep build --file infra/bicep/main.bicep
   # Result: Successfully compiled with only warnings (no critical errors)
   ```

## Deployment Prerequisites

Before triggering deployment, verify:

1. **Azure Resources Cleaned Up**:
   ```bash
   az group list -o table  # Check for old 'protein-lens' or 'proteinlens-prod' groups
   # Consider deleting old groups to avoid conflicts:
   # az group delete --name protein-lens --yes --no-wait
   # az group delete --name proteinlens-prod --yes --no-wait
   ```

2. **Azure Subscription Set**:
   ```bash
   az account show  # Verify correct subscription is active
   ```

3. **GitHub Secrets Configured**:
   - AZURE_SUBSCRIPTION_ID
   - AZURE_CREDENTIALS (Service Principal with Contributor role)

## Deployment Instructions

### Option 1: Automated via GitHub Actions (Recommended)

```bash
gh workflow run infra.yml \
  -f environment=prod \
  -f confirm_deploy=deploy-infra
```

This will:
1. Validate Bicep template
2. Create resource group `proteinlens-prod-rg` in westus2
3. Deploy all infrastructure including AI Foundry
4. Automatically set `AZURE_STATIC_WEB_APPS_API_TOKEN` secret for frontend deployment
5. Output all resource identifiers

### Option 2: Manual Deployment via Azure CLI

```bash
# Set variables
RESOURCE_GROUP="proteinlens-prod-rg"
LOCATION="westus2"
TEMPLATE="infra/bicep/main.bicep"
PARAMS="infra/bicep/parameters/prod.parameters.json"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy infrastructure
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file $TEMPLATE \
  --parameters $PARAMS \
  --parameters postgresAdminPassword="<secure-password>"
```

## Post-Deployment Tasks

### 1. Verify Resource Creation
```bash
RESOURCE_GROUP="proteinlens-prod-rg"

# List all deployed resources
az resource list --resource-group $RESOURCE_GROUP -o table

# Verify AI Foundry resources specifically
az ml workspace list --resource-group $RESOURCE_GROUP -o table
```

### 2. Configure GPT-5.1 Model Access

After AI Hub/Project creation, configure the model deployment:

```bash
RESOURCE_GROUP="proteinlens-prod-rg"
AI_PROJECT="proteinlens-ai-project-prod"

# Deploy GPT-5.1 model in AI Project
az ml online-deployment create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $AI_PROJECT \
  --file model-deployment-config.yaml
```

### 3. Grant Function App AI Service Access

```bash
# Get Function App Managed Identity
FUNC_APP_IDENTITY=$(az functionapp identity show \
  --name proteinlens-api-prod \
  --resource-group $RESOURCE_GROUP \
  --query principalId -o tsv)

# Get AI Project ID
AI_PROJECT_ID=$(az ml workspace show \
  --name proteinlens-ai-project-prod \
  --resource-group $RESOURCE_GROUP \
  --query id -o tsv)

# Assign Contributor role on AI Project to Function App
az role assignment create \
  --assignee-object-id $FUNC_APP_IDENTITY \
  --role Contributor \
  --scope $AI_PROJECT_ID
```

### 4. Deploy Backend Function App

```bash
gh workflow run deploy-api.yml
# Deployments on push to main are automatic
```

### 5. Deploy Frontend Static Web App

```bash
gh workflow run deploy-web.yml
# Deployments on push to main are automatic
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Azure Resource Group                       │
│                   (proteinlens-prod-rg)                         │
│                       westus2 Region                            │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── [Function App] proteinlens-api-prod
    │   ├── Node 20 Runtime
    │   ├── App Insights: monitoring
    │   └── Managed Identity: → AI Project access
    │
    ├── [Static Web App] proteinlens-web-prod
    │   └── React/Vite Frontend (auto-deployed from GitHub)
    │
    ├── [PostgreSQL] proteinlens-db-prod
    │   └── Flexible Server (database)
    │
    ├── [Storage Account] plprodsa85
    │   ├── Function App: job storage
    │   └── ML Workspace: artifacts
    │
    ├── [Key Vault] proteinlens-kv-prod
    │   ├── Stripe API Key
    │   ├── DB Password
    │   ├── AI Hub/Project Credentials
    │   └── Model Endpoints
    │
    └── [AI Foundry]
        ├── [AI Hub] proteinlens-ai-hub-prod
        │   └── Managed Identity: AI resource management
        │
        └── [AI Project] proteinlens-ai-project-prod
            ├── Managed Identity: model deployment
            └── [Model] GPT-5.1
                └── Endpoint: for meal analysis
```

## Expected Deployment Time

- Infrastructure provisioning: ~15-20 minutes
- AI Foundry setup: ~5-10 minutes (included in above)
- Function App deployment: ~3-5 minutes
- Static Web App deployment: ~2-3 minutes

**Total: 25-35 minutes**

## Troubleshooting

### Issue: LocationIsOfferRestricted for PostgreSQL
**Solution**: Already fixed - region changed to westus2

### Issue: Key Vault already exists
**Solution**: Infrastructure already recovered soft-deleted Key Vault (`proteinlens-kv-prod`)

### Issue: Static Web App deployment fails
**Solution**: Infrastructure workflow automatically sets `AZURE_STATIC_WEB_APPS_API_TOKEN` secret

### Issue: AI Hub/Project creation times out
**Solution**: Normal for first-time deployment, wait 5-10 minutes and check resource status:
```bash
az ml workspace list --resource-group proteinlens-prod-rg -o table
```

## Next Steps

1. ✅ Bicep templates validated and committed
2. ✅ Parameters files updated for westus2 + AI Foundry
3. ⏳ **Trigger infrastructure deployment** (see Deployment Instructions above)
4. ⏳ Verify all resources created in Azure Portal
5. ⏳ Configure GPT-5.1 model endpoint
6. ⏳ Grant Function App access to AI services
7. ⏳ Test meal analysis with AI integration

## Reference Documentation

- [Azure AI Foundry Overview](https://learn.microsoft.com/en-us/azure/ai-studio/what-is-ai-studio)
- [Azure ML Workspaces](https://learn.microsoft.com/en-us/azure/machine-learning/concept-workspace)
- [Bicep Templates](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [GitHub Actions + Azure](https://github.com/Azure/webapps-deploy)

---

**Last Updated**: $(date)
**Deployment Status**: READY FOR DEPLOYMENT
**Region**: westus2
**AI Foundry Support**: ✅ GPT-5.1 integration available
