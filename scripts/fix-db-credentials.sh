#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# ProteinLens Database & Function App Troubleshooting Script
# ═══════════════════════════════════════════════════════════════════════════════
# Usage: ./fix-db-credentials.sh [command]
# Commands:
#   reset     - Reset database password and sync credentials (default)
#   diagnose  - Run diagnostics without changing anything
#   test      - Test database and API connectivity
#   logs      - Show recent Function App errors
#   signup    - Test the signup flow
#   tables    - Show database tables and row counts
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Configuration
RG="proteinlens-prod"
DB_SERVER="proteinlens-db-prod-1523"
DB_NAME="proteinlens"
DB_USER="pgadmin"
FUNC_APP="proteinlens-api-prod"
KV_NAME="proteinlens-kv-fzpkp4yb"
API_URL="https://proteinlens-api-prod.azurewebsites.net"

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

get_db_url() {
  az keyvault secret show --vault-name "$KV_NAME" --name database-url --query value -o tsv 2>/dev/null
}

get_db_password() {
  local db_url=$(get_db_url)
  echo "$db_url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p'
}

run_sql() {
  local query="$1"
  local db_url=$(get_db_url)
  local password=$(get_db_password)
  PGPASSWORD="$password" psql -h "$DB_SERVER.postgres.database.azure.com" -U "$DB_USER" -d "$DB_NAME" -c "$query" 2>&1
}

# ─────────────────────────────────────────────────────────────────────────────
# Diagnose Command
# ─────────────────────────────────────────────────────────────────────────────

cmd_diagnose() {
  print_header "Running Diagnostics"

  # Check Azure CLI auth
  print_step "Checking Azure CLI authentication..."
  local account=$(az account show --query name -o tsv 2>/dev/null)
  if [ -n "$account" ]; then
    print_success "Logged in as: $account"
  else
    print_error "Not logged in to Azure CLI"
    return 1
  fi

  # Check Function App status
  print_step "Checking Function App status..."
  local func_state=$(az functionapp show -n "$FUNC_APP" -g "$RG" --query state -o tsv 2>/dev/null)
  if [ "$func_state" = "Running" ]; then
    print_success "Function App is running"
  else
    print_error "Function App state: $func_state"
  fi

  # Check Key Vault secrets
  print_step "Checking Key Vault secrets..."
  local db_secret=$(az keyvault secret show --vault-name "$KV_NAME" --name database-url --query "attributes.enabled" -o tsv 2>/dev/null)
  local acs_secret=$(az keyvault secret show --vault-name "$KV_NAME" --name acs-email-connection --query "attributes.enabled" -o tsv 2>/dev/null)
  
  if [ "$db_secret" = "true" ]; then
    print_success "database-url secret exists and is enabled"
  else
    print_error "database-url secret not found or disabled"
  fi
  
  if [ "$acs_secret" = "true" ]; then
    print_success "acs-email-connection secret exists and is enabled"
  else
    print_warning "acs-email-connection secret not found or disabled"
  fi

  # Check Function App identity access
  print_step "Checking Function App Key Vault access..."
  local principal_id=$(az functionapp identity show -n "$FUNC_APP" -g "$RG" --query principalId -o tsv 2>/dev/null)
  local kv_access=$(az keyvault show --name "$KV_NAME" --query "properties.accessPolicies[?objectId=='$principal_id'].permissions.secrets" -o json 2>/dev/null)
  
  if echo "$kv_access" | grep -q "get"; then
    print_success "Function App has Key Vault access"
  else
    print_error "Function App cannot access Key Vault secrets"
  fi

  # Check database server status
  print_step "Checking PostgreSQL server..."
  local db_state=$(az postgres flexible-server show -g "$RG" -n "$DB_SERVER" --query state -o tsv 2>/dev/null)
  if [ "$db_state" = "Ready" ]; then
    print_success "PostgreSQL server is ready"
  else
    print_error "PostgreSQL server state: $db_state"
  fi

  # Check critical app settings
  print_step "Checking Function App settings..."
  local settings=$(az functionapp config appsettings list -n "$FUNC_APP" -g "$RG" 2>/dev/null)
  
  for setting in "DATABASE_URL" "ACS_EMAIL_CONNECTION_STRING" "FRONTEND_URL" "EMAIL_SERVICE" "JWT_SECRET" "JWT_ISSUER" "JWT_AUDIENCE"; do
    if echo "$settings" | jq -e ".[] | select(.name==\"$setting\")" > /dev/null 2>&1; then
      local value=$(echo "$settings" | jq -r ".[] | select(.name==\"$setting\") | .value")
      if [[ "$value" == @Microsoft.KeyVault* ]]; then
        print_success "$setting is configured (Key Vault reference)"
      else
        print_success "$setting is configured"
      fi
    else
      print_warning "$setting is not set"
    fi
  done

  # Check Application Insights
  print_step "Checking Application Insights..."
  if echo "$settings" | jq -e '.[] | select(.name=="APPLICATIONINSIGHTS_CONNECTION_STRING")' > /dev/null 2>&1; then
    print_success "Application Insights is configured"
  else
    print_warning "Application Insights is not configured"
  fi

  echo ""
  print_success "Diagnostics complete"
}

