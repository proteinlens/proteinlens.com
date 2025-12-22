# Quick Start: Deploy ProteinLens to Azure

**Status**: All workflows ready - configure secrets and deploy!  
**Estimated Time**: 1 hour setup + 30 minutes deployment  

---

## 🚀 Step 1: Create Azure Service Principal (5 min)

```bash
# Create service principal
az ad sp create-for-rbac --name "proteinlens-gh-actions" \
  --role "Contributor" \
  --scopes "/subscriptions/YOUR_SUBSCRIPTION_ID"

# Save the JSON output - you'll need it next
# Example output:
# {
#   "clientId": "...",
#   "clientSecret": "...",
#   "tenantId": "...",
#   "subscriptionId": "...",
# }
```

---

## 🔐 Step 2: Configure GitHub Secrets (10 min)

**Navigate**: Your GitHub repo → Settings → Secrets and variables → Actions → Repository secrets

**Create these 9 secrets**:

### Mandatory Secrets

```bash
# 1. Azure Service Principal (from step 1)
gh secret set AZURE_CREDENTIALS --body '{paste-entire-json-from-above}'

# 2. Subscription ID
gh secret set AZURE_SUBSCRIPTION_ID --body "YOUR_SUBSCRIPTION_ID"

# 3. Resource Group (will be created)
gh secret set AZURE_RESOURCE_GROUP --body "proteinlens-prod"

# 4. Database Admin Password (must be complex!)
gh secret set DATABASE_ADMIN_PASSWORD --body "P@ssw0rd-Secure123!"

# 5. OpenAI API Key (get from https://platform.openai.com/api-keys)
gh secret set OPENAI_API_KEY --body "sk-..."

# 6. Stripe Secret Key (get from https://dashboard.stripe.com)
gh secret set STRIPE_SECRET_KEY --body "sk_live_..."

# 7. Stripe Webhook Secret (get from Stripe Dashboard → Webhooks)
gh secret set STRIPE_WEBHOOK_SECRET --body "whsec_..."
```

Verify all 7 are set:
```bash
gh secret list
```

---

## 🏗️ Step 3: Deploy Infrastructure (15-20 min)

### Via GitHub UI
1. Go to **Actions** → **Deploy Infrastructure**
2. Click **Run workflow**
3. Select environment: **prod**
4. Enter confirmation: `deploy-infra`
5. Click **Run workflow**
6. Monitor the progress (watch logs)

### Via CLI
```bash
gh workflow run infra.yml \
  -f environment=prod \
  -f confirm_deploy=deploy-infra

# Watch progress
gh run watch
```

**✅ Success indicators**:
- All jobs pass (validate, deploy, seed-secrets, grant-access)
- Deployment summary shows resource names and URLs
- Check Azure Portal: Resource Group "proteinlens-prod" exists with all resources

---

## 📋 Step 4: Extract Deployment Credentials (5 min)

After infrastructure deployment completes:

```bash
# Get Function App publish profile
az webapp deployment list-publishing-profiles \
  --resource-group proteinlens-prod \
  --name proteinlens-api-prod \
  --xml > publish-profile.xml

# Add to GitHub Secrets
gh secret set AZURE_FUNCTIONAPP_PUBLISH_PROFILE --body "$(cat publish-profile.xml)"

# Get Static Web Apps deployment token
SWATOKENID=$(az staticwebapp secrets list \
  --resource-group proteinlens-prod \
  --name proteinlens-web-prod \
  --query properties.apiKey -o tsv)

gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "$SWATOKENID"

# Verify
gh secret list | grep -E "PROFILE|SWA"
```

---

## 🚀 Step 5: Deploy Backend & Frontend (5-8 min each)

### Option A: Automatic (Recommended)
```bash
# Push any change to main
git commit -m "trigger deployment" --allow-empty
git push origin main

# Backend and frontend will deploy automatically
# Go to Actions to monitor
```

### Option B: Manual
```bash
# Trigger backend
gh workflow run deploy-api.yml

# Trigger frontend  
gh workflow run deploy-web.yml

# Watch
gh run watch
```

