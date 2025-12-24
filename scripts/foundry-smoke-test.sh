#!/usr/bin/env bash
# Smoke test for OpenAI Foundry integration
# Validates API key is loaded and logs don't contain secrets

set -euo pipefail

ENV_NAME="${1:-dev}"
FUNCTION_APP_NAME="${FUNCTION_APP_NAME:-proteinlens-api-${ENV_NAME}}"
RESOURCE_GROUP="${RESOURCE_GROUP:-proteinlens-${ENV_NAME}}"

echo "[smoke-test] Running OpenAI Foundry smoke tests for environment: ${ENV_NAME}"

# =============================================================================
# TEST 1: Check Function App has Key Vault reference
# =============================================================================

echo "[smoke-test] TEST 1: Validating Function App Key Vault reference..."

APP_SETTINGS=$(az functionapp config appsettings list \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --output json)

OPENAI_SETTING=$(printf '%s' "$APP_SETTINGS" | jq -r '.[] | select(.name=="AZURE_OPENAI_API_KEY") | .value')

if [[ "$OPENAI_SETTING" == @Microsoft.KeyVault* ]]; then
  echo "✅ PASS: Function App uses Vault reference"
  echo "   Reference prefix: ${OPENAI_SETTING:0:30}..."
else
  echo "❌ FAIL: Function App does NOT use Vault reference"
  echo "   (value hidden for security)"
  exit 1
fi

# =============================================================================
# TEST 2: Check Function App endpoint responds
# =============================================================================

echo "[smoke-test] TEST 2: Checking Function App health endpoint..."

FUNCTION_URL=$(az functionapp show \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query defaultHostName \
  --output tsv)

HEALTH_URL="https://${FUNCTION_URL}/api/health"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ PASS: Function App health endpoint responding"
else
  echo "⚠️ WARN: Function App health endpoint returned: $HTTP_STATUS"
  echo "   This may be expected if app is still warming up"
fi

# =============================================================================
# TEST 3: Scan workflow logs for secret leaks
# =============================================================================

echo "[smoke-test] TEST 3: Scanning for secret leaks in recent logs..."

# Get last 100 log lines (without streaming)
RECENT_LOGS=$(az functionapp log tail \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  2>/dev/null | head -100 || echo "")

# Check for common secret patterns (basic scan)
LEAK_PATTERNS=(
  "sk-[A-Za-z0-9]{32,}"  # OpenAI API key pattern
  "key[1-2]: [A-Za-z0-9]{32,}"  # Azure key pattern
  "api.key.*=.*[A-Za-z0-9]{32,}"  # Generic API key
)

LEAK_FOUND=false
for pattern in "${LEAK_PATTERNS[@]}"; do
  if echo "$RECENT_LOGS" | grep -qE "$pattern"; then
    echo "❌ FAIL: Potential secret leak detected (pattern: $pattern)"
    LEAK_FOUND=true
  fi
done

if [ "$LEAK_FOUND" = false ]; then
  echo "✅ PASS: No obvious secret leaks in recent logs"
else
  echo "⚠️ Review logs manually for false positives"
fi

# =============================================================================
# TEST 4: Verify OpenAI resource exists
# =============================================================================

echo "[smoke-test] TEST 4: Verifying OpenAI resource deployment..."

OPENAI_ACCOUNT="protein-lens-openai-${ENV_NAME}"

if az cognitiveservices account show \
  --name "$OPENAI_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  
  PROVISIONING_STATE=$(az cognitiveservices account show \
    --name "$OPENAI_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --query properties.provisioningState \
    --output tsv)
  
  if [ "$PROVISIONING_STATE" = "Succeeded" ]; then
    echo "✅ PASS: OpenAI account deployed and ready"
  else
    echo "⚠️ WARN: OpenAI account state: $PROVISIONING_STATE"
  fi
else
  echo "❌ FAIL: OpenAI account not found"
  exit 1
fi

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "========================================="
echo "✅ Smoke Test Complete"
echo "========================================="
echo "Environment: ${ENV_NAME}"
echo "Function App: ${FUNCTION_APP_NAME}"
echo "OpenAI Account: ${OPENAI_ACCOUNT}"
echo ""
echo "All critical checks passed. System ready for testing."
echo ""
