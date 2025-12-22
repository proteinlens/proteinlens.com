# GitHub Secrets Configuration

This document describes all GitHub Secrets required for the ProteinLens deployment pipeline.

## Required Secrets

All secrets must be set in the GitHub repository settings (`Settings → Secrets and variables → Actions → Repository secrets`).

### Infrastructure Secrets

#### AZURE_CREDENTIALS

**Purpose**: Authentication for Azure CLI and Azure Functions deployment

**Format**: JSON containing Azure service principal credentials

**How to Obtain**:
```bash
# Create a service principal
az ad sp create-for-rbac --name "proteinlens-gh-actions" \
  --role "Contributor" \
  --scopes "/subscriptions/{subscription-id}" \
  --json-auth

# Output will be in this format:
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**Set in GitHub**:
```bash
gh secret set AZURE_CREDENTIALS --body '$(az ad sp create-for-rbac --name "proteinlens-gh-actions" --role "Contributor" --scopes "/subscriptions/{subscription-id}" --json-auth)'
```

**Rotation**: Quarterly - Use `az ad sp credential reset` to rotate without changing client ID

---

#### AZURE_SUBSCRIPTION_ID

**Purpose**: Azure subscription identifier

**Format**: UUID (e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**How to Obtain**:
```bash
az account show --query id -o tsv
```

**Set in GitHub**:
```bash
gh secret set AZURE_SUBSCRIPTION_ID --body "$(az account show --query id -o tsv)"
```

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

### Database Secrets

#### DATABASE_ADMIN_PASSWORD

**Purpose**: PostgreSQL admin user password

**Requirements**:
- Minimum 12 characters
- Must contain uppercase, lowercase, digits, and special characters
- Cannot contain PostgreSQL reserved words
- Examples of invalid: `P@ssw0rd`, `admin123` (too short or weak)

**Format**: String (URL-safe characters recommended)

**Example**: `P@ssw0rd-Xyz123-Secure!`

**Generate Secure Password**:
```bash
openssl rand -base64 32
# Example output: AbCdEfGhIjKlMnOpQrStUvWxYz123456+/=
```

**Set in GitHub**:
```bash
gh secret set DATABASE_ADMIN_PASSWORD --body "YourSecurePassword123!"
```

**Security Notes**:
- Store in password manager
- Never log or print in CI/CD output
- Rotate quarterly: Update in Key Vault, then in PostgreSQL
- GitHub Actions automatically masks this value in logs

---

### API Keys & Credentials

#### OPENAI_API_KEY

**Purpose**: OpenAI API authentication for AI Foundry integration

**Format**: String starting with `sk-`

**How to Obtain**:
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Login or create account
3. Navigate to **API keys**
4. Click **Create new secret key**
5. Copy the key (only shown once!)

**Set in GitHub**:
```bash
gh secret set OPENAI_API_KEY --body "sk-..."
```

**Security Notes**:
- Grant minimum required permissions (API scope restrictions)
- Set usage limits in OpenAI account
- Monitor usage in [OpenAI Billing](https://platform.openai.com/account/billing)
- Rotate if exposed: Generate new key, update GitHub Secret, revoke old key

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

### Azure Functions & Static Web Apps

#### AZURE_FUNCTIONAPP_PUBLISH_PROFILE

**Purpose**: Deployment credentials for Azure Functions

**Format**: XML file contents (multiline)

**When Available**: After infrastructure deployment completes

**How to Obtain**:
```bash
# After infrastructure deployed, download publish profile
az webapp deployment list-publishing-profiles \
  --resource-group proteinlens-prod \
  --name proteinlens-api-prod \
  --xml > publish-profile.xml

# View the file (contains sensitive credentials)
cat publish-profile.xml
```

**Set in GitHub**:
```bash
gh secret set AZURE_FUNCTIONAPP_PUBLISH_PROFILE --body "$(cat publish-profile.xml)"
```

**Security Notes**:
- Contains username and password for FTP/WebDeploy deployment
- Regenerate quarterly: Run `az webapp deployment slot create` for new profile
- Cannot be downloaded twice (must regenerate)
- GitHub Actions automatically masks all content in logs

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

## Secret Rotation Schedule

| Secret | Rotation Frequency | Owner | Notes |
|--------|-------------------|-------|-------|
| AZURE_CREDENTIALS | Quarterly | DevOps | Use `az ad sp credential reset` |
| DATABASE_ADMIN_PASSWORD | Quarterly | DevOps | Update in both PostgreSQL and Key Vault |
| OPENAI_API_KEY | Quarterly | Engineering | Monitor usage, set spending limits |
| STRIPE_SECRET_KEY | Quarterly | Engineering | Use separate keys per environment |
| STRIPE_WEBHOOK_SECRET | Quarterly | Engineering | Create new webhook, update secret |
| AZURE_FUNCTIONAPP_PUBLISH_PROFILE | Quarterly | DevOps | Regenerate via `az webapp deployment` |
| AZURE_STATIC_WEB_APPS_API_TOKEN | Quarterly | DevOps | Regenerate via `az staticwebapp secrets reset-api-key` |

---

## Verification Checklist

Before running deployment workflows, verify all secrets are set:

```bash
#!/bin/bash
# Check all required secrets are set

REQUIRED_SECRETS=(
  "AZURE_CREDENTIALS"
  "AZURE_SUBSCRIPTION_ID"
  "AZURE_RESOURCE_GROUP"
  "DATABASE_ADMIN_PASSWORD"
  "OPENAI_API_KEY"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
)

echo "Checking GitHub Secrets..."
gh secret list

echo ""
echo "Verifying required secrets (after infrastructure deployed):"
DEPLOYMENT_SECRETS=(
  "AZURE_FUNCTIONAPP_PUBLISH_PROFILE"
  "AZURE_STATIC_WEB_APPS_API_TOKEN"
)

for secret in "${DEPLOYMENT_SECRETS[@]}"; do
  if gh secret list | grep -q "$secret"; then
    echo "✓ $secret"
  else
    echo "✗ $secret (required after infra deployment)"
  fi
done
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
# Verify secret is set
gh secret list

# If missing, set it
gh secret set SECRET_NAME --body "value"
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
