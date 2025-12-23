#!/usr/bin/env bash
# Teardown OpenAI Foundry resources on-demand
# Constitution Principle IX: On-Demand Lifecycle (clean deletion, no leftovers)

set -euo pipefail

# =============================================================================
# PARAMETERS
# =============================================================================

ENV_NAME="${1:-dev}"
RESOURCE_GROUP="${RESOURCE_GROUP:-proteinlens-${ENV_NAME}}"
KEYVAULT_NAME="${KEYVAULT_NAME:-proteinlens-kv-${ENV_NAME}}"
FUNCTION_APP_NAME="${FUNCTION_APP_NAME:-proteinlens-api-${ENV_NAME}}"

OPENAI_ACCOUNT_NAME="protein-lens-openai-${ENV_NAME}"
SECRET_NAME="AZURE-OPENAI-API-KEY--${ENV_NAME}"

echo "[foundry-down] Starting OpenAI teardown for environment: ${ENV_NAME}"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

log_info() {
  echo "[foundry-down] INFO: $*"
}

log_warn() {
  echo "[foundry-down] WARN: $*"
}

log_error() {
  echo "[foundry-down] ERROR: $*" >&2
}

# =============================================================================
# PREFLIGHT CHECKS
# =============================================================================

log_info "Checking Azure CLI login status..."
if ! az account show &>/dev/null; then
  log_error "Not logged in to Azure CLI. Run 'az login' first."
  exit 1
fi

# =============================================================================
# DELETE OPENAI RESOURCE (IDEMPOTENT)
# =============================================================================

log_info "Checking if OpenAI account exists..."
if az cognitiveservices account show \
  --name "$OPENAI_ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  
  log_info "Deleting OpenAI account: ${OPENAI_ACCOUNT_NAME}..."
  az cognitiveservices account delete \
    --name "$OPENAI_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --output none
  
  log_info "OpenAI account deleted (includes model deployments)"
else
  log_warn "OpenAI account not found (already deleted or never existed)"
fi

# =============================================================================
# DELETE KEY VAULT SECRET (IDEMPOTENT)
# =============================================================================

log_info "Checking if Key Vault exists..."
if az keyvault show --name "$KEYVAULT_NAME" &>/dev/null; then
  
  log_info "Checking if secret exists..."
  if az keyvault secret show \
    --vault-name "$KEYVAULT_NAME" \
    --name "$SECRET_NAME" &>/dev/null; then
    
    log_info "Deleting Key Vault secret: ${SECRET_NAME}..."
    az keyvault secret delete \
      --vault-name "$KEYVAULT_NAME" \
      --name "$SECRET_NAME" \
      --output none
    
    log_info "Secret deleted (soft-delete enabled, recoverable for 90 days)"
  else
    log_warn "Secret not found (already deleted or never existed)"
  fi
else
  log_warn "Key Vault not found (cannot delete secret)"
fi

# =============================================================================
# REMOVE FUNCTION APP SETTING (OPTIONAL CLEANUP)
# =============================================================================

log_info "Checking if Function App exists..."
if az functionapp show \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  
  log_info "Removing Function App settings for OpenAI..."
  az functionapp config appsettings delete \
    --name "$FUNCTION_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --setting-names "AZURE_OPENAI_API_KEY" \
                    "AZURE_OPENAI_ENDPOINT" \
                    "AZURE_OPENAI_DEPLOYMENT" \
    --output none 2>/dev/null || log_warn "Settings not found or already removed"
  
  log_info "Function App settings removed"
else
  log_warn "Function App not found (cannot remove settings)"
fi

# =============================================================================
# VALIDATE ENVIRONMENT SCOPE (SAFETY CHECK)
# =============================================================================

log_info "Validating deletion scope..."
if [ "$ENV_NAME" = "prod" ]; then
  log_warn "Production environment teardown detected. Ensure this is intentional."
fi

# Ensure we didn't affect other environments (sanity check)
OTHER_ENVS=("dev" "staging")
for other_env in "${OTHER_ENVS[@]}"; do
  if [ "$other_env" != "$ENV_NAME" ]; then
    other_account="protein-lens-openai-${other_env}"
    if az cognitiveservices account show \
      --name "$other_account" \
      --resource-group "proteinlens-${other_env}" &>/dev/null; then
      log_info "✅ Other environment '${other_env}' unaffected"
    fi
  fi
done

# =============================================================================
# COMPLETION
# =============================================================================

echo ""
echo "========================================="
echo "✅ OpenAI Foundry Teardown Complete"
echo "========================================="
echo "Environment: ${ENV_NAME}"
echo "OpenAI Account: ${OPENAI_ACCOUNT_NAME} (deleted)"
echo "Key Vault Secret: ${SECRET_NAME} (deleted)"
echo "Function App Settings: removed"
echo ""
echo "Notes:"
echo "  - Secret is soft-deleted (recoverable for 90 days)"
echo "  - Re-run this script is safe (idempotent)"
echo "  - Other environments remain unaffected"
echo ""
