#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# ProteinLens JWT & Auth Secrets Setup Script
# ═══════════════════════════════════════════════════════════════════════════════
# Usage: ./setup-jwt-secrets.sh [command]
# Commands:
#   setup     - Generate and deploy JWT secrets (default)
#   verify    - Verify JWT secrets are properly configured
#   rotate    - Rotate JWT secret (generates new secret)
#   status    - Show current JWT configuration status
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Configuration - can be overridden with environment variables
RG="${RG:-proteinlens-prod}"
FUNC_APP="${FUNC_APP:-proteinlens-api-prod}"
KV_NAME="${KV_NAME:-proteinlens-kv-fzpkp4yb}"

# JWT Configuration
JWT_SECRET_NAME="jwt-secret"
JWT_ISSUER="${JWT_ISSUER:-proteinlens-api}"
JWT_AUDIENCE="${JWT_AUDIENCE:-proteinlens-frontend}"
JWT_ACCESS_EXPIRY="${JWT_ACCESS_EXPIRY:-15m}"
JWT_REFRESH_EXPIRY="${JWT_REFRESH_EXPIRY:-7d}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

print_step() {
  echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

check_azure_login() {
  print_step "Checking Azure CLI authentication..."
  local account=$(az account show --query name -o tsv 2>/dev/null)
  if [ -z "$account" ]; then
    print_error "Not logged in to Azure CLI. Run 'az login' first."
    exit 1
  fi
  print_success "Logged in as: $account"
}

get_keyvault_uri() {
  az keyvault show --name "$KV_NAME" --query "properties.vaultUri" -o tsv 2>/dev/null | sed 's/\/$//'
}

# ─────────────────────────────────────────────────────────────────────────────
# Setup Command - Generate and deploy JWT secrets
# ─────────────────────────────────────────────────────────────────────────────

cmd_setup() {
  print_header "Setting up JWT Authentication Secrets"
  
  check_azure_login

  # Check if JWT secret already exists
  print_step "Checking existing JWT secret in Key Vault..."
  local existing_secret=$(az keyvault secret show --vault-name "$KV_NAME" --name "$JWT_SECRET_NAME" --query "attributes.enabled" -o tsv 2>/dev/null || echo "")
  
  if [ "$existing_secret" = "true" ]; then
    print_warning "JWT secret already exists in Key Vault"
    echo "  Use 'rotate' command to generate a new secret"
    echo "  Use 'verify' command to check configuration"
    read -p "Continue with existing secret? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
      echo "Aborted."
      exit 0
    fi
  else
    # Generate new JWT secret
    print_step "Generating new JWT secret..."
    local jwt_secret=$(openssl rand -base64 64 | tr -d '\n')
    
    # Store in Key Vault
    print_step "Storing JWT secret in Key Vault..."
    az keyvault secret set \
      --vault-name "$KV_NAME" \
      --name "$JWT_SECRET_NAME" \
      --value "$jwt_secret" \
      --content-type "JWT signing key" \
      --output none
    print_success "JWT secret stored in Key Vault"
  fi

  # Get Key Vault URI for the secret
  local kv_uri=$(get_keyvault_uri)
  local secret_uri="$kv_uri/secrets/$JWT_SECRET_NAME"
  
  print_step "Configuring Function App settings..."
  
  # Set JWT_SECRET as Key Vault reference
  az functionapp config appsettings set \
    --name "$FUNC_APP" \
    --resource-group "$RG" \
    --settings "JWT_SECRET=@Microsoft.KeyVault(SecretUri=$secret_uri)" \
    --output none
  print_success "JWT_SECRET configured (Key Vault reference)"

  # Set JWT_ISSUER and JWT_AUDIENCE
  az functionapp config appsettings set \
    --name "$FUNC_APP" \
    --resource-group "$RG" \
    --settings \
      "JWT_ISSUER=$JWT_ISSUER" \
      "JWT_AUDIENCE=$JWT_AUDIENCE" \
      "JWT_ACCESS_EXPIRY=$JWT_ACCESS_EXPIRY" \
      "JWT_REFRESH_EXPIRY=$JWT_REFRESH_EXPIRY" \
    --output none
  print_success "JWT configuration settings applied"

  # Restart Function App
  print_step "Restarting Function App to apply changes..."
  az functionapp restart --name "$FUNC_APP" --resource-group "$RG" --output none
  print_success "Function App restarted"

  echo ""
  print_success "JWT authentication setup complete!"
  echo ""
  echo "Configuration summary:"
  echo "  JWT_SECRET:        Key Vault reference → $secret_uri"
  echo "  JWT_ISSUER:        $JWT_ISSUER"
  echo "  JWT_AUDIENCE:      $JWT_AUDIENCE"
  echo "  JWT_ACCESS_EXPIRY: $JWT_ACCESS_EXPIRY"
  echo "  JWT_REFRESH_EXPIRY: $JWT_REFRESH_EXPIRY"
}

# ─────────────────────────────────────────────────────────────────────────────
# Verify Command - Check JWT configuration
# ─────────────────────────────────────────────────────────────────────────────

cmd_verify() {
  print_header "Verifying JWT Configuration"
  
  check_azure_login
  
  local all_ok=true

  # Check Key Vault secret
  print_step "Checking Key Vault secret..."
  local secret_enabled=$(az keyvault secret show --vault-name "$KV_NAME" --name "$JWT_SECRET_NAME" --query "attributes.enabled" -o tsv 2>/dev/null || echo "")
  if [ "$secret_enabled" = "true" ]; then
    print_success "JWT secret exists and is enabled in Key Vault"
  else
    print_error "JWT secret not found or disabled in Key Vault"
    all_ok=false
  fi

  # Check Function App settings
  print_step "Checking Function App settings..."
  local settings=$(az functionapp config appsettings list -n "$FUNC_APP" -g "$RG" 2>/dev/null)
  
  for setting in "JWT_SECRET" "JWT_ISSUER" "JWT_AUDIENCE"; do
    local value=$(echo "$settings" | jq -r ".[] | select(.name==\"$setting\") | .value" 2>/dev/null)
    if [ -n "$value" ]; then
      if [[ "$value" == @Microsoft.KeyVault* ]]; then
        print_success "$setting is configured (Key Vault reference)"
      else
        print_success "$setting is configured: $value"
      fi
    else
      print_error "$setting is NOT configured"
      all_ok=false
    fi
  done

  # Check Function App managed identity Key Vault access
  print_step "Checking Function App Key Vault access..."
  local principal_id=$(az functionapp identity show -n "$FUNC_APP" -g "$RG" --query principalId -o tsv 2>/dev/null)
  if [ -n "$principal_id" ]; then
    local kv_access=$(az keyvault show --name "$KV_NAME" --query "properties.accessPolicies[?objectId=='$principal_id'].permissions.secrets" -o json 2>/dev/null)
    if echo "$kv_access" | grep -q "get"; then
      print_success "Function App has Key Vault secret read access"
    else
      print_error "Function App cannot read Key Vault secrets"
      all_ok=false
    fi
  else
    print_error "Function App managed identity not configured"
    all_ok=false
  fi

  echo ""
  if [ "$all_ok" = true ]; then
    print_success "All JWT configuration checks passed!"
  else
    print_error "Some JWT configuration issues detected. Run 'setup' to fix."
    exit 1
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Rotate Command - Generate new JWT secret
# ─────────────────────────────────────────────────────────────────────────────

cmd_rotate() {
  print_header "Rotating JWT Secret"
  
  check_azure_login
  
  print_warning "This will invalidate all existing JWT tokens!"
  print_warning "All users will need to sign in again."
  read -p "Are you sure you want to rotate the JWT secret? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
  fi

  # Generate new JWT secret
  print_step "Generating new JWT secret..."
  local jwt_secret=$(openssl rand -base64 64 | tr -d '\n')
  
  # Create new version in Key Vault
  print_step "Creating new secret version in Key Vault..."
  az keyvault secret set \
    --vault-name "$KV_NAME" \
    --name "$JWT_SECRET_NAME" \
    --value "$jwt_secret" \
    --content-type "JWT signing key - rotated $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --output none
  print_success "New JWT secret version created"

  # Get new secret URI
  local kv_uri=$(get_keyvault_uri)
  local secret_uri="$kv_uri/secrets/$JWT_SECRET_NAME"
  
  # Force Function App to pick up new secret (remove version pinning)
  print_step "Updating Function App to use new secret..."
  az functionapp config appsettings set \
    --name "$FUNC_APP" \
    --resource-group "$RG" \
    --settings \
      "JWT_SECRET=@Microsoft.KeyVault(SecretUri=$secret_uri)" \
      "JWT_SECRET_ROTATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --output none
  print_success "Function App settings updated"

  # Restart Function App
  print_step "Restarting Function App..."
  az functionapp restart --name "$FUNC_APP" --resource-group "$RG" --output none
  print_success "Function App restarted"

  echo ""
  print_success "JWT secret rotation complete!"
  echo ""
  echo "Note: All existing user sessions have been invalidated."
  echo "Users will need to sign in again."
}

# ─────────────────────────────────────────────────────────────────────────────
# Status Command - Show current configuration
# ─────────────────────────────────────────────────────────────────────────────

cmd_status() {
  print_header "JWT Configuration Status"
  
  check_azure_login

  echo ""
  echo "Environment:"
  echo "  Resource Group:   $RG"
  echo "  Function App:     $FUNC_APP"
  echo "  Key Vault:        $KV_NAME"
  echo ""

  # Key Vault secret info
  print_step "Key Vault Secret Info:"
  local secret_info=$(az keyvault secret show --vault-name "$KV_NAME" --name "$JWT_SECRET_NAME" 2>/dev/null)
  if [ -n "$secret_info" ]; then
    local created=$(echo "$secret_info" | jq -r '.attributes.created')
    local updated=$(echo "$secret_info" | jq -r '.attributes.updated')
    local enabled=$(echo "$secret_info" | jq -r '.attributes.enabled')
    local content_type=$(echo "$secret_info" | jq -r '.contentType // "not set"')
    echo "    Status:       $([ "$enabled" = "true" ] && echo "✅ Enabled" || echo "❌ Disabled")"
    echo "    Content Type: $content_type"
    echo "    Created:      $created"
    echo "    Updated:      $updated"
  else
    echo "    ❌ Secret not found"
  fi
  echo ""

  # Function App settings
  print_step "Function App Settings:"
  local settings=$(az functionapp config appsettings list -n "$FUNC_APP" -g "$RG" 2>/dev/null)
  
  for setting in "JWT_SECRET" "JWT_ISSUER" "JWT_AUDIENCE" "JWT_ACCESS_EXPIRY" "JWT_REFRESH_EXPIRY" "JWT_SECRET_ROTATED_AT"; do
    local value=$(echo "$settings" | jq -r ".[] | select(.name==\"$setting\") | .value" 2>/dev/null)
    if [ -n "$value" ]; then
      if [[ "$value" == @Microsoft.KeyVault* ]]; then
        echo "    $setting: 🔐 Key Vault Reference"
      else
        echo "    $setting: $value"
      fi
    else
      echo "    $setting: ⚠️  Not configured"
    fi
  done
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

COMMAND="${1:-setup}"

case "$COMMAND" in
  setup)
    cmd_setup
    ;;
  verify)
    cmd_verify
    ;;
  rotate)
    cmd_rotate
    ;;
  status)
    cmd_status
    ;;
  *)
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Generate and deploy JWT secrets (default)"
    echo "  verify    - Verify JWT secrets are properly configured"
    echo "  rotate    - Rotate JWT secret (generates new secret)"
    echo "  status    - Show current JWT configuration status"
    echo ""
    echo "Environment Variables:"
    echo "  RG           - Resource group name (default: proteinlens-prod)"
    echo "  FUNC_APP     - Function App name (default: proteinlens-api-prod)"
    echo "  KV_NAME      - Key Vault name (default: proteinlens-kv-fzpkp4yb)"
    echo "  JWT_ISSUER   - JWT issuer (default: proteinlens-api)"
    echo "  JWT_AUDIENCE - JWT audience (default: proteinlens-frontend)"
    exit 1
    ;;
esac
