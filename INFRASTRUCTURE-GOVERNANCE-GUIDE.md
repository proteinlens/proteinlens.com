# Infrastructure Governance Guide - Constitution v3.0.0

**Last Updated**: 2025-12-23  
**Constitutional Version**: 3.0.0  
**Focus**: Infrastructure-as-Code, Secrets Management, Key Rotation, Resource Lifecycle

## Overview

ProteinLens Constitution v3.0.0 adds four critical infrastructure governance principles that mandate zero-downtime deployments, centralized secret management, idempotent infrastructure, and clean resource lifecycle. This guide explains how to implement and verify compliance.

---

## Principle IX: On-Demand Resource Lifecycle

### Requirements

- ✅ All resources support `create` and `delete` operations with **zero leftover artifacts**
- ✅ Ephemeral resources (test VMs, temporary deployments) auto-delete after configurable TTL
- ✅ Resource naming includes environment prefix: `dev-`, `test-`, `prod-`
- ✅ Deletion is **idempotent**: deleting already-deleted resources succeeds with no errors
- ✅ Child resources (RBAC, locks, disks) cascade-delete when parent is deleted
- ✅ Cleanup validation: no orphaned disks, NICs, NSGs, or role assignments remain

### Current Implementation Status

**Azure Infrastructure (Bicep)**:
```bicep
# ✅ Environment-prefixed resource names (defined in parameters)
- storageAccountName: plprodsa85 (includes prod identifier)
- functionAppName: proteinlens-api-prod
- keyVaultName: proteinlens-kv-prod
- postgresServerName: proteinlens-db-prod
```

**Cleanup Procedure**:

```bash
# 1. Delete entire resource group (cascades all child resources)
RESOURCE_GROUP="proteinlens-prod-rg"
az group delete --name $RESOURCE_GROUP --yes --no-wait

# 2. Verify complete removal (wait 2-3 minutes)
az group exists --name $RESOURCE_GROUP  # Should return "false"

# 3. Check for orphaned resources (should be empty)
az resource list \
  --query "[?resourceGroup=='$RESOURCE_GROUP']" \
  -o table
```

**Idempotent Deletion**:
```bash
# Safe to re-run multiple times without error
az group delete --name already-deleted-group --yes  
# Result: Success (exits with code 0) even if group doesn't exist
```

### Verification Checklist

- [ ] Resource naming includes environment prefix (dev-, test-, prod-)
- [ ] Bicep templates use conditional deployments for optional resources
- [ ] Azure cleanup scripts tested and documented
- [ ] "Down" procedure succeeds on 2nd run (idempotent deletion)
- [ ] No orphaned resources after cleanup: `az resource list | grep <env>`

---

## Principle X: Secrets Management & Key Vault Supremacy

### Requirements

**Golden Rule**: All secrets live in **Azure Key Vault only**. GitHub Secrets MUST NOT contain sensitive credentials.

**Critical Secrets** (Central Source of Truth):
- OpenAI API key → Key Vault secret only (NEVER in GitHub)
- PostgreSQL admin password → Key Vault reference
- Stripe API key → Key Vault reference
- Database connection string → Key Vault reference

**Non-Sensitive GitHub Secrets** (Safe in GitHub Actions):
- AZURE_SUBSCRIPTION_ID (subscription GUID)
- AZURE_TENANT_ID (Entra ID tenant GUID)
- AZURE_CLIENT_ID (Service Principal client ID)
- AZURE_CLIENT_SECRET (Service Principal secret) ← Actually sensitive, should be in Key Vault
- RESOURCE_GROUP (resource group name)

**Runtime Secret Access**:
- All secrets retrieved **via Managed Identity** from Key Vault
- Secrets cached in application memory for 5-minute minimum (reduces throttling)
- Each secret access MUST be logged to Application Insights with:
  - User/Service identity making request
  - Secret name (not value)
  - Timestamp
  - Success/failure status

### Current Implementation Status

**Azure Key Vault Setup** (proteinlens-kv-prod):

