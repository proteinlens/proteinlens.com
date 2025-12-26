# GitHub Secrets Configuration

This document describes the minimal GitHub repository secret and variables required for the unified ProteinLens deployment pipeline using Azure OIDC.

## Required Secrets

All secrets must be set in the GitHub repository settings (`Settings → Secrets and variables → Actions → Repository secrets`).

### Repository Secret

#### AZURE_CLIENT_ID

**Purpose**: Client ID of Azure AD application configured with a GitHub OIDC federated credential. Used by `azure/login@v2` to obtain tokens without any client secret.

**How to Obtain**:
```bash
# Create or reuse an Azure AD app and capture its appId
APP_ID=$(az ad app create --display-name "proteinlens-github-oidc" --query appId -o tsv)

# Add federated credential for this GitHub repo (replace ORG/REPO)
az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters '{
    "name": "gh-actions",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:ORG/REPO:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

**Set in GitHub**:
```bash
gh secret set AZURE_CLIENT_ID --body "$APP_ID"
```

**Rotation**: Not applicable (no client secret). If you need to change the app, update the federated credential and the secret value.

---

### Repository Variables

Set these as repository-level variables (not secrets):

- `AZURE_TENANT_ID`: `az account show --query tenantId -o tsv`
- `AZURE_SUBSCRIPTION_ID`: `az account show --query id -o tsv`
- `AZURE_RESOURCE_GROUP`: e.g., `proteinlens-prod`
- `DNS_ZONE_NAME`: e.g., `proteinlens.com`

---

#### AZURE_RESOURCE_GROUP

**Purpose**: Resource group for all Azure resources

**Format**: String (lowercase, alphanumeric and hyphens)

**Example**: `proteinlens-prod`, `proteinlens-staging`, `proteinlens-dev`

**Set in GitHub**:
```bash
gh secret set AZURE_RESOURCE_GROUP --body "proteinlens-prod"
```

---

### Optional Infra Parameter

#### POSTGRES_ADMIN_PASSWORD

**Purpose**: If your Bicep requires an explicit admin password parameter, set this as a GitHub Secret used only during infra deployment. Application access uses Key Vault; no app code reads this value.

**Set in GitHub**:
```bash
gh secret set POSTGRES_ADMIN_PASSWORD --body "YourSecurePassword123!"
```

---

### Application Secrets Live in Key Vault

OpenAI, Stripe, storage connection strings, and the database URL are created and stored in Azure Key Vault by the workflow. The Function App reads them via Key Vault references. Do not store these in GitHub; manage them in Key Vault.

---

#### STRIPE_SECRET_KEY

**Purpose**: Stripe API authentication for payment processing

**Format**: String starting with `sk_live_` (production) or `sk_test_` (testing)

**How to Obtain**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Login or create account
3. Navigate to **Developers → API Keys**
4. Copy **Secret Key** (starts with `sk_live_`)

**Set in GitHub**:
```bash
gh secret set STRIPE_SECRET_KEY --body "sk_live_..."
```

**Security Notes**:
- Use different keys for dev/staging/prod
- Grant API scopes: `write` permissions only for needed resources
- Set webhook signing secret separately (see below)
- Rotate quarterly: Generate new key, update GitHub Secret, deactivate old key
- Monitor suspicious activity in Stripe Dashboard

---

#### STRIPE_WEBHOOK_SECRET

**Purpose**: Verify Stripe webhook authenticity

**Format**: String starting with `whsec_`

**How to Obtain**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → Webhooks**
3. Click on webhook endpoint (e.g., `https://your-function.azurewebsites.net/api/webhook`)
4. Scroll to **Signing secret**
5. Click **Reveal** and copy the secret

**Set in GitHub**:
```bash
gh secret set STRIPE_WEBHOOK_SECRET --body "whsec_..."
```

**Security Notes**:
- Different from Stripe API key
- Used to verify webhook requests in `webhook.ts` function
- Rotate by creating new webhook and updating secret
- GitHub Actions automatically masks this value in logs

---

#### HCAPTCHA_SECRET

**Purpose**: Server-side verification of hCaptcha responses for bot protection during signup

**Format**: String (40-character hex string starting with `0x` for production, or test key)

