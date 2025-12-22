# GitHub Workflows for ProteinLens Deployment

This directory contains the automated deployment workflows for ProteinLens infrastructure, backend API, and frontend web application.

## Workflows Overview

### 1. **infra.yml** - Infrastructure Provisioning

**Trigger**: Manual (`workflow_dispatch`)

**Purpose**: Deploy all Azure infrastructure (Function App, Static Web App, PostgreSQL, Key Vault, Storage) using Bicep Infrastructure as Code.

**Prerequisites**:
- Azure subscription with sufficient quota
- Service Principal credentials (in `AZURE_CREDENTIALS` secret)
- Resource Group exists or will be created

**Workflow Steps**:
1. **Validate** - Syntax and deployment validation
2. **Deploy** - Create/update all Azure resources
3. **Seed Secrets** - Populate Key Vault with runtime secrets
4. **Grant Access** - Configure Function App Managed Identity permissions

**Required Secrets**:
- `AZURE_CREDENTIALS` - JSON with clientId, clientSecret, tenantId, subscriptionId
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID
- `AZURE_RESOURCE_GROUP` - Resource group name (created if needed)
- `DATABASE_ADMIN_PASSWORD` - PostgreSQL admin password
- `OPENAI_API_KEY` - OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

**Manual Run**:
```bash
gh workflow run infra.yml -f environment=prod -f confirm_deploy=deploy-infra
```

**Outputs**:
- Function App URL, name, Managed Identity ID
- Static Web App name, URL
- PostgreSQL server FQDN
- Key Vault name, URI
- Storage Account name, container name

---

### 2. **deploy-api.yml** - Backend Deployment

**Trigger**: 
- Automatic on push to `main` (path filter: `backend/**`)
- Manual (`workflow_dispatch`)

**Purpose**: Build, test, and deploy the TypeScript/Azure Functions backend with database migrations and health validation.

**Workflow Steps**:
1. **Build**
   - Setup Node.js 20
   - Install dependencies (`npm ci`)
   - Compile TypeScript
   - Run linting
   - Run unit tests
   - Package Function App deployment

2. **Deploy**
   - Login to Azure
   - Deploy to Azure Functions using publish profile
   - Wait for cold start (10s)

3. **Health Check**
   - Call `/api/health?deep=true` endpoint
   - Verify database, storage, and AI service connectivity
   - Retry up to 5 times with 5s backoff
   - Fail workflow if health check fails

4. **Summary** - Report results to GitHub Actions summary