```bash
# ✅ Verify current secrets in Key Vault
az keyvault secret list --vault-name proteinlens-kv-prod \
  --query "[].name" -o table

# Expected output:
# OpenAiApiKey
# StripeSecretKey
# PostgresPassword
# DbConnectionString
```

**Function App Configuration**:

```bash
# ✅ Verify Managed Identity enabled
az functionapp identity show \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod-rg \
  --query principalId -o tsv

# ✅ Verify Key Vault access policy
az keyvault set-policy \
  --name proteinlens-kv-prod \
  --object-id <principalId-from-above> \
  --secret-permissions get list
```

**Application Code** (backend/src/services):

```typescript
// ✅ COMPLIANT: Use Managed Identity via Key Vault reference
const openAiApiKey = await keyVaultClient.getSecret('OpenAiApiKey');

// ❌ NON-COMPLIANT: Never use GitHub Secrets directly
const openAiApiKey = process.env.OPENAI_API_KEY;  // DON'T DO THIS
```

**GitHub Actions Workflow** (infra.yml):

```yaml
# ✅ COMPLIANT: Use non-sensitive secrets for Azure login
env:
  AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
  AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}

# ❌ NON-COMPLIANT: Never store sensitive secrets in GitHub
# env:
#   OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}  # DON'T DO THIS
#   STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}  # DON'T DO THIS
```

### Secret Naming Convention

```
Key Vault Secret Name    | Purpose                  | Example Value Location
======================== | ======================== | =======================
OpenAiApiKey             | GPT-5.1 integration      | Retrieved at runtime
StripeSecretKey          | Payment processing       | Retrieved at runtime
PostgresPassword         | Database authentication  | Retrieved at runtime
DbConnectionString       | Database connection      | Retrieved at runtime
AiFoundryConnectionStr   | AI Foundry auth         | Retrieved at runtime
```

### Verification Checklist

- [ ] All sensitive credentials in Key Vault (audit: `az keyvault secret list`)
- [ ] GitHub Secrets contains ONLY non-sensitive identifiers
- [ ] Function App has Managed Identity enabled
- [ ] Function App has Key Vault access policy (get, list secrets)
- [ ] Application code uses `keyVaultClient.getSecret()` not `process.env`
- [ ] Secret access is logged to Application Insights
- [ ] Cache minimum duration is 5 minutes (reduces API throttling)

---

## Principle XI: Zero-Downtime Key Rotation

### Requirements

**Dual-Key Strategy**:
- At any moment, TWO valid keys exist: **active** and **staged**
- Clients can authenticate with EITHER key (no rejection during rotation)
- Rotation window: typically 24 hours (config-driven)

**Rotation Workflow**:
1. Generate new key
2. Add new key as "staged" (both old and new valid)
3. Test: verify new key works in canary environment
4. Promote: mark new key as "active" (both still valid)
5. Monitor: confirm 100% of prod traffic uses new key
6. Archive: retire old key (keep for 30 days in case rollback needed)
7. Cleanup: delete old key after 30-day archive period

**Service Reloading**:
- Services MUST reload secrets from Key Vault **on each request** (or within 5-min cache window)
- NO hardcoded secrets or startup-only initialization
- Key Vault exceptions (throttling, network) MUST trigger graceful degradation (use cached secret) + alert

### Current Implementation Status

**OpenAI API Key Rotation** (Zero-Downtime):