# ─────────────────────────────────────────────────────────────────────────────
# Test Command
# ─────────────────────────────────────────────────────────────────────────────

cmd_test() {
  print_header "Testing Connectivity"

  # Test API health endpoint
  print_step "Testing API health endpoint..."
  local health=$(curl -s "$API_URL/api/health/readiness" 2>/dev/null)
  local status=$(echo "$health" | jq -r '.status' 2>/dev/null)
  
  if [ "$status" = "ready" ]; then
    print_success "API health check passed: $status"
  else
    print_error "API health check failed"
    echo "$health" | jq . 2>/dev/null || echo "$health"
  fi

  # Test database connection
  print_step "Testing database connection..."
  local db_test=$(run_sql "SELECT 1 as test;" 2>&1)
  if echo "$db_test" | grep -q "1 row"; then
    print_success "Database connection successful"
  else
    print_error "Database connection failed"
    echo "$db_test"
  fi

  # Test auth endpoint
  print_step "Testing auth check-email endpoint..."
  local auth_response=$(curl -s "$API_URL/api/auth/check-email?email=test@example.com" 2>/dev/null)
  local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/check-email?email=test@example.com" 2>/dev/null)
  
  if [ "$http_code" = "200" ]; then
    print_success "Auth endpoint returned HTTP $http_code"
    echo "$auth_response" | jq . 2>/dev/null || echo "$auth_response"
  else
    print_warning "Auth endpoint returned HTTP $http_code"
    echo "$auth_response" | jq . 2>/dev/null || echo "$auth_response"
  fi

  echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Signup Test Command
# ─────────────────────────────────────────────────────────────────────────────

cmd_signup() {
  print_header "Testing Signup Flow"

  local unique_id=$(date +%s)
  local test_email="test-$unique_id@example.com"
  local test_password="Xk9#mR4\$pL7@qW2!zY5vN"

  print_step "Testing signup with email: $test_email"
  
  local response=$(curl -s -X POST "$API_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$test_email\",
      \"password\": \"$test_password\",
      \"firstName\": \"Test\",
      \"lastName\": \"User\",
      \"organizationName\": \"Test Org\",
      \"acceptedTerms\": true,
      \"acceptedPrivacy\": true
    }" 2>/dev/null)

  echo ""
  echo "Response:"
  echo "$response" | jq . 2>/dev/null || echo "$response"

  # Check signup attempts in database
  print_step "Checking recent signup attempts in database..."
  local attempts=$(run_sql "SELECT email, outcome, \"failureReason\", \"createdAt\" FROM \"SignupAttempt\" ORDER BY \"createdAt\" DESC LIMIT 5;" 2>&1)
  echo "$attempts"

  # Check if user was created
  print_step "Checking if user was created..."
  local user=$(run_sql "SELECT id, email, \"emailVerified\", \"createdAt\" FROM \"User\" WHERE email LIKE 'test-%@example.com' ORDER BY \"createdAt\" DESC LIMIT 3;" 2>&1)
  echo "$user"
}

# ─────────────────────────────────────────────────────────────────────────────
# Tables Command
# ─────────────────────────────────────────────────────────────────────────────

cmd_tables() {
  print_header "Database Tables Overview"

  print_step "Getting table row counts..."
  
  local tables="User EmailVerificationToken PasswordResetToken SignupAttempt ConsentRecord AuthEvent RefreshToken"
  
  for table in $tables; do
    local count=$(run_sql "SELECT COUNT(*) FROM \"$table\";" 2>&1 | grep -E "^\s*[0-9]+" | tr -d ' ')
    printf "  %-25s %s rows\n" "$table" "$count"
  done

  echo ""
  print_step "Recent users..."
  run_sql "SELECT id, email, \"emailVerified\", \"authProvider\", \"createdAt\" FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 5;"

  echo ""
  print_step "Recent signup attempts..."
  run_sql "SELECT email, outcome, \"failureReason\", \"createdAt\" FROM \"SignupAttempt\" ORDER BY \"createdAt\" DESC LIMIT 5;"
}

# ─────────────────────────────────────────────────────────────────────────────
# Logs Command
# ─────────────────────────────────────────────────────────────────────────────

cmd_logs() {
  print_header "Function App Logs"

  print_step "Getting recent exceptions from Application Insights..."
  
  # Get App Insights resource
  local app_insights=$(az resource list -g "$RG" --resource-type "Microsoft.Insights/components" --query "[0].name" -o tsv 2>/dev/null)
  
  if [ -z "$app_insights" ]; then
    print_warning "No Application Insights found in resource group"
    return
  fi

  print_step "Using Application Insights: $app_insights"
  
  # Query for recent exceptions
  local workspace_id=$(az monitor app-insights component show -g "$RG" --app "$app_insights" --query "workspaceResourceId" -o tsv 2>/dev/null)
  
  if [ -n "$workspace_id" ]; then
    print_step "Querying Log Analytics workspace..."
    az monitor log-analytics query -w "$workspace_id" \
      --analytics-query "AppExceptions | where TimeGenerated > ago(1h) | project TimeGenerated, ExceptionType, OuterMessage, InnermostMessage | order by TimeGenerated desc | take 10" \
      --timespan "PT1H" \
      -o table 2>/dev/null || print_warning "No recent exceptions found"
  else
    print_warning "Could not get Log Analytics workspace"
  fi

  # Also try to get function invocation failures
  print_step "Checking recent function invocations..."
  az monitor log-analytics query -w "$workspace_id" \
    --analytics-query "FunctionAppLogs | where TimeGenerated > ago(1h) | where Level == 'Error' or Level == 'Warning' | project TimeGenerated, Level, Message | order by TimeGenerated desc | take 10" \
    --timespan "PT1H" \
    -o table 2>/dev/null || print_warning "No recent function logs found"
}

# ─────────────────────────────────────────────────────────────────────────────
# Reset Command (Original Functionality)
# ─────────────────────────────────────────────────────────────────────────────

cmd_reset() {
  print_header "Resetting Database Credentials"

  # Add firewall rule for current IP
  print_step "Adding firewall rule for current IP..."
  MY_IP=$(curl -s ifconfig.me)
  echo "  Your IP: $MY_IP"
  az postgres flexible-server firewall-rule create \
    --resource-group "$RG" \
    --name "$DB_SERVER" \
    --rule-name "DevIP-$(date +%Y%m%d)" \
    --start-ip-address "$MY_IP" \
    --end-ip-address "$MY_IP" \
    --only-show-errors 2>/dev/null || true
  print_success "Firewall rule added"

  # Generate strong password
  NEW_PASSWORD=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9!@#$%^&*' | head -c 24)

  print_step "Updating PostgreSQL admin password..."
  az postgres flexible-server update \
    --resource-group "$RG" \
    --name "$DB_SERVER" \
    --admin-password "$NEW_PASSWORD" \
    --output none
  print_success "PostgreSQL password updated"

  # Build DATABASE_URL connection string
  DB_URL="postgresql://${DB_USER}:${NEW_PASSWORD}@${DB_SERVER}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"

  print_step "Updating Key Vault secret: database-url..."
  az keyvault secret set \
    --vault-name "$KV_NAME" \
    --name database-url \
    --value "$DB_URL" \
    --output none
  print_success "Key Vault secret updated"

  # Get the new secret URI with version
  DB_VAULT=$(az keyvault secret show --vault-name "$KV_NAME" --name database-url --query id -o tsv)

  print_step "Updating Function App settings..."
  az functionapp config appsettings set \
    --name "$FUNC_APP" \
    --resource-group "$RG" \
    --settings "SECRET_REFRESH=$(date +%s)" \
    --only-show-errors -o none

  az functionapp config appsettings set \
    --name "$FUNC_APP" \
    --resource-group "$RG" \
    --settings "DATABASE_URL=@Microsoft.KeyVault(SecretUri=$DB_VAULT)" \
    --only-show-errors -o none
  print_success "Function App settings updated"

  print_step "Restarting Function App..."
  az functionapp stop --name "$FUNC_APP" --resource-group "$RG" --only-show-errors
  sleep 5
  az functionapp start --name "$FUNC_APP" --resource-group "$RG" --only-show-errors
  print_success "Function App restarted"

  echo ""
  print_success "Database credentials synchronized!"
  echo ""
  echo "Waiting 15s for Function App to reload..."
  sleep 15

  # Run tests
  cmd_test
}

# ─────────────────────────────────────────────────────────────────────────────
# JWT Command - Setup/verify JWT secrets
# ─────────────────────────────────────────────────────────────────────────────

cmd_jwt() {
  print_header "JWT Secret Management"

  local subcmd="${1:-status}"
  
  case "$subcmd" in
    setup)
      print_step "Setting up JWT secrets..."
      
      # Check if JWT secret exists
      local secret_exists=$(az keyvault secret show --vault-name "$KV_NAME" --name jwt-secret --query "attributes.enabled" -o tsv 2>/dev/null || echo "")
      
      if [ "$secret_exists" = "true" ]; then
        print_warning "JWT secret already exists. Use 'jwt rotate' to generate a new one."
        return
      fi
      
      # Generate JWT secret
      local jwt_secret=$(openssl rand -base64 64 | tr -d '\n')
      
      print_step "Storing JWT secret in Key Vault..."
      az keyvault secret set \
        --vault-name "$KV_NAME" \
        --name jwt-secret \
        --value "$jwt_secret" \
        --content-type "JWT signing key" \
        --output none
      print_success "JWT secret stored"
      
      # Get Key Vault URI
      local kv_uri=$(az keyvault show --name "$KV_NAME" --query "properties.vaultUri" -o tsv | sed 's/\/$//')
      
      print_step "Configuring Function App..."
      az functionapp config appsettings set \
        --name "$FUNC_APP" \
        --resource-group "$RG" \
        --settings \
          "JWT_SECRET=@Microsoft.KeyVault(SecretUri=$kv_uri/secrets/jwt-secret)" \
          "JWT_ISSUER=proteinlens-api" \
          "JWT_AUDIENCE=proteinlens-frontend" \
        --output none
      print_success "Function App settings configured"
      
      print_step "Restarting Function App..."
      az functionapp restart --name "$FUNC_APP" --resource-group "$RG" --output none
      print_success "JWT setup complete!"
      ;;
      
    rotate)
      print_warning "This will invalidate ALL existing user sessions!"
      read -p "Are you sure? (yes/no): " confirm
      if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        return
      fi
      
      # Generate new JWT secret
      local jwt_secret=$(openssl rand -base64 64 | tr -d '\n')
      
      print_step "Creating new JWT secret version..."
      az keyvault secret set \
        --vault-name "$KV_NAME" \
        --name jwt-secret \
        --value "$jwt_secret" \
        --content-type "JWT signing key - rotated $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --output none
      print_success "New JWT secret version created"
      
      # Update Function App timestamp
      az functionapp config appsettings set \
        --name "$FUNC_APP" \
        --resource-group "$RG" \
        --settings "JWT_SECRET_ROTATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --output none
      
      print_step "Restarting Function App..."
      az functionapp restart --name "$FUNC_APP" --resource-group "$RG" --output none
      print_success "JWT secret rotated! All users must re-login."
      ;;
      
    status|*)
      print_step "JWT Secret Status:"
      
      # Check Key Vault
      local secret_info=$(az keyvault secret show --vault-name "$KV_NAME" --name jwt-secret 2>/dev/null)
      if [ -n "$secret_info" ]; then
        local created=$(echo "$secret_info" | jq -r '.attributes.created')
        local updated=$(echo "$secret_info" | jq -r '.attributes.updated')
        print_success "Key Vault secret exists"
        echo "    Created: $created"
        echo "    Updated: $updated"
      else
        print_error "JWT secret not found in Key Vault"
      fi
      
      # Check Function App settings
      local settings=$(az functionapp config appsettings list -n "$FUNC_APP" -g "$RG" 2>/dev/null)
      echo ""
      print_step "Function App JWT Settings:"
      for setting in "JWT_SECRET" "JWT_ISSUER" "JWT_AUDIENCE"; do
        local value=$(echo "$settings" | jq -r ".[] | select(.name==\"$setting\") | .value" 2>/dev/null)
        if [ -n "$value" ]; then
          if [[ "$value" == @Microsoft.KeyVault* ]]; then
            echo "    $setting: 🔐 Key Vault Reference"
          else
            echo "    $setting: $value"
          fi
        else
          echo "    $setting: ❌ Not configured"
        fi
      done
      ;;
  esac
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

COMMAND="${1:-reset}"

case "$COMMAND" in
  reset)
    cmd_reset
    ;;
  diagnose)
    cmd_diagnose
    ;;
  test)
    cmd_test
    ;;
  logs)
    cmd_logs
    ;;
  signup)
    cmd_signup
    ;;
  tables)
    cmd_tables
    ;;
  jwt)
    cmd_jwt "$2"
    ;;
  *)
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  reset     - Reset database password and sync credentials (default)"
    echo "  diagnose  - Run diagnostics without changing anything"
    echo "  test      - Test database and API connectivity"
    echo "  logs      - Show recent Function App errors"
    echo "  signup    - Test the signup flow"
    echo "  tables    - Show database tables and row counts"
    echo "  jwt       - JWT secret management (status|setup|rotate)"
    exit 1
    ;;
esac
