#!/usr/bin/env bash
# Provision OpenAI Foundry resources on-demand
# Constitution Principles IX, X, XII: On-Demand Lifecycle, Key Vault Supremacy, IaC Idempotency

set -euo pipefail

# =============================================================================
# PARAMETERS
# =============================================================================

ENV_NAME="${1:-dev}"
REGION="${2:-eastus}"
MODEL="${3:-gpt-5-1}"
RESOURCE_GROUP="${RESOURCE_GROUP:-proteinlens-${ENV_NAME}}"
KEYVAULT_NAME="${KEYVAULT_NAME:-proteinlens-kv-${ENV_NAME}}"
FUNCTION_APP_NAME="${FUNCTION_APP_NAME:-proteinlens-api-${ENV_NAME}}"

OPENAI_ACCOUNT_NAME="protein-lens-openai-${ENV_NAME}"
SECRET_NAME="AZURE-OPENAI-API-KEY--${ENV_NAME}"

echo "[foundry-up] Starting OpenAI provisioning for environment: ${ENV_NAME}"
echo "[foundry-up] Resource group: ${RESOURCE_GROUP}"
echo "[foundry-up] Region: ${REGION}"
echo "[foundry-up] Model deployment: ${MODEL}"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

log_info() {
  echo "[foundry-up] INFO: $*"
}

log_error() {
  echo "[foundry-up] ERROR: $*" >&2
}

# Detect which key slot is currently active (without logging key values)
detect_active_key_slot() {
  local account_name="$1"
  local rg="$2"
  
  # List keys but DO NOT print them
  local keys_json
  keys_json=$(az cognitiveservices account keys list \
    --name "$account_name" \
    --resource-group "$rg" \
    --output json 2>/dev/null || echo "{}")
  
  # Check if key1 or key2 exists (both should exist for new accounts)
  local key1_exists
  key1_exists=$(echo "$keys_json" | jq -r '.key1 // empty' | wc -c)
  
  if [ "$key1_exists" -gt 1 ]; then
    echo "key1"
  else
    echo "key2"
  fi
}

# =============================================================================
# PREFLIGHT CHECKS
# =============================================================================

log_info "Checking Azure CLI login status..."
if ! az account show &>/dev/null; then
  log_error "Not logged in to Azure CLI. Run 'az login' first."
  exit 1
fi

log_info "Checking resource group existence..."
if ! az group show --name "$RESOURCE_GROUP" &>/dev/null; then
  log_error "Resource group '$RESOURCE_GROUP' does not exist. Create it first."
  exit 1
fi

log_info "Checking Key Vault existence..."
if ! az keyvault show --name "$KEYVAULT_NAME" &>/dev/null; then
  log_error "Key Vault '$KEYVAULT_NAME' does not exist. Deploy main infrastructure first."
  exit 1
fi

# =============================================================================
# DEPLOY OPENAI RESOURCE (IDEMPOTENT)
# =============================================================================

log_info "Deploying OpenAI account and model deployment via Bicep..."
log_info "Running what-if analysis first..."

BICEP_FILE="$(dirname "$0")/../infra/bicep/openai-foundry.bicep"

# What-if check (dry run)
az deployment group what-if \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters environmentName="$ENV_NAME" \
               location="$REGION" \
               modelDeploymentName="$MODEL"

log_info "Proceeding with deployment..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters environmentName="$ENV_NAME" \
               location="$REGION" \
               modelDeploymentName="$MODEL" \
  --output json)

OPENAI_ENDPOINT=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs.openAIEndpoint.value')
DEPLOYMENT_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs.modelDeploymentName.value')

log_info "OpenAI account deployed: ${OPENAI_ACCOUNT_NAME}"
log_info "Model deployment: ${DEPLOYMENT_NAME}"
log_info "Endpoint: ${OPENAI_ENDPOINT}"

# =============================================================================
# RETRIEVE API KEY AND STORE IN KEY VAULT (NO LOGGING)
# =============================================================================