**Required Secrets**:
- `AZURE_CREDENTIALS` - For Azure login
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` - Function App publish profile

**Key Environment Variables**:
- `AZURE_FUNCTIONAPP_NAME` - Function App name (default: `proteinlens-api-prod`)
- `NODE_VERSION` - Node.js version (default: `20`)

**Manual Run**:
```bash
gh workflow run deploy-api.yml
```

**Outputs**:
- Build artifacts (TypeScript compiled, node_modules)
- Deployment status and Function App URL
- Health check validation results

---

### 3. **deploy-web.yml** - Frontend Deployment

**Trigger**:
- Automatic on push to `main` (path filter: `frontend/**`)
- Manual (`workflow_dispatch`)

**Purpose**: Build the React/Vite frontend with production optimizations and deploy to Azure Static Web Apps.

**Workflow Steps**:
1. **Build**
   - Setup Node.js 20
   - Install dependencies (`npm ci`)
   - Build with Vite (with `VITE_API_URL` injected)
   - Verify build size (<300KB)
   - Run linting and tests

2. **Deploy**
   - Download build artifact
   - Deploy to Azure Static Web Apps using API token
   - Validate deployment token format

3. **Smoke Test**
   - Wait for deployment to propagate (15s)
   - Test homepage accessibility (HTTP 200)
   - Verify HTML content
   - Retry up to 5 times

4. **Summary** - Report results to GitHub Actions summary

**Required Secrets**:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Static Web Apps deployment token
- `GITHUB_TOKEN` - Automatic (provided by GitHub Actions)

**Key Environment Variables**:
- `VITE_API_URL` - Backend API URL (default: `https://proteinlens-api-prod.azurewebsites.net`)
- `NODE_VERSION` - Node.js version (default: `20`)

**Manual Run**:
```bash
gh workflow run deploy-web.yml
```

**Outputs**:
- Build artifacts (dist/ folder with optimized frontend)
- Deployment status and Static Web App URL
- Smoke test validation results

---

## Setup Instructions

### 1. Create GitHub Secrets

Required secrets (all **must** be set before running workflows):

```bash
# Infrastructure secrets
gh secret set AZURE_CREDENTIALS --body '{
  "clientId": "xxxx",
  "clientSecret": "xxxx",
  "tenantId": "xxxx",
  "subscriptionId": "xxxx"
}'

gh secret set AZURE_SUBSCRIPTION_ID --body "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
gh secret set AZURE_RESOURCE_GROUP --body "proteinlens-prod"

# Database secret
gh secret set DATABASE_ADMIN_PASSWORD --body "SecurePassword123!"

# API keys
gh secret set OPENAI_API_KEY --body "sk-..."
gh secret set STRIPE_SECRET_KEY --body "sk_live_..."
gh secret set STRIPE_WEBHOOK_SECRET --body "whsec_..."

# Deployment credentials (after first infrastructure deployment)
gh secret set AZURE_FUNCTIONAPP_PUBLISH_PROFILE --body "$(cat publish-profile.xml)"
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "..."
```

### 2. Create Bicep Parameter Files

Create environment-specific parameter files in `infra/bicep/parameters/`:

**prod.parameters.json**:
```json
{
  "parameters": {
    "location": { "value": "eastus" },
    "environmentName": { "value": "prod" },
    "appNamePrefix": { "value": "proteinlens" }
  }
}
```

**dev.parameters.json**:
```json
{
  "parameters": {
    "location": { "value": "eastus" },
    "environmentName": { "value": "dev" }
  }
}
```

### 3. Deploy Infrastructure

Run the infrastructure workflow manually:

```bash
gh workflow run infra.yml -f environment=prod -f confirm_deploy=deploy-infra
```

Monitor the deployment in GitHub Actions. Once complete, extract outputs:

```bash
# Get Function App publish profile
az webapp deployment list-publishing-profiles \
  --resource-group proteinlens-prod \
  --name proteinlens-api-prod \
  --xml > publish-profile.xml

gh secret set AZURE_FUNCTIONAPP_PUBLISH_PROFILE --body "$(cat publish-profile.xml)"

# Get Static Web Apps deployment token
az staticwebapp secrets list \
  --resource-group proteinlens-prod \
  --name proteinlens-web-prod \
  --query properties.apiKey -o tsv | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body -
```

### 4. Deploy Backend and Frontend

Once infrastructure is deployed and secrets are configured:

```bash
# Push changes to trigger automatic deployments
git push origin main

# Or manually trigger
gh workflow run deploy-api.yml
gh workflow run deploy-web.yml
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

1. **Secret Rotation**: Rotate GitHub Secrets quarterly
   - OpenAI API key
   - Stripe secret key
   - Database admin password

2. **Branch Protection**: Require status checks to pass before merging
   - All workflows must pass
   - Code review required (1 reviewer minimum)

3. **Audit Logs**: Monitor workflow execution
   - Check GitHub Secrets access (Settings → Actions → Repository Secrets)
   - Review Azure Activity Log for deployments
   - Monitor Application Insights for suspicious activity

4. **Least Privilege**: Workflows use minimal required permissions
   - Function App: Managed Identity with scoped Key Vault access
   - Service Principal: Deployment-only permissions
   - No PAT tokens or long-lived credentials

---

## Next Steps

1. ✅ Infrastructure workflow is ready for manual deployment
2. ✅ Backend and frontend workflows auto-trigger on push to main
3. ⏳ Configure CI/CD for feature branches (optional, Phase 2)
4. ⏳ Add approval gates for production deployments (optional, Phase 2)
5. ⏳ Setup notifications (Slack/Teams) for deployment status (optional, Phase 2)
