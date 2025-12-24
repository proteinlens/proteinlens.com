# GitHub Workflows for ProteinLens Deployment

This directory contains the automated deployment workflow for ProteinLens infrastructure, backend API, and frontend web application.

## Workflows Overview

### 1. **deploy.yml** — Incremental Infra + App Deploy

**Trigger**: Automatic on push to `main`; Manual (`workflow_dispatch`)

**Purpose**: Idempotent infrastructure first, then incremental application deploys:
- Infra updates via Bicep (`infra/bicep/main.bicep`)
- Backend deploy only when `backend/**` changes
- Frontend deploy only when `frontend/**` changes
- Smoke tests verify API and Web endpoints

**Prerequisites**:
- Azure subscription with sufficient quota
- GitHub OIDC federated credentials for Azure login (no client secret)
- Repository variables configured (see below)

**Workflow Steps**:
1. **Changes Detection** — Path filters: `infra/**`, `backend/**`, `frontend/**`
2. **Tests** — Run unit tests for changed app components
3. **Infra** — Azure login (OIDC) → Bicep deploy → outputs capture
4. **Infra Validation** — Seed Key Vault secrets; grant Function App identity access; add CORS for SWA
5. **Env URLs** — Compute API/Web URLs for current environment
6. **Backend Deploy** — Build, Prisma migrate (CI), zip deploy
7. **Frontend Deploy** — Build, SWA deploy using token fetched via Azure CLI
8. **Smoke Tests** — API `GET /api/health` and Web `GET /` with retry/backoff

**Required Repository Variables**:
- `AZURE_TENANT_ID` — Azure tenant ID
- `AZURE_SUBSCRIPTION_ID` — Azure subscription ID
- `AZURE_RESOURCE_GROUP` — Resource group name
- `AZURE_LOCATION` — Azure region (must be `northeurope` per Bicep)
- `DNS_ZONE_NAME` — Domain zone (e.g., `proteinlens.com`)
- `FUNCTION_APP_NAME` — Azure Function App name
- `STATIC_WEB_APP_NAME` — Azure Static Web App name
- `AZURE_WHAT_IF` — Optional (`true` to preview infra changes)

**Required GitHub Secret (non-sensitive)**:
- `AZURE_CLIENT_ID` — Client ID for OIDC federated credential (GUID; not a secret)

**Secrets Policy (Key Vault Supremacy)**:
- Sensitive credentials (database admin password, OpenAI API key, Stripe keys) MUST NOT be stored in GitHub Secrets
- These secrets are stored in Azure Key Vault and referenced by the Function App at runtime
- The workflow seeds Key Vault values and grants access to the Function App’s managed identity

**Manual Run**:
```bash
gh workflow run deploy.yml
```

**Outputs**:
- Function App URL, name, Managed Identity principal ID
- Static Web App name, URL
- PostgreSQL server FQDN (from infra outputs)
- Key Vault name, URI
- Storage Account name

---

## Setup Instructions

### 1. Configure OIDC and Repository Variables

```bash
# Set non-sensitive secret: OIDC Client ID (GUID)
gh secret set AZURE_CLIENT_ID --body "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Set repository variables (recommended)
gh variable set AZURE_TENANT_ID --value "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
gh variable set AZURE_SUBSCRIPTION_ID --value "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
gh variable set AZURE_RESOURCE_GROUP --value "proteinlens-prod"
gh variable set AZURE_LOCATION --value "northeurope"
gh variable set DNS_ZONE_NAME --value "proteinlens.com"
gh variable set FUNCTION_APP_NAME --value "proteinlens-api-prod"
gh variable set STATIC_WEB_APP_NAME --value "proteinlens-web-prod"
gh variable set AZURE_WHAT_IF --value "false"
```

### 2. Key Vault Secrets (do NOT store in GitHub)

Sensitive secrets live in Azure Key Vault and are referenced at runtime:
- `database-url` (constructed from PostgreSQL FQDN, admin username+password, database name)
- `openai-api-key` (if using Azure OpenAI)
- `stripe-secret-key`, `stripe-webhook-secret` (if using Stripe)
- `blob-storage-connection`

The workflow seeds these secrets via Azure CLI after infra deployment and grants Function App access.

### 3. Create Bicep Parameter Files

Create environment-specific parameter files in `infra/bicep/parameters/`:

**prod.parameters.json**:
```json
{
  "parameters": {
      "location": { "value": "northeurope" },
    "environmentName": { "value": "prod" },
    "appNamePrefix": { "value": "proteinlens" }
  }
}
```