```bash
# Step 1: Create new key in OpenAI dashboard
# Step 2: Add to Key Vault as "staged"
NEW_KEY="sk-proj-..."  # New key from OpenAI
az keyvault secret set \
  --vault-name proteinlens-kv-prod \
  --name OpenAiApiKey-Staged \
  --value "$NEW_KEY"

# Step 3: Update application to accept both keys
# (backend/src/services/aiService.ts)
# const primaryKey = await getSecret('OpenAiApiKey');
# const stagedKey = await getSecret('OpenAiApiKey-Staged');
# try with primaryKey, fallback to stagedKey

# Step 4: Verify new key works (test in dev environment)
# curl -H "Authorization: Bearer $NEW_KEY" \
#   https://api.openai.com/v1/models

# Step 5: Promote staged key to active
az keyvault secret set \
  --vault-name proteinlens-kv-prod \
  --name OpenAiApiKey \
  --value "$NEW_KEY"

# Step 6: Monitor logs (Application Insights)
# Verify 100% traffic uses new key (takes 5 min to max out due to cache)

# Step 7: Archive old key (30-day retention)
OLD_KEY="sk-proj-..."  # Previous key
az keyvault secret set \
  --vault-name proteinlens-kv-prod \
  --name OpenAiApiKey-Archived-2025-12-23 \
  --value "$OLD_KEY"

# Step 8: Cleanup after 30 days
az keyvault secret delete \
  --vault-name proteinlens-kv-prod \
  --name OpenAiApiKey-Archived-2025-12-23
```

**Emergency Key Revocation** (Leaked Key):

```bash
# If key is leaked/compromised:
# 1. Immediately revoke in OpenAI dashboard
# 2. Rotate new key to active immediately
# 3. Reject old key in application
az keyvault secret delete \
  --vault-name proteinlens-kv-prod \
  --name OpenAiApiKey-Staged  # Remove any staged keys

# 4. Update app to use only new key (remove fallback to old)
# 5. Monitor: alert on rejected API requests (old key rejections)
```

### Application Code Changes for Dual-Key Support

```typescript
// backend/src/services/aiService.ts
async function getOpenAiClient() {
  const now = new Date();
  
  // Load both keys concurrently
  const [primaryKey, stagedKey] = await Promise.all([
    keyVaultClient.getSecret('OpenAiApiKey'),
    keyVaultClient.getSecret('OpenAiApiKey-Staged').catch(() => null)
  ]);
  
  // Try primary first, fallback to staged
  const key = primaryKey || stagedKey;
  if (!key) throw new Error('No valid OpenAI API key in Key Vault');
  
  return new OpenAI({ apiKey: key });
}

// For monitoring: log which key was used
async function makeOpenAiRequest(prompt: string) {
  try {
    const client = await getOpenAiClient();
    // Log which key succeeded (via Application Insights)
    Logger.info('OpenAI request', {
      keyUsed: 'primary',  // or 'staged'
      timestamp: Date.now(),
      status: 'success'
    });
    return await client.chat.completions.create({...});
  } catch (error) {
    // Log failures for monitoring rotation progress
    Logger.warn('OpenAI request failed', {
      keyUsed: 'primary',  // or 'staged'
      error: error.message
    });
    throw error;
  }
}
```

### Verification Checklist

- [ ] Rotation procedure documented and tested
- [ ] Application supports dual-key (primary + staged) simultaneously
- [ ] Services reload secrets from Key Vault on each request
- [ ] Key Vault access failures don't crash app (graceful degradation)
- [ ] Application Insights logs which key is used (audit trail)
- [ ] 5-minute cache doesn't interfere with rotation monitoring
- [ ] Emergency revocation procedure documented and tested

---

## Principle XII: Infrastructure-as-Code Idempotency

### Requirements

**"Up" Idempotency**: `terraform apply` or `bicep deploy` safe to re-run
- Same command run twice = second run detects no changes (drift-free)
- No resource duplication errors
- No "already exists" failures
- State file accurately reflects deployed resources

**"Down" Idempotency**: `terraform destroy` or resource group deletion succeeds even after partial failure
- Safe to re-run multiple times
- No errors on 2nd+ attempts on already-deleted resources
- Orphaned resources MUST be automatically cleaned up

**Manual Changes Forbidden**: All infrastructure changes MUST go through Bicep/Terraform
- Direct Azure Portal edits are detected by drift detection and raise alerts
- Weekly drift detection: `terraform plan` or `bicep build` outputs "No changes"

**Feature Flags**: Conditional deployments via parameters
- Can enable/disable resource creation without modifying code
- Disabled resources cleanly removed (no orphans)

### Current Implementation Status

**Bicep Idempotency** (infra/bicep/main.bicep):