log_info "Retrieving OpenAI API key (silent mode)..."
ACTIVE_KEY_SLOT=$(detect_active_key_slot "$OPENAI_ACCOUNT_NAME" "$RESOURCE_GROUP")
log_info "Active key slot detected: ${ACTIVE_KEY_SLOT}"

# Retrieve key silently (do NOT echo or log)
API_KEY=$(az cognitiveservices account keys list \
  --name "$OPENAI_ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "${ACTIVE_KEY_SLOT}" \
  --output tsv 2>/dev/null)

if [ -z "$API_KEY" ]; then
  log_error "Failed to retrieve API key"
  exit 1
fi

log_info "Storing API key in Key Vault secret: ${SECRET_NAME} (silent mode)..."
az keyvault secret set \
  --vault-name "$KEYVAULT_NAME" \
  --name "$SECRET_NAME" \
  --value "$API_KEY" \
  --output none

# Clear key from memory
unset API_KEY

log_info "Secret stored successfully (key value NOT logged)"

# =============================================================================
# UPDATE FUNCTION APP SETTING TO KEY VAULT REFERENCE
# =============================================================================

log_info "Getting Function App managed identity principal ID..."
FUNCTION_PRINCIPAL_ID=$(az functionapp show \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query identity.principalId \
  --output tsv)

if [ -z "$FUNCTION_PRINCIPAL_ID" ]; then
  log_error "Function App managed identity not found. Ensure system-assigned identity is enabled."
  exit 1
fi

log_info "Function App principal ID: ${FUNCTION_PRINCIPAL_ID}"

# Get Key Vault URI
KEYVAULT_URI=$(az keyvault show \
  --name "$KEYVAULT_NAME" \
  --query properties.vaultUri \
  --output tsv)

SECRET_URI="${KEYVAULT_URI}secrets/${SECRET_NAME}"
KEYVAULT_REFERENCE="@Microsoft.KeyVault(SecretUri=${SECRET_URI})"

log_info "Setting Function App setting AZURE_OPENAI_API_KEY to Key Vault reference..."
az functionapp config appsettings set \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings "AZURE_OPENAI_API_KEY=${KEYVAULT_REFERENCE}" \
             "AZURE_OPENAI_ENDPOINT=${OPENAI_ENDPOINT}" \
             "AZURE_OPENAI_DEPLOYMENT=${DEPLOYMENT_NAME}" \
  --output none

log_info "Function App configured to use Key Vault reference"

# =============================================================================
# GRANT FUNCTION APP KEY VAULT SECRETS USER ROLE (IDEMPOTENT)
# =============================================================================

log_info "Granting Function App 'Key Vault Secrets User' role..."
KEYVAULT_ID=$(az keyvault show --name "$KEYVAULT_NAME" --query id --output tsv)

# Idempotent: role assignment succeeds even if already exists
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee-object-id "$FUNCTION_PRINCIPAL_ID" \
  --assignee-principal-type ServicePrincipal \
  --scope "$KEYVAULT_ID" \
  --output none 2>/dev/null || log_info "Role already assigned (idempotent)"

log_info "Role assignment complete"

# =============================================================================
# COMPLETION
# =============================================================================

echo ""
echo "========================================="
echo "✅ OpenAI Foundry Provisioning Complete"
echo "========================================="
echo "Environment: ${ENV_NAME}"
echo "OpenAI Account: ${OPENAI_ACCOUNT_NAME}"
echo "Model Deployment: ${DEPLOYMENT_NAME}"
echo "Endpoint: ${OPENAI_ENDPOINT}"
echo "Key Vault Secret: ${SECRET_NAME}"
echo "Function App: ${FUNCTION_APP_NAME}"
echo ""
echo "Next steps:"
echo "  - Test with: curl \${FUNCTION_APP_URL}/api/health"
echo "  - Rotate key: ./scripts/foundry-rotate-key.sh ${ENV_NAME}"
echo "  - Teardown: ./scripts/foundry-down.sh ${ENV_NAME}"
echo ""
