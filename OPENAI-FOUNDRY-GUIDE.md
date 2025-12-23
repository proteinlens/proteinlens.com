# OpenAI Foundry On-Demand Automation

## Quick Reference

Provision, rotate, and teardown Azure OpenAI resources on-demand for any environment.

### GitHub Actions Workflow

**Location**: `.github/workflows/foundry-on-demand.yml`

**Trigger**: Manual (`workflow_dispatch`)

### Available Actions

#### 1. Provision (`action=up`)

Creates OpenAI resource, model deployment, Key Vault secret, and configures Function App.

**Inputs**:
- `action`: `up`
- `env`: Target environment (`dev`, `staging`, `pr-###`)
- `region` (optional): `eastus` (default) or `westus`
- `model` (optional): `gpt-5-1` (default)

**Example via GitHub UI**:
1. Go to Actions → "OpenAI Foundry On-Demand"
2. Click "Run workflow"
3. Select:
   - action: `up`
   - env: `dev`
   - region: `eastus` (or leave default)

**Example via CLI**:
```bash
gh workflow run foundry-on-demand.yml \
  -f action=up \
  -f env=dev \
  -f region=eastus
```

**What it does**:
- Deploys `protein-lens-openai-{env}` with model deployment
- Stores API key in Key Vault as `AZURE-OPENAI-API-KEY--{env}`
- Updates Function App setting to Key Vault reference
- Grants Function App Managed Identity Key Vault access
- Completes in ≤10 minutes

---

#### 2. Rotate Key (`action=rotate-key`)

Zero-downtime key rotation using dual-key strategy.

**Inputs**:
- `action`: `rotate-key`
- `env`: Target environment

**Example via GitHub UI**:
1. Go to Actions → "OpenAI Foundry On-Demand"
2. Click "Run workflow"
3. Select:
   - action: `rotate-key`
   - env: `staging`

**Example via CLI**:
```bash
gh workflow run foundry-on-demand.yml \
  -f action=rotate-key \
  -f env=staging
```

**What it does**:
- Detects currently active key slot
- Regenerates inactive key
- Updates Key Vault secret with new key
- Triggers Function App config refresh
- Apps pick up new key within ≤15 minutes (no downtime)

**Production Note**: Requires manual approval for `prod` environment (configured via environment protection rules).

---

#### 3. Teardown (`action=down`)

Safely deletes OpenAI resource and secrets for target environment.

**Inputs**:
- `action`: `down`
- `env`: Target environment

**Example via GitHub UI**:
1. Go to Actions → "OpenAI Foundry On-Demand"
2. Click "Run workflow"
3. Select:
   - action: `down`
   - env: `pr-123`

**Example via CLI**:
```bash
gh workflow run foundry-on-demand.yml \
  -f action=down \
  -f env=pr-123
```

**What it does**:
- Deletes OpenAI account (includes model deployments)
- Deletes Key Vault secret (soft-delete, recoverable for 90 days)
- Removes Function App settings
- Validates deletion scoped to target env only
- Idempotent (safe to re-run)

---

## Local Usage (Scripts)

All workflows call shell scripts that can also be run locally.

### Prerequisites

- Azure CLI installed and logged in (`az login`)
- Subscription and resource group already exist
- Key Vault already deployed for the environment

### Script Reference

#### Provision
```bash
./scripts/foundry-up.sh <env> [region] [model]

# Examples:
./scripts/foundry-up.sh dev
./scripts/foundry-up.sh staging eastus gpt-5-1
./scripts/foundry-up.sh pr-123 westus
```

#### Rotate Key
```bash
./scripts/foundry-rotate-key.sh <env>

# Example:
./scripts/foundry-rotate-key.sh dev
```

#### Teardown
```bash
./scripts/foundry-down.sh <env>

# Example:
./scripts/foundry-down.sh pr-123
```

#### Smoke Test
```bash
./scripts/foundry-smoke-test.sh <env>

# Example:
./scripts/foundry-smoke-test.sh dev
```

---

## Environment Variables

### Required (Set in Function App via Key Vault References)

- `AZURE_OPENAI_API_KEY`: Key Vault reference to OpenAI key
- `AZURE_OPENAI_ENDPOINT`: OpenAI endpoint URL
- `AZURE_OPENAI_DEPLOYMENT`: Model deployment name

**Example Function App Setting**:
```
AZURE_OPENAI_API_KEY=@Microsoft.KeyVault(SecretUri=https://proteinlens-kv-dev.vault.azure.net/secrets/AZURE-OPENAI-API-KEY--dev/)
AZURE_OPENAI_ENDPOINT=https://protein-lens-openai-dev.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5-1
```

### Optional Environment Variables (for scripts)

- `RESOURCE_GROUP`: Override default `proteinlens-{env}`
- `KEYVAULT_NAME`: Override default `proteinlens-kv-{env}`
- `FUNCTION_APP_NAME`: Override default `proteinlens-api-{env}`

---

## Constitution Compliance

This feature implements Constitution v3 principles:

- **IX. On-Demand Lifecycle**: Clean create/delete with no leftovers
- **X. Key Vault Supremacy**: No raw secrets in repo/logs/frontend
- **XI. Zero-Downtime Rotation**: Dual-key strategy
- **XII. IaC Idempotency**: Safe to re-run up/down

---

## Troubleshooting

### Provision fails with quota error

**Solution**: Try alternate region or request quota increase.

```bash
# Retry with westus
./scripts/foundry-up.sh dev westus
```

### Key rotation doesn't reflect immediately

**Expected**: Key Vault reference cache takes up to 15 minutes.

**Workaround**: Force immediate refresh with app restart:
```bash
az functionapp restart \
  --name proteinlens-api-dev \
  --resource-group proteinlens-dev
```

### Secret not found in Key Vault

**Cause**: Secret was deleted or never created.

**Solution**: Re-run provision:
```bash
./scripts/foundry-up.sh dev
```

### Function App returns 401/403 for OpenAI calls

**Causes**:
1. Managed Identity not granted Key Vault access
2. Key Vault reference syntax incorrect
3. Secret value expired or rotated

**Solution**:
```bash
# Check role assignment
az role assignment list \
  --assignee <function-app-principal-id> \
  --scope /subscriptions/.../resourceGroups/.../providers/Microsoft.KeyVault/vaults/...

# Re-grant access
./scripts/foundry-up.sh dev  # Idempotent, will fix permissions
```

---

## Security Notes

- ✅ No raw API keys committed to repository
- ✅ Scripts use `--output none` for sensitive operations
- ✅ GitHub Actions workflow runs secret scanning after each job
- ✅ Key Vault soft-delete protects against accidental permanent deletion
- ✅ Dual-key rotation ensures zero downtime
- ✅ Environment scoping prevents cross-environment impact

---

## References

- Spec: `specs/005-openai-foundry-automation/spec.md`
- Plan: `specs/005-openai-foundry-automation/plan.md`
- Tasks: `specs/005-openai-foundry-automation/tasks.md`
- Quickstart: `specs/005-openai-foundry-automation/quickstart.md`
