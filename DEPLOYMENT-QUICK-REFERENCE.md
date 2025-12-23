# ProteinLens Deployment Quick Reference Card

## Quick Links

- [OpenAI Foundry On-Demand](OPENAI-FOUNDRY-GUIDE.md) - Provision/rotate/teardown Azure OpenAI
- [Local Development](LOCAL-DEVELOPMENT.md) - Run locally
- [Full Deployment Guide](DEPLOYMENT-QUICKSTART.md) - Complete setup

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
| `.github/workflows/infra.yml` | Infrastructure provisioning workflow |
| `.github/workflows/deploy-api.yml` | Backend deployment workflow |
| `.github/workflows/deploy-web.yml` | Frontend deployment workflow |
| `infra/main.bicep` | Infrastructure as Code (IaC) entry point |
| `backend/src/functions/health.ts` | Health check endpoints |
| `scripts/smoke-test.sh` | Deployment validation script |
| `.github/SECRETS_README.md` | Secrets setup guide |

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

**Last Updated**: 2024-12-22  
**Version**: 1.0  
**Status**: Production Ready
