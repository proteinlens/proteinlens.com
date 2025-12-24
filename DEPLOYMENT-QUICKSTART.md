# Quick Start: Deploy ProteinLens to Azure

**Status**: Unified OIDC deploy ready — configure one secret + variables  
**Estimated Time**: 20 minutes setup + 30 minutes deployment  

---

## 🚀 Step 1: Configure Azure OIDC + Repo Variables (10 min)

The pipeline uses Azure OpenID Connect (OIDC) — no client secrets or publish profiles. Create a federated credential for GitHub Actions and capture the App (Client) ID.

```bash
# Prereqs: Azure CLI 2.63+, Owner on subscription

# 1) Create an AAD App (or reuse an existing one)
az ad app create --display-name "proteinlens-github-oidc" --query appId -o tsv
# Copy the returned value as APP_ID

# 2) Grant the app Contributor at resource-group scope
az role assignment create \
  --assignee APP_ID \
  --role Contributor \
  --scope "/subscriptions/$SUB_ID/resourceGroups/proteinlens-prod"

# 3) Add federated credential for this GitHub repo (replace ORG/REPO)
az ad app federated-credential create \
  --id APP_ID \
  --parameters '{
    "name": "gh-actions",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:ORG/REPO:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# 4) In GitHub → Settings → Secrets and variables → Actions:
#    - Add secret AZURE_CLIENT_ID = APP_ID
#    - Add variables: AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID, AZURE_RESOURCE_GROUP, DNS_ZONE_NAME
#    - Add variable: AZURE_DNS_RESOURCE_GROUP (resource group containing the DNS zone)
#    - Optional variable: AZURE_WHAT_IF (set 'false' to skip infra idempotency what-if)
```

---

## 🔐 Step 2: Key Vault Supremacy (No Sensitive Repo Secrets)

All application secrets (database URL, OpenAI, Stripe, storage) are created and stored in Azure Key Vault by the workflow, and the Function App accesses them via Key Vault references.

- Required secret: `AZURE_CLIENT_ID` (Client ID of the OIDC AAD App)
- Required variables: `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `DNS_ZONE_NAME`, `AZURE_DNS_RESOURCE_GROUP`
- No publish profiles or SWA tokens are needed; the workflow fetches runtime tokens where required.

### Production DNS Gate (main branch)
- The orchestrator enforces a DNS gate on `main`.
- It requires the Azure DNS zone for `proteinlens.com` to exist in `AZURE_DNS_RESOURCE_GROUP`.
- If missing, the run fails fast with guidance. Non-production branches skip this gate and use default hostnames.

---

## 🏗️ Step 3: Run Orchestrated Deploy (Infra-first)

### Via GitHub UI
1. Go to **Actions** → **Deploy**
2. Click **Run workflow**
3. Confirm run on branch `main` (prod)
4. Monitor progress — infra deploys first (with idempotency what-if), then validation + secret seeding, then incremental app deploys

### Via CLI
```bash
gh workflow run deploy.yml
gh run watch
```

**✅ Success indicators**:
- All jobs pass (validate, deploy, seed-secrets, grant-access)
- Deployment summary shows resource names and URLs
- Check Azure Portal: Resource Group "proteinlens-prod" exists with all resources

---

## 📋 Step 4: No Credential Extraction Needed

Publish profiles and static tokens are not used. The workflow logs all resource names and URLs. Secrets are stored in Key Vault and permissions are granted automatically.

---

## 🚀 Step 5: App Deploys Are Incremental

Push changes to `infra/**`, `backend/**`, or `frontend/**` and the pipeline deploys only the affected parts. You can also manually run `Deploy` from Actions.

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

- [ ] `AZURE_CLIENT_ID` secret set
- [ ] Required variables set: tenant, subscription, resource group, DNS zone
- [ ] Infrastructure deployment completed successfully
- [ ] Resource Group visible in Azure Portal
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
# Ensure AZURE_CLIENT_ID is present
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
- **Incremental Deploy Spec**: [specs/001-incremental-deploy/spec.md](specs/001-incremental-deploy/spec.md)

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