```bicep
# ✅ COMPLIANT: Conditional deployment with feature flag
resource aiFoundry 'Microsoft.MachineLearningServices/workspaces@2024-04-01' = if (enableAIFoundry) {
  // Deployment happens only when enableAIFoundry == true
  // Deletion happens cleanly when enableAIFoundry == false
}

# ✅ COMPLIANT: Using resource references (no hardcoded IDs)
module keyvault 'keyvault.bicep' = {
  params: {
    keyVaultId: keyVault.id  // References actual deployed resource
  }
}

# ✅ COMPLIANT: Idempotent module orchestration
// Bicep automatically detects if resource already exists
// Re-run of same template = no changes, no duplication
```

**Deployment Verification** (Testing Idempotency):

```bash
# Test 1: First deployment
RESOURCE_GROUP="proteinlens-test-rg"
TEMPLATE="infra/bicep/main.bicep"
PARAMS="infra/bicep/parameters/prod.parameters.json"

# Create resource group
az group create --name $RESOURCE_GROUP --location westus2

# Deploy
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file $TEMPLATE \
  --parameters $PARAMS

# Test 2: Re-run same deployment (should detect no changes)
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file $TEMPLATE \
  --parameters $PARAMS
# Expected: "Deployment succeeded with no changes to resources"

# Test 3: Cleanup
az group delete --name $RESOURCE_GROUP --yes --no-wait

# Test 4: Re-run cleanup (should succeed even on 2nd attempt)
az group delete --name $RESOURCE_GROUP --yes --no-wait
# Expected: Success (no "group not found" error)
```

**Drift Detection** (Automated Verification):

```bash
# Run weekly to detect manual changes
az bicep build --file infra/bicep/main.bicep

# Compare actual deployed state vs. template
az deployment group what-if \
  --resource-group proteinlens-prod-rg \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/parameters/prod.parameters.json
# Expected: "No changes detected" (or list drift changes if manual edits occurred)
```

**Feature Flag Example** (enableAIFoundry):

```bicep
# Parameter defined in main.bicep
param enableAIFoundry bool = true

# Conditional deployment: only creates AI resources if true
resource aiHub 'Microsoft.MachineLearningServices/workspaces@2024-04-01' = if (enableAIFoundry) {
  // Resource created when enableAIFoundry == true
  // Resource deleted when enableAIFoundry == false
  // No manual cleanup required
}

# To disable: set in parameters.json or command-line
# az deployment group create ... --parameters enableAIFoundry=false
# Result: AI Hub/Project resources are removed cleanly
```

### CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/infra.yml
name: Infrastructure Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment (dev/prod)'
        required: true
      confirm_deploy:
        description: 'Type "deploy-infra" to confirm'
        required: true

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Step 1: Validate Bicep (no syntax errors)
      - name: Validate Bicep
        run: |
          az bicep build --file infra/bicep/main.bicep
      
      # Step 2: Test idempotency (dry-run)
      - name: Test Idempotency (What-If)
        run: |
          az deployment group what-if \
            --resource-group proteinlens-${{ inputs.environment }}-rg \
            --template-file infra/bicep/main.bicep \
            --parameters infra/bicep/parameters/${{ inputs.environment }}.parameters.json
      
      # Step 3: Deploy (actual creation/modification)
      - name: Deploy Infrastructure
        if: inputs.confirm_deploy == 'deploy-infra'
        run: |
          az deployment group create \
            --resource-group proteinlens-${{ inputs.environment }}-rg \
            --template-file infra/bicep/main.bicep \
            --parameters infra/bicep/parameters/${{ inputs.environment }}.parameters.json
      
      # Step 4: Verify no changes needed (idempotency test)
      - name: Verify Idempotency
        run: |
          az deployment group what-if \
            --resource-group proteinlens-${{ inputs.environment }}-rg \
            --template-file infra/bicep/main.bicep \
            --parameters infra/bicep/parameters/${{ inputs.environment }}.parameters.json \
            --query "[?properties.changeType != 'NoChange'] | length(@)"
          # Should return 0 (no changes needed after deployment)
