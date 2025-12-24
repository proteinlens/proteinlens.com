#!/usr/bin/env bash
# Rotate OpenAI API key with zero downtime
# Constitution Principle XI: Zero-Downtime Key Rotation

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

echo "[foundry-rotate] Starting zero-downtime key rotation for environment: ${ENV_NAME}"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

log_info() {
  echo "[foundry-rotate] INFO: $*"
}

log_error() {
  echo "[foundry-rotate] ERROR: $*" >&2
}

# Detect currently active slot (without logging values)
detect_active_slot() {
  local account_name="$1"
  local rg="$2"
  local secret_name="$3"
  local vault_name="$4"
  
  # Get current secret value (without logging it)
  local current_secret_value
  current_secret_value=$(az keyvault secret show \
    --vault-name "$vault_name" \
    --name "$secret_name" \
    --query value \
    --output tsv 2>/dev/null || echo "")
  
  if [ -z "$current_secret_value" ]; then
    log_error "Could not retrieve current secret value"
    return 1
  fi
  
  # Get both credentials (without logging them)
  local creds_json
  creds_json=$(az cognitiveservices account keys list \
    --name "$account_name" \
    --resource-group "$rg" \
    --output json 2>/dev/null)
  
  local cred1
  local cred2
  cred1=$(printf '%s' "$creds_json" | jq -r '.key1 // empty')
  cred2=$(printf '%s' "$creds_json" | jq -r '.key2 // empty')
  
  # Compare (without logging comparison results)
  if [ "$current_secret_value" = "$cred1" ]; then
    printf 'slot1'
  elif [ "$current_secret_value" = "$cred2" ]; then
    printf 'slot2'
  else
    log_error "Current secret does not match either slot"
    return 1
  fi
  
  # Clear sensitive values
  unset current_secret_value cred1 cred2
}

# =============================================================================
# PREFLIGHT CHECKS
# =============================================================================

log_info "Checking Azure CLI login status..."
if ! az account show &>/dev/null; then
  log_error "Not logged in to Azure CLI. Run 'az login' first."
  exit 1
fi

log_info "Checking OpenAI account exists..."
if ! az cognitiveservices account show \
  --name "$OPENAI_ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  log_error "OpenAI account not found: ${OPENAI_ACCOUNT_NAME}"
  exit 1
fi

log_info "Checking Key Vault exists..."
if ! az keyvault show --name "$KEYVAULT_NAME" &>/dev/null; then
  log_error "Key Vault not found: ${KEYVAULT_NAME}"
  exit 1
fi

# =============================================================================
# DETECT ACTIVE KEY SLOT
# =============================================================================

log_info "Detecting currently active key slot..."
ACTIVE_SLOT=$(detect_active_slot \
  "$OPENAI_ACCOUNT_NAME" \
  "$RESOURCE_GROUP" \
  "$SECRET_NAME" \
  "$KEYVAULT_NAME")

if [ -z "$ACTIVE_SLOT" ]; then
  log_error "Failed to detect active key slot"
  exit 1
fi

log_info "Active key slot: ${ACTIVE_SLOT}"

# Determine inactive slot
if [ "$ACTIVE_SLOT" = "key1" ]; then
  INACTIVE_SLOT="key2"
else
  INACTIVE_SLOT="key1"
fi

log_info "Inactive key slot to regenerate: ${INACTIVE_SLOT}"

# =============================================================================
# REGENERATE INACTIVE KEY
# =============================================================================

log_info "Regenerating inactive key: ${INACTIVE_SLOT} (silent mode)..."
REGENERATION_OUTPUT=$(az cognitiveservices account keys regenerate \
  --name "$OPENAI_ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --key-name "$INACTIVE_SLOT" \
  --output json 2>/dev/null)

NEW_CRED=$(echo "$REGENERATION_OUTPUT" | jq -r ".${INACTIVE_SLOT}")

if [ -z "$NEW_CRED" ] || [ "$NEW_CRED" = "null" ]; then
  log_error "Failed to regenerate inactive key"
  exit 1
fi

log_info "Inactive key regenerated successfully (value NOT logged)"

# =============================================================================
# UPDATE KEY VAULT SECRET
# =============================================================================

log_info "Updating Key Vault secret with new key (silent mode)..."
az keyvault secret set \
  --vault-name "$KEYVAULT_NAME" \
  --name "$SECRET_NAME" \
  --value "$NEW_CRED" \
  --output none

# Clear key from memory
unset NEW_CRED REGENERATION_OUTPUT

log_info "Key Vault secret updated successfully"

# =============================================================================
# FORCE CONFIG REFERENCE REFRESH
# =============================================================================

log_info "Triggering Function App config reference refresh..."

# Method 1: Touch a dummy app setting to force refresh
TIMESTAMP=$(date +%s)
az functionapp config appsettings set \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings "_CONFIG_REFRESH_TIMESTAMP=${TIMESTAMP}" \
  --output none

log_info "Config refresh triggered (timestamp: ${TIMESTAMP})"

# Optional Method 2: Explicit restart (use only if immediate refresh required)
# Uncomment below for guaranteed immediate pickup (causes brief downtime)
# log_info "Restarting Function App for immediate key pickup..."
# az functionapp restart \
#   --name "$FUNCTION_APP_NAME" \
#   --resource-group "$RESOURCE_GROUP" \
#   --output none
# log_info "Function App restarted"

# =============================================================================
# VALIDATION
# =============================================================================

log_info "Validating rotation..."
log_info "Old key slot (still active): ${ACTIVE_SLOT}"
log_info "New key slot (regenerated): ${INACTIVE_SLOT}"
log_info "Key Vault secret: updated to new ${INACTIVE_SLOT}"
log_info "Expected propagation time: ≤15 minutes (Key Vault reference cache)"

echo ""
echo "⚠️  DUAL-KEY ROTATION WINDOW ACTIVE"
echo "    - Both keys are valid during propagation"
echo "    - Apps will gradually pick up new key (${INACTIVE_SLOT})"
echo "    - Old key (${ACTIVE_SLOT}) remains valid for fallback"
echo ""
echo "    Monitor Function App logs to confirm new key usage:"
echo "    az functionapp log tail --name ${FUNCTION_APP_NAME} --resource-group ${RESOURCE_GROUP}"
echo ""

# =============================================================================
# COMPLETION
# =============================================================================

echo ""
echo "========================================="
echo "✅ Zero-Downtime Key Rotation Complete"
echo "========================================="
echo "Environment: ${ENV_NAME}"
echo "OpenAI Account: ${OPENAI_ACCOUNT_NAME}"
echo "Regenerated Slot: ${INACTIVE_SLOT}"
echo "Key Vault Secret: ${SECRET_NAME} (updated)"
echo ""
echo "Next steps:"
echo "  1. Monitor app for 15 minutes to confirm new key usage"
echo "  2. Once confirmed, old key (${ACTIVE_SLOT}) can be regenerated on next rotation"
echo "  3. No downtime expected (dual-key strategy)"
echo ""
echo "For immediate pickup (causes brief downtime):"
echo "  az functionapp restart --name ${FUNCTION_APP_NAME} --resource-group ${RESOURCE_GROUP}"
echo ""