**dev.parameters.json**:
```json
{
  "parameters": {
      "location": { "value": "northeurope" },
    "environmentName": { "value": "dev" }
  }
}
```

### 4. Deploy Infrastructure

Run the infrastructure workflow manually:

```bash
gh workflow run deploy.yml
```

Monitor the deployment in GitHub Actions. Once complete, extract outputs:

```bash
# (No publish profile or SWA token secrets required)
# SWA deployment token is fetched at runtime via Azure CLI in the workflow.
```

### 5. Deploy Backend and Frontend

Once infrastructure is deployed and secrets are configured:

```bash
# Push changes to trigger incremental deployments
git push origin main

# Or manually trigger the unified workflow
gh workflow run deploy.yml
```

---

## Workflow Status & Monitoring

### View Workflow Runs

```bash
# List all workflow runs
gh run list

# Watch a specific workflow
gh run watch <run-id>

# View workflow logs
gh run view <run-id> --log
```

### GitHub Actions Summaries

Each workflow posts a detailed summary to the GitHub Actions UI, including:
- Component status (Build, Deploy, Health Check, Smoke Test)
- Resource URLs and names
- Deployment duration
- Error details (if any)

### Azure Portal Monitoring

Monitor deployments in Azure Portal:
- **Resource Group** → Check resource creation status
- **Function App** → Monitor logs in Application Insights
- **Static Web Apps** → View build logs and deployment status
- **Key Vault** → Verify secrets are accessible

---

## Troubleshooting

### Infrastructure Deployment Fails

**Problem**: Bicep validation fails
- Check parameter file syntax in `infra/bicep/parameters/`
- Verify resource names are globally unique (Storage Account, Key Vault)
- Check Azure quota limits

**Problem**: Key Vault secret creation fails
- Verify GitHub Secrets are set correctly
- Check Key Vault access policy for service principal

### Backend Deployment Fails

**Problem**: Build fails
- Check `npm ci` output for missing dependencies
- Verify TypeScript compilation errors
- Check Node.js version matches `node-version: '20'`

**Problem**: Health check fails after deployment
- Wait additional time for cold start (Function Apps take 10-30s on first deployment)
- Check Application Insights logs for errors
- Verify environment variables are set in Function App settings

### Frontend Deployment Fails

**Problem**: Build size exceeds limit
- Check for large dependencies in `package.json`
- Verify tree-shaking is enabled in `vite.config.ts`
- Review JavaScript bundle in dist/ folder

**Problem**: Smoke test fails
- Static Web Apps deployment can take 1-2 minutes
- Check Static Web Apps deployment status in Azure Portal
- Verify VITE_API_URL is correct

---

## Manual Testing

Run smoke tests locally:

```bash
# Test production deployment
export FUNCTION_APP_URL=https://proteinlens-api-prod.azurewebsites.net
export STATIC_WEB_APP_URL=https://proteinlens.azurestaticapps.net
./scripts/smoke-test.sh

# Test with custom URLs
FUNCTION_APP_URL=http://localhost:7071 STATIC_WEB_APP_URL=http://localhost:5173 ./scripts/smoke-test.sh
```

---

## Security Best Practices

1. **Secret Rotation**: Rotate Key Vault secrets per policy (no sensitive GitHub Secrets)
   - OpenAI API key (Key Vault)
   - Stripe secret key (Key Vault)
   - Database admin password (Key Vault)

2. **Branch Protection**: Require status checks to pass before merging
   - All workflows must pass
   - Code review required (1 reviewer minimum)

3. **Audit Logs**: Monitor workflow execution
   - Check GitHub Secrets access (Settings → Actions → Repository Secrets)
   - Review Azure Activity Log for deployments
   - Monitor Application Insights for suspicious activity

4. **Least Privilege**: Workflows use minimal required permissions
   - Function App: Managed Identity with scoped Key Vault access
   - OIDC federated credential: RG-scoped contributor for deploy; SWA/Functions contributor as needed
   - No PAT tokens or long-lived credentials; no publish profiles

---

## Next Steps

1. ✅ Infrastructure workflow is ready for manual deployment
2. ✅ Backend and frontend workflows auto-trigger on push to main
3. ⏳ Configure CI/CD for feature branches (optional, Phase 2)
4. ⏳ Add approval gates for production deployments (optional, Phase 2)
5. ⏳ Setup notifications (Slack/Teams) for deployment status (optional, Phase 2)
