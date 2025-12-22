#!/bin/bash

# Smoke test suite for ProteinLens deployment
# Validates: infra, backend API, frontend web

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FUNCTION_APP_URL="${FUNCTION_APP_URL:-https://proteinlens-api-prod.azurewebsites.net}"
STATIC_WEB_APP_URL="${STATIC_WEB_APP_URL:-https://proteinlens.azurestaticapps.net}"
MAX_RETRIES=5
RETRY_DELAY=3
TIMEOUT=30

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Utility functions
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
  ((TESTS_PASSED++))
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
  ((TESTS_FAILED++))
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_skip() {
  echo -e "${YELLOW}⊘  $1${NC}"
  ((TESTS_SKIPPED++))
}

# Check if URL is accessible
check_url_accessible() {
  local url=$1
  local name=$2
  local retry_count=0

  while [ $retry_count -lt $MAX_RETRIES ]; do
    log_info "Testing $name accessibility (attempt $((retry_count + 1))/$MAX_RETRIES)..."

    HTTP_CODE=$(curl -s -o /tmp/response_${RANDOM}.txt -w "%{http_code}" --connect-timeout 5 --max-time $TIMEOUT "$url")

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "302" ]; then
      log_success "$name is accessible (HTTP $HTTP_CODE)"
      return 0
    else
      log_warning "$name returned HTTP $HTTP_CODE"
    fi

    ((retry_count++))
    if [ $retry_count -lt $MAX_RETRIES ]; then
      echo "  Retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
    fi
  done

  log_error "$name is not accessible after $MAX_RETRIES attempts"
  return 1
}

# Check health endpoint
check_health_endpoint() {
  local url=$1
  local name=$2
  local retry_count=0

  while [ $retry_count -lt $MAX_RETRIES ]; do
    log_info "Checking $name health endpoint (attempt $((retry_count + 1))/$MAX_RETRIES)..."

    RESPONSE=$(curl -s --connect-timeout 5 --max-time $TIMEOUT "$url/api/health?deep=true" || echo "")

    if [ -z "$RESPONSE" ]; then
      log_warning "No response from health endpoint"
    else
      STATUS=$(echo "$RESPONSE" | jq -r '.status // "unknown"' 2>/dev/null)

      case "$STATUS" in
      healthy)
        log_success "$name health check passed: $STATUS"
        echo "  Response: $RESPONSE" | jq . 2>/dev/null || echo "  $RESPONSE"
        return 0
        ;;
      degraded)
        log_warning "$name health check degraded"
        echo "  Response: $RESPONSE" | jq . 2>/dev/null || echo "  $RESPONSE"
        return 0
        ;;
      unhealthy)
        log_error "$name health check failed: $STATUS"
        echo "  Response: $RESPONSE" | jq . 2>/dev/null || echo "  $RESPONSE"
        ;;
      *)
        log_warning "Unknown health status: $STATUS"
        ;;
      esac
    fi

    ((retry_count++))
    if [ $retry_count -lt $MAX_RETRIES ]; then
      echo "  Retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
    fi
  done

  log_error "$name health check failed after $MAX_RETRIES attempts"
  return 1
}

# Test API endpoints
test_api_endpoints() {
  log_info "Testing Backend API endpoints..."

  local endpoints=(
    "/api/health"
    "/api/health/liveness"
    "/api/health/readiness"
  )

  for endpoint in "${endpoints[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$FUNCTION_APP_URL$endpoint")

    if [ "$HTTP_CODE" = "200" ]; then
      log_success "Endpoint $endpoint is accessible"
    else
      log_error "Endpoint $endpoint returned HTTP $HTTP_CODE"
    fi
  done
}

# Test frontend accessibility
test_frontend() {
  log_info "Testing Frontend Web App..."

  HTTP_CODE=$(curl -s -o /tmp/frontend.html -w "%{http_code}" --connect-timeout 5 "$STATIC_WEB_APP_URL/")

  if [ "$HTTP_CODE" = "200" ]; then
    # Check if HTML contains expected content
    if grep -q "html\|head\|body" /tmp/frontend.html; then
      log_success "Frontend is accessible and returns valid HTML"
    else
      log_error "Frontend returned content that is not valid HTML"
    fi
  else
    log_error "Frontend returned HTTP $HTTP_CODE"
  fi
}

# Test end-to-end flow
test_end_to_end() {
  log_info "Testing end-to-end deployment flow..."

  # 1. API health check
  log_info "  1. Checking API health..."
  check_health_endpoint "$FUNCTION_APP_URL" "Backend API" || return 1

  # 2. Frontend accessibility
  log_info "  2. Checking frontend accessibility..."
  check_url_accessible "$STATIC_WEB_APP_URL" "Frontend" || return 1

  log_success "End-to-end flow is working"
  return 0
}

# Print summary
print_summary() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "         🧪 Smoke Test Summary"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
  echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
  echo -e "${YELLOW}⊘ Skipped: $TESTS_SKIPPED${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ $TESTS_FAILED -eq 0 ]; then
    log_success "All smoke tests passed! 🎉"
    return 0
  else
    log_error "Some tests failed. Check logs above."
    return 1
  fi
}

# Main test flow
main() {
  echo ""
  echo "╔════════════════════════════════════════════════╗"
  echo "║   ProteinLens Deployment Smoke Test Suite      ║"
  echo "╚════════════════════════════════════════════════╝"
  echo ""

  log_info "Configuration:"
  echo "  Backend API URL: $FUNCTION_APP_URL"
  echo "  Frontend URL: $STATIC_WEB_APP_URL"
  echo "  Max retries: $MAX_RETRIES"
  echo "  Retry delay: ${RETRY_DELAY}s"
  echo ""

  # Run tests
  log_info "Starting smoke tests..."
  echo ""

  log_info "=== Phase 1: Backend Infrastructure ==="
  check_url_accessible "$FUNCTION_APP_URL" "Backend API" && \
    test_api_endpoints && \
    check_health_endpoint "$FUNCTION_APP_URL" "Backend API"

  echo ""
  log_info "=== Phase 2: Frontend Deployment ==="
  test_frontend

  echo ""
  log_info "=== Phase 3: End-to-End Validation ==="
  test_end_to_end

  # Print results
  print_summary
}

# Run main function
main "$@"
exit $?