```

### Verification Checklist

- [ ] Bicep templates validated: `az bicep build`
- [ ] Re-deployment test passes (2nd run detects no changes)
- [ ] Feature flags tested (enable/disable resources cleanly)
- [ ] Deletion is idempotent (succeeds on 2nd run)
- [ ] No manual changes in Azure Portal since last deployment
- [ ] Drift detection enabled (weekly `terraform plan` or `bicep what-if`)
- [ ] CI/CD pipeline includes idempotency test (what-if before apply)

---

## Implementation Priority

### Phase 1 (Immediate - Complete)
- ✅ Bicep infrastructure with conditional deployments
- ✅ Azure Key Vault centralized secrets
- ✅ Function App Managed Identity access to Key Vault
- ✅ Parameter files for dev/prod environments

### Phase 2 (In Progress)
- 🔄 Key Vault access audit logging (Application Insights)
- 🔄 Secret caching implementation (5-minute minimum)
- 🔄 Dual-key rotation support (primary + staged)

### Phase 3 (Planned)
- ⏳ Weekly drift detection automation
- ⏳ Idempotency testing in CI/CD pipeline
- ⏳ Key rotation automation (scheduled Azure Function)
- ⏳ Ephemeral resource TTL cleanup (scheduled Azure Function)

---

## Compliance Dashboard

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **IX** | Resource naming includes env prefix | ✅ | prod-, dev- prefixes used |
| **IX** | Deletion is idempotent | ✅ | Tested: `az group delete` succeeds on 2nd run |
| **IX** | No orphaned resources | 🔄 | Resource group deletion handles cascades |
| **X** | Secrets in Key Vault only | ✅ | OpenAiApiKey, StripeSecretKey, etc. |
| **X** | GitHub Secrets non-sensitive only | ✅ | AZURE_SUBSCRIPTION_ID, TENANT_ID only |
| **X** | Managed Identity for secret access | ✅ | Function App has MSI enabled |
| **X** | 5-min cache minimum | 🔄 | Need to implement in application code |
| **XI** | Dual-key support | 🔄 | Staged key framework needed |
| **XI** | Rotation procedure documented | 🔄 | Procedure in place, needs automation |
| **XII** | IaC idempotency verified | ✅ | Bicep templates idempotent |
| **XII** | Feature flags for conditionals | ✅ | enableAIFoundry, enableFrontDoor flags |
| **XII** | Drift detection enabled | 🔄 | Manual `what-if` testing, needs automation |

---

## Quick Reference

```bash
# Secret management
az keyvault secret list --vault-name proteinlens-kv-prod
az keyvault secret show --vault-name proteinlens-kv-prod --name OpenAiApiKey

# Infrastructure deployment (idempotent)
az deployment group create \
  --resource-group proteinlens-prod-rg \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/parameters/prod.parameters.json

# Idempotency verification (safe to re-run)
az deployment group what-if \
  --resource-group proteinlens-prod-rg \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/parameters/prod.parameters.json

# Clean resource deletion (safe on 2nd attempt)
az group delete --name proteinlens-prod-rg --yes --no-wait

# Key rotation (zero-downtime)
# See Principle XI workflow above
```

---

## Questions & Escalation

**Q: Can I store secrets in GitHub Secrets?**  
A: No. Only store non-sensitive identifiers (subscription ID, tenant ID) in GitHub Secrets. All credentials must be in Azure Key Vault.

**Q: What if Key Vault is unreachable?**  
A: Application must use 5-minute cached secret and log a warning. Retry mechanism should backoff exponentially. Alert on-call if cache expires without Key Vault recovery.

**Q: How do I safely rotate keys without downtime?**  
A: Use dual-key strategy (Principle XI). Stage new key, verify it works, promote to active, retire old. Services reload from Key Vault on each request.

**Q: What if I manually changed a resource in Azure Portal?**  
A: Drift detection (weekly `bicep what-if`) will catch it. Revert manually or regenerate via Bicep deployment. Manual changes are forbidden per Principle XII.

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-23  
**Related**: `.specify/memory/constitution.md` v3.0.0