**How to Obtain**:
1. Go to [hCaptcha Dashboard](https://dashboard.hcaptcha.com)
2. Login or create account
3. Add your site (e.g., `proteinlens.com`)
4. Copy **Secret Key** from site settings

**Set in GitHub**:
```bash
gh secret set HCAPTCHA_SECRET --body "0x..."
```

**Test Keys** (for development):
- Site Key: `10000000-ffff-ffff-ffff-000000000001`
- Secret Key: `0x0000000000000000000000000000000000000000`

**Security Notes**:
- Backend only - never expose in frontend code
- Use test keys for local development
- Rotate if compromised
- Stored in Azure Key Vault, referenced by Function App

---

#### VITE_HCAPTCHA_SITE_KEY

**Purpose**: Client-side hCaptcha widget configuration for signup form

**Format**: String (UUID format, e.g., `10000000-ffff-ffff-ffff-000000000001`)

**How to Obtain**:
1. Go to [hCaptcha Dashboard](https://dashboard.hcaptcha.com)
2. Copy **Site Key** from your site settings

**Set in GitHub**:
```bash
gh secret set VITE_HCAPTCHA_SITE_KEY --body "your-site-key-uuid"
```

**Security Notes**:
- Public key - safe to include in frontend builds
- Injected into frontend build via `.env.production`
- Different from HCAPTCHA_SECRET (server-side only)

---

### Azure Functions & Static Web Apps

#### Removed: Publish Profiles and SWA Tokens

Publish profiles and static deployment tokens are not used. The workflow authenticates via OIDC and fetches any runtime tokens securely without storing them in repository secrets.

---

#### AZURE_STATIC_WEB_APPS_API_TOKEN

**Purpose**: Deployment token for Azure Static Web Apps

**Format**: String (long UUID-like token)

**When Available**: After infrastructure deployment completes

**How to Obtain**:
```bash
# After infrastructure deployed, get the deployment token
az staticwebapp secrets list \
  --resource-group proteinlens-prod \
  --name proteinlens-web-prod \
  --query properties.apiKey -o tsv
```

**Set in GitHub**:
```bash
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "$(az staticwebapp secrets list \
  --resource-group proteinlens-prod \
  --name proteinlens-web-prod \
  --query properties.apiKey -o tsv)"
```

**Security Notes**:
- Limited to Static Web Apps deployment only
- Regenerate quarterly: Run `az staticwebapp secrets reset-api-key`
- GitHub Actions automatically masks this value in logs

---

## Secret & Variable Review

| Item | Type | Rotation | Notes |
|------|------|---------|-------|
| AZURE_CLIENT_ID | Secret | N/A | OIDC auth; no client secret required |
| AZURE_TENANT_ID | Variable | N/A | Tenant context |
| AZURE_SUBSCRIPTION_ID | Variable | N/A | Subscription context |
| AZURE_RESOURCE_GROUP | Variable | N/A | Target resource group |
| DNS_ZONE_NAME | Variable | N/A | Used for DNS validation |
| POSTGRES_ADMIN_PASSWORD | Secret | Quarterly | Only if Bicep parameter requires it |

---

## Verification Checklist

Before running deployment workflows, verify the required secret and variables are set:

```bash
#!/bin/bash
# Check all required secrets are set

REQUIRED_SECRET="AZURE_CLIENT_ID"

echo "Checking GitHub Secret $REQUIRED_SECRET and variables..."
gh secret list | grep -q "$REQUIRED_SECRET" && echo "✓ $REQUIRED_SECRET" || echo "✗ $REQUIRED_SECRET missing"
echo "Variables:"
gh variable list | grep -E "AZURE_TENANT_ID|AZURE_SUBSCRIPTION_ID|AZURE_RESOURCE_GROUP|DNS_ZONE_NAME" || echo "Configure required variables"
```

---

## Security Best Practices

### 1. Never Log Secrets

- GitHub Actions automatically masks known secrets in workflow logs
- Do NOT echo or print secrets in workflow files
- Do NOT commit secrets to repository
- Use `.gitignore` to exclude files with secrets:
  ```
  *.env
  *.env.local
  publish-profile.xml
  secrets.json
  ```

### 2. Access Control

- Restrict secret access to deployment workflows
- Use **GitHub Environments** to segregate secrets by deployment target:
  ```yaml
  - name: Deploy
    environment: production
    run: ./deploy.sh
  ```
- Require approval for production deployments

### 3. Audit & Monitoring

- Review secret access logs: `Settings → Audit log`
- Set up alerts for secret access: GitHub Enterprise Only
- Rotate secrets immediately if exposed
- Monitor Azure Activity Log for deployments

### 4. Key Rotation Process

**General process for all secrets**:
1. Generate new secret/credentials
2. Update GitHub Secret: `gh secret set SECRET_NAME --body "new-value"`
3. Deploy to affected resources
4. Verify deployment succeeds with new credentials
5. Revoke/disable old credentials
6. Document rotation date

**Example: Rotate OPENAI_API_KEY**:
```bash
# 1. Generate new key in OpenAI Dashboard
# 2. Update GitHub
gh secret set OPENAI_API_KEY --body "sk-..."

# 3. Deploy (triggers deploy-api.yml)
git commit -m "chore: rotate OpenAI API key"
git push origin main

# 4. Verify Function App receives new key via Application Insights
az monitor app-insights metrics show \
  --resource-group proteinlens-prod \
  --resource proteinlens-api-prod \
  --metric "Requests/Sec"

# 5. Disable old key in OpenAI Dashboard
```

---

## Troubleshooting

### Secret Not Found Error

**Problem**: Workflow fails with "Secret not found"

**Solution**:
```bash
gh secret list | grep AZURE_CLIENT_ID || gh secret set AZURE_CLIENT_ID --body "APP_ID"
```

### Secret Masking Not Working

**Problem**: Secret appears in workflow logs

**Solution**:
- GitHub only masks secrets in logs if they're exactly configured
- Ensure secret value matches what's stored
- Check for URL encoding issues: `echo -n "value" | jq -sRr @uri`

### Deployment Fails with Authentication Error

**Problem**: "Authentication failed" when deploying to Azure

**Solution**:
1. Verify AZURE_CREDENTIALS is valid JSON:
   ```bash
   echo "${{ secrets.AZURE_CREDENTIALS }}" | jq . 
   ```
2. Check service principal has required permissions:
   ```bash
   az role assignment list --assignee <clientId>
   ```
3. Regenerate credentials if necessary:
   ```bash
   az ad sp credential reset --name "proteinlens-gh-actions"
   ```

---

## Next Steps

1. ✅ Set all required secrets in GitHub
2. ✅ Verify secrets with checklist above
3. ⏳ Run infrastructure workflow to create Azure resources
4. ⏳ Extract deployment secrets from Azure
5. ⏳ Run backend and frontend workflows
