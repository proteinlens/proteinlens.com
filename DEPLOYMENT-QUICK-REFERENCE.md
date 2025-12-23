# ProteinLens Deployment Quick Reference Card

## Quick Links

- [OpenAI Foundry On-Demand](OPENAI-FOUNDRY-GUIDE.md) - Provision/rotate/teardown Azure OpenAI
- [Local Development](LOCAL-DEVELOPMENT.md) - Run locally
- [Full Deployment Guide](DEPLOYMENT-QUICKSTART.md) - Complete setup
- **[Unified One-Click Deploy](#unified-one-click-deploy)** - Single workflow for full stack (NEW)

## 1-Minute Setup

```bash
# Clone repo
git clone https://github.com/your-org/proteinlens.com.git && cd proteinlens.com

# Create .env files (see LOCAL-DEVELOPMENT.md for templates)
cp .env.example .env.local

# Install dependencies
npm ci --prefix backend && npm ci --prefix frontend

# Start local dev
npm run dev --prefix backend &
npm run dev --prefix frontend &
```

## GitHub Secrets Checklist

Before deploying, add these secrets in **Settings → Secrets and variables → Actions**:

| Secret | Value | How to Get |
|--------|-------|-----------|
| `AZURE_CLIENT_ID` | Service principal client ID (OIDC) | `az ad sp create-for-rbac` |
| `AZURE_TENANT_ID` | Your tenant ID | `az account show --query tenantId` |
| `AZURE_SUBSCRIPTION_ID` | Your subscription ID | `az account show --query id` |
| `DATABASE_ADMIN_PASSWORD` | PostgreSQL admin password | Generate: `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Stripe secret key | Get from https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Create webhook endpoint, copy secret |

**⚠️ No longer needed** (moved to Key Vault):
- ~~`OPENAI_API_KEY`~~ → Now provisioned via [OpenAI Foundry workflow](OPENAI-FOUNDRY-GUIDE.md)

**Auto-generated** (added after infra deploy):
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
- `AZURE_STATIC_WEB_APPS_API_TOKEN`

## OpenAI Foundry Setup (On-Demand)

**After infrastructure is deployed**, provision OpenAI resources:

```bash
# Provision Azure OpenAI for your environment
gh workflow run foundry-on-demand.yml \
  -f action=up \
  -f env=prod \
  -f region=eastus

# Rotate key periodically (zero downtime)
gh workflow run foundry-on-demand.yml \
  -f action=rotate-key \
  -f env=prod

# Teardown when not needed (cost savings)
gh workflow run foundry-on-demand.yml \
  -f action=down \
  -f env=dev
```

See [OPENAI-FOUNDRY-GUIDE.md](OPENAI-FOUNDRY-GUIDE.md) for complete details.

## 60-Minute Deployment

### Step 1: Create Infrastructure (15-20 min)
```bash
# Trigger infrastructure workflow
gh workflow run infra.yml \
  -f environment=prod \
  -f confirm_deploy=deploy-infra

# Watch workflow progress
gh run list --workflow infra.yml
gh run view <run-id> --log

# After success, note the outputs:
# - Function App URL: https://proteinlens-api-prod.azurewebsites.net
# - Static Web App URL: https://proteinlens-web-prod.azurewebsites.net
# - Key Vault URL: https://proteinlens-kv-prod.vault.azure.net/
```

### Step 2: Deploy Backend (5 min)
```bash
# Backend deploys automatically when pushing to main
git add . && git commit -m "feat: deploy api" && git push origin main

# Or manually trigger
gh workflow run deploy-api.yml

# Watch for success
gh run watch
```

### Step 3: Deploy Frontend (8 min)
```bash
# Frontend deploys automatically when pushing to main
git push origin main

# Or manually trigger
gh workflow run deploy-web.yml

# Verify deployment
curl https://proteinlens-web-prod.azurewebsites.net
```

### Step 4: Verify Health Checks (2 min)
```bash
# Test backend health endpoint
curl https://proteinlens-api-prod.azurewebsites.net/api/health | jq

# Should return:
# {
#   "status": "healthy",
#   "checks": {
#     "database": { "status": "ok" },
#     "storage": { "status": "ok" },
#     "ai": { "status": "ok" }
#   }
# }

# Test frontend accessibility
curl -I https://proteinlens-web-prod.azurewebsites.net
# Should return: HTTP/1.1 200 OK
```

---

## Unified One-Click Deploy

**New in v3**: Single workflow deploys infrastructure + backend + frontend with zero manual steps.

### Prerequisites

Add these GitHub Secrets (Settings → Secrets and variables → Actions):

| Secret | Value | How to Get |
|--------|-------|-----------|
| `AZURE_CLIENT_ID` | Service principal client ID | `az ad sp create-for-rbac --name proteinlens-deployer --role Contributor --scopes /subscriptions/{sub-id}` |
| `AZURE_TENANT_ID` | Your tenant ID | `az account show --query tenantId -o tsv` |
| `AZURE_SUBSCRIPTION_ID` | Your subscription ID | `az account show --query id -o tsv` |
| `DATABASE_ADMIN_PASSWORD` | PostgreSQL password | `openssl rand -base64 32` |
| `OPENAI_API_KEY` | OpenAI key (optional) | Portal or create via foundry workflow |
| `STRIPE_SECRET_KEY` | Stripe key | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Create endpoint in Stripe |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | Function publish profile | Auto-created after first deploy OR `az functionapp deployment list-publishing-profiles ...` |

### Run the Unified Workflow

**Option A: GitHub UI**
1. Go to Actions → "Deploy All (Infra → Backend → Frontend)"
2. Click "Run workflow"
3. Select environment: `prod` (default)
4. Resource group: `proteinlens-prod-v3` (default)
5. Click "Run workflow" button

**Option B: GitHub CLI**
```bash
gh workflow run deploy-all.yml \
  --ref main \
  -f environment=prod \
  -f resource_group=proteinlens-prod-v3
```

### What It Does (Automatically)

1. **Infra Job** (~15-20 min)
   - ✅ Validates Bicep templates
   - ✅ Checks storage account naming rules
   - ✅ Runs `what-if` to verify idempotency
   - ✅ Creates resource group if needed
   - ✅ Provisions Azure resources:
     - Key Vault (secrets storage)
     - Storage Account (blob storage)
     - PostgreSQL Flexible Server
     - Function App (Premium EP1 plan)
     - Static Web App (frontend)
     - Front Door Standard (global CDN)
   - ✅ Configures Front Door custom domains (www.proteinlens.com, api.proteinlens.com)
   - ✅ Automates DNS records (CNAME + TXT validation) if Azure DNS zone exists
   - ✅ Polls for managed certificate validation
   - ✅ Retrieves Static Web Apps deployment token

2. **Backend Job** (~5-8 min)
   - ✅ Builds backend (npm ci + build)
   - ✅ Generates Prisma client
   - ✅ Stages deployment package (.deploy folder)
   - ✅ Validates host.json is present (preflight)
   - ✅ Deploys to Function App
   - ✅ Restarts Function App (refreshes Key Vault references)
   - ✅ Health checks API endpoint with retries (20 attempts, 10s backoff)
   - ✅ Validates app settings use Key Vault references (security scan)

3. **Frontend Job** (~3-5 min)
   - ✅ Builds frontend (npm ci + build)
   - ✅ Validates dist/index.html exists with correct title (preflight)
   - ✅ Deploys to Static Web App
   - ✅ Smoke tests public endpoint (20 retries, 10s backoff)
   - ✅ Generates deployment outputs artifact (JSON)
   - ✅ Uploads artifact for audit trail (30-day retention)

### Monitoring the Deployment

**Live Logs (GitHub UI)**:
- Go to Actions → Latest run → Click job name → Expand steps

**CLI Monitoring**:
```bash
# Watch latest workflow run
gh run watch

# View specific run logs
gh run view <run-id> --log

# List recent runs
gh run list --workflow deploy-all.yml --limit 5
```

### Expected URLs After Deploy

| Service | Default URL | Custom Domain (if DNS enabled) |
|---------|-------------|--------------------------------|
| Frontend | `https://{swa-name}.azurestaticapps.net` | `https://www.proteinlens.com` |
| Backend API | `https://{function-app}.azurewebsites.net` | `https://api.proteinlens.com` |
| Front Door | `https://{fd-name}.azurefd.net` | Routes both custom domains |

### Post-Deploy Verification

```bash
# 1. Test API health (via custom domain or direct)
curl https://api.proteinlens.com/api/health | jq
# OR
curl https://proteinlens-api-prod.azurewebsites.net/api/health | jq

# 2. Test frontend (via custom domain or direct)
curl -I https://www.proteinlens.com
# OR
curl -I https://{swa-name}.azurestaticapps.net

# 3. Download deployment outputs artifact
gh run list --workflow deploy-all.yml --limit 1 --json databaseId -q '.[0].databaseId' | \
  xargs -I {} gh run download {} --name deployment-outputs-prod

# 4. Check artifact matches schema
cat deployment-outputs.json | jq
```

### Idempotency & Re-runs

The workflow is fully idempotent. Re-running it will:
- Skip already-provisioned resources
- Update configurations if parameters changed
- Not disrupt running services
- Complete in ~5-10 min (vs initial 25-30 min)

**What-if validation** runs before deploy to show exactly what will change.

### Troubleshooting Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing backend/.deploy/host.json` | Packaging step failed | Check "Stage deployment folder" step; ensure `cp host.json .deploy/` ran |
| `Frontend marker missing` | Build used wrong template | Verify frontend/index.html has `<title>ProteinLens</title>` |
| `Storage name exceeds 24 chars` | RG name too long | Use shorter resource group name (≤16 chars recommended) |
| `DNS zone not found` | No Azure DNS zone for proteinlens.com | Create zone: `az network dns zone create -g dns-rg -n proteinlens.com` or deploy without custom domains |
| `Health check failed` | Function app cold start or error | Check logs: `az functionapp log tail -g {rg} -n {app}` |
| `Domain validation timeout` | DNS propagation delay | Wait 5-10 min; re-run workflow to retry polling |

### Manual DNS Setup (if Azure DNS not used)

If you don't have an Azure DNS zone, add these records to your DNS provider after deploy:

```bash
# 1. Get Front Door endpoint hostname from workflow outputs
FD_HOST=$(az afd endpoint show -g {rg} --profile-name {fd-name} --endpoint-name {ep-name} --query hostName -o tsv)

# 2. Add CNAME records in your DNS provider:
www.proteinlens.com.  CNAME  ${FD_HOST}
api.proteinlens.com.  CNAME  ${FD_HOST}

# 3. Get validation tokens
WWW_TOKEN=$(az afd custom-domain show -g {rg} --profile-name {fd-name} --custom-domain-name www --query properties.validationProperties.validationToken -o tsv)
API_TOKEN=$(az afd custom-domain show -g {rg} --profile-name {fd-name} --custom-domain-name api --query properties.validationProperties.validationToken -o tsv)

# 4. Add TXT records for validation:
_dnsauth.www.proteinlens.com.  TXT  ${WWW_TOKEN}
_dnsauth.api.proteinlens.com.  TXT  ${API_TOKEN}

# 5. Wait for validation (check every 5 min):
az afd custom-domain show -g {rg} --profile-name {fd-name} --custom-domain-name www --query properties.domainValidationState
```

### Rollback Procedure

```bash
# 1. List recent deployments
az deployment sub list --query "[0:5].{name:name, timestamp:properties.timestamp, state:properties.provisioningState}" -o table

# 2. If current deployment is broken, redeploy previous version:
git log --oneline -10  # Find last good commit
git revert <bad-commit-sha>
git push origin main

# 3. Or manually trigger rollback workflow with previous parameters
gh workflow run deploy-all.yml -f environment=prod -f resource_group=proteinlens-prod-v3

# 4. Emergency: Delete recent deployment and re-run
az deployment sub delete --name proteinlens-prod-<timestamp>
gh workflow run deploy-all.yml
```

### Cost Optimization

After deployment, to reduce costs during low-traffic periods:

```bash
# Teardown non-prod environments
az group delete --name proteinlens-dev --yes --no-wait

# Scale down Function App (prod)
az functionapp update -g proteinlens-prod -n proteinlens-api-prod --set properties.siteConfig.alwaysOn=false

# Stop PostgreSQL (non-prod)
az postgres flexible-server stop -g proteinlens-dev -n proteinlens-db-dev
```

---

### Step 5: Add Post-Deployment Secrets (5 min)
```bash
# Extract publish profile from infrastructure deployment
az functionapp deployment list-publishing-profiles \
  --resource-group proteinlens-prod \
  --name proteinlens-api-prod \
  --output xml > publish-profile.xml

# Add to GitHub Secrets
cat publish-profile.xml | pbcopy
# Paste into: Settings → Secrets → AZURE_FUNCTIONAPP_PUBLISH_PROFILE

# Get Static Web App deployment token
az staticwebapp secrets list \
  --resource-group proteinlens-prod \
  --name proteinlens-web-prod

# Add to GitHub Secrets
# Settings → Secrets → AZURE_STATIC_WEB_APPS_API_TOKEN
```

## Monitoring Commands

```bash
# View function app logs
az functionapp log download \
  --resource-group proteinlens-prod \
  --name proteinlens-api-prod \
  --destination logs.zip

# Check Application Insights
az monitor app-insights query \
  --app proteinlens-insights-prod \
  --resource-group proteinlens-prod \
  --analytics-query "exceptions | where timestamp > ago(1h)"

# View Key Vault secrets
az keyvault secret list \
  --vault-name proteinlens-kv-prod \
  --output table

# Check PostgreSQL status
az postgres flexible-server show \
  --resource-group proteinlens-prod \
  --server-name proteinlens-db-prod
```

## Common Issues & Quick Fixes

| Problem | Command | Notes |
|---------|---------|-------|
| **Health check fails** | `curl -v https://api.url/api/health` | Wait 30s for cold start |
| **Database not connecting** | `psql -h db.url -U user@host -d proteinlens -c "SELECT 1"` | Check firewall rules |
| **Secret not found** | `az keyvault secret list --vault-name kv-name` | Create missing secrets |
| **Permission denied** | `az role assignment list --assignee client-id` | Grant Contributor role |
| **Build size too large** | `npm run build -- --report` | Optimize dependencies |

## Troubleshooting Resources

- **Local Setup**: See [LOCAL-DEVELOPMENT.md](LOCAL-DEVELOPMENT.md)
- **Security**: See [.github/SECURITY-CHECKLIST.md](.github/SECURITY-CHECKLIST.md)
- **Errors**: See [.github/DEPLOYMENT_TROUBLESHOOTING.md](.github/DEPLOYMENT_TROUBLESHOOTING.md)
- **Workflow Issues**: See [.github/workflows/README.md](.github/workflows/README.md)
- **Branch Protection**: See [.github/BRANCH-PROTECTION.md](.github/BRANCH-PROTECTION.md)

## Key File Locations

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-all.yml` | **Unified deployment workflow (infra + backend + frontend)** |
| `.github/workflows/infra.yml` | Infrastructure provisioning workflow (legacy) |
| `.github/workflows/deploy-api.yml` | Backend deployment workflow (legacy) |
| `.github/workflows/deploy-web.yml` | Frontend deployment workflow (legacy) |
| `infra/bicep/subscription-main.bicep` | Subscription-scoped IaC entry point |
| `infra/bicep/main.bicep` | Resource group-scoped IaC orchestrator |
| `backend/src/functions/health.ts` | Health check endpoints |
| `scripts/smoke-test.sh` | Deployment validation script |
| `.github/SECRETS_README.md` | Secrets setup guide |
| `specs/001-unified-azure-deploy/` | Unified deploy feature specification |

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version:

# 1. View recent deployments
az deployment group list \
  --resource-group proteinlens-prod \
  --query "[0:5].{name:name, timestamp:properties.timestamp}"

# 2. Delete failed deployment
az deployment group delete \
  --resource-group proteinlens-prod \
  --name <failed-deployment-name>

# 3. Redeploy
gh workflow run infra.yml -f environment=prod -f confirm_deploy=deploy-infra

# 4. Or manually deploy backend/frontend
git revert <commit-hash> && git push origin main
```

## Emergency Contacts

| Issue Type | Channel | Time |
|-----------|---------|------|
| Azure Service Status | https://status.azure.com | Real-time |
| GitHub Status | https://www.githubstatus.com | Real-time |
| Support Case | Azure Portal → Help + Support | 2-4 hours |

## More Information

- [Full Deployment Guide](DEPLOYMENT-QUICKSTART.md)
- [Project README](README.md)
- [Feature Specification](specs/004-azure-deploy-pipeline/spec.md)
- [Architecture Overview](specs/004-azure-deploy-pipeline/plan.md)
- [Database Schema](specs/004-azure-deploy-pipeline/data-model.md)

---

**Last Updated**: 2025-12-23  
**Version**: 3.0 (Unified Deploy)  
**Status**: Production Ready