**✅ Success indicators**:
- Both workflows show ✅ in Actions
- Health check passes (backend shows "healthy")
- Frontend smoke test passes

---

## ✔️ Step 6: Verify Deployment (5 min)

```bash
# Test health endpoint
curl -s https://proteinlens-api-prod.azurewebsites.net/api/health | jq .

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-12-22T...",
#   "version": "1.0.0",
#   "uptime": 1234,
#   "checks": {
#     "database": { "status": "pass" },
#     "blobStorage": { "status": "pass" },
#     "aiService": { "status": "pass" }
#   }
# }

# Test frontend
curl -s https://proteinlens.azurestaticapps.net/ | head -20
# Should see HTML content

# Run smoke tests locally
export FUNCTION_APP_URL=https://proteinlens-api-prod.azurewebsites.net
export STATIC_WEB_APP_URL=https://proteinlens.azurestaticapps.net
./scripts/smoke-test.sh
```

---

## 📊 Verification Checklist

- [ ] All 9 GitHub Secrets set
- [ ] Infrastructure deployment completed successfully
- [ ] Resource Group visible in Azure Portal (8 resources)
- [ ] Deployment credentials extracted (publish profile + SWA token)
- [ ] Backend deployment succeeded
- [ ] Frontend deployment succeeded
- [ ] Health endpoint returns status="healthy"
- [ ] Frontend loads at HTTPS URL
- [ ] Smoke tests pass locally

---

## 🔍 Troubleshooting

### "Secret not found" error
```bash
gh secret list
# All 9 secrets should appear
```

### Infrastructure deployment fails
```bash
# Check resource group exists
az group list --query "[?name=='proteinlens-prod']"

# Check bicep syntax
az bicep build infra/bicep/main.bicep

# Check Key Vault access
az keyvault show --name proteinlens-kv-prod
```

### Health check fails
```bash
# Check Function App logs
az webapp log tail --name proteinlens-api-prod --resource-group proteinlens-prod

# Check Application Insights
az monitor app-insights component show \
  --name proteinlens-insights-prod \
  --resource-group proteinlens-prod
```

### Frontend doesn't load
```bash
# Check Static Web App status
az staticwebapp show \
  --name proteinlens-web-prod \
  --resource-group proteinlens-prod

# Check deployment logs
az staticwebapp log list \
  --name proteinlens-web-prod \
  --resource-group proteinlens-prod
```

---

## 📚 Documentation

- **Complete Workflow Guide**: [.github/workflows/README.md](.github/workflows/README.md)
- **Secrets Setup & Rotation**: [.github/SECRETS_README.md](.github/SECRETS_README.md)
- **Implementation Details**: [DEPLOYMENT-PIPELINE-IMPLEMENTATION.md](DEPLOYMENT-PIPELINE-IMPLEMENTATION.md)
- **Feature 004 Spec**: [specs/004-azure-deploy-pipeline/](specs/004-azure-deploy-pipeline/)

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| 1. Create Service Principal | 5 min | ⏳ TODO |
| 2. Configure Secrets | 10 min | ⏳ TODO |
| 3. Deploy Infrastructure | 20 min | ⏳ TODO |
| 4. Extract Credentials | 5 min | ⏳ TODO |
| 5. Deploy Backend & Frontend | 15 min | ⏳ TODO |
| 6. Verify Deployment | 5 min | ⏳ TODO |
| **TOTAL** | **60 min** | 🎯 |

---

## 🎉 You're Done!

Your ProteinLens infrastructure is live with:
- ✅ Automated infrastructure provisioning
- ✅ Automated backend deployment
- ✅ Automated frontend deployment
- ✅ Health monitoring and validation
- ✅ Secret management via Key Vault
- ✅ CI/CD fully configured

**Next Steps**:
1. Monitor deployments in GitHub Actions
2. Set up Azure Monitor alerts (optional)
3. Configure custom domain (optional)
4. Set up Slack notifications (optional)
5. Regular secret rotation (quarterly)

---

**Questions?** Check the troubleshooting sections or review the full documentation.

**Everything ready!** 🚀
