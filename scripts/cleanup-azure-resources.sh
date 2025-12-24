#!/bin/bash
# Cleanup script for unused Azure resources in proteinlens-prod resource group
# Run this script to delete duplicate Key Vaults, Application Insights, and related resources
# 
# WARNING: Review the resources before running! This will permanently delete them.

set -e

RESOURCE_GROUP="proteinlens-prod"

echo "🧹 Azure Resource Cleanup Script for $RESOURCE_GROUP"
echo "=================================================="
echo ""

# Check if logged in
if ! az account show &>/dev/null; then
    echo "❌ Not logged in to Azure. Run: az login"
    exit 1
fi

echo "📋 Current subscription:"
az account show --query "{Name:name, ID:id}" -o table
echo ""

# Function to delete resources with confirmation
delete_resources() {
    local resource_type=$1
    local name_pattern=$2
    shift 2
    local resource_ids=("$@")
    
    if [ ${#resource_ids[@]} -eq 0 ]; then
        echo "✅ No $resource_type to delete matching pattern: $name_pattern"
        return
    fi
    
    echo "🗑️  Found ${#resource_ids[@]} $resource_type to delete:"
    for id in "${resource_ids[@]}"; do
        echo "   - $(basename $id)"
    done
    echo ""
}

# ============================================================================
# 1. Delete duplicate Key Vaults (keep only the one currently in use)
# ============================================================================
echo "🔐 Checking Key Vaults..."

# These are the duplicate Key Vaults to delete (keep proteinlens-kv-y4bxfzhg or whichever is current)
DUPLICATE_KEY_VAULTS=(
    "proteinlens-kv-2hr544no"
    "proteinlens-kv-2i6p4wca"
    "proteinlens-kv-46viktwl"
    "proteinlens-kv-5blartxw"
    "proteinlens-kv-7thhebwm"
    "proteinlens-kv-bamdqoq4"
    "proteinlens-kv-bgjqbwmm"
    "proteinlens-kv-egckswwi"
    "proteinlens-kv-fzpkp4yb"
    "proteinlens-kv-gi2gvcaf"
    "proteinlens-kv-kpygfr37"
    "proteinlens-kv-mvqqu4lj"
    "proteinlens-kv-o3bnjrlm"
    "proteinlens-kv-r7cd2txe"
    "proteinlens-kv-snod5mbv"
    "proteinlens-kv-tsdl2xx6"
    "proteinlens-kv-ujgzyqx3"
    "proteinlens-kv-xbkznrxy"
)
# Note: Keep proteinlens-kv-y4bxfzhg (the last one, likely currently in use)

echo "🗑️  Will delete ${#DUPLICATE_KEY_VAULTS[@]} duplicate Key Vaults"
echo ""

# ============================================================================
# 2. Delete duplicate Application Insights
# ============================================================================
echo "📊 Checking Application Insights..."

DUPLICATE_APP_INSIGHTS=(
    "proteinlens-api-prod202512241934"
    "proteinlens-api-prod202512242059"
    "proteinlens-api-prod202512242147"
    "proteinlens-api-prod202512242257"
)
# Note: Keep proteinlens-api-prod (the main one without timestamp)

echo "🗑️  Will delete ${#DUPLICATE_APP_INSIGHTS[@]} duplicate Application Insights"
echo ""

# ============================================================================
# 3. Delete Smart Detector Alert Rules (associated with duplicate App Insights)
# ============================================================================
echo "🚨 Checking Smart Detector Alert Rules..."

DUPLICATE_ALERTS=(
    "Failure Anomalies - proteinlens-api-prod202512241934"
    "Failure Anomalies - proteinlens-api-prod202512242059"
    "Failure Anomalies - proteinlens-api-prod202512242147"
    "Failure Anomalies - proteinlens-api-prod202512242257"
)

echo "🗑️  Will delete ${#DUPLICATE_ALERTS[@]} duplicate Smart Detector Alert Rules"
echo ""

# ============================================================================
# EXECUTION
# ============================================================================
echo "=================================================="
echo "⚠️  WARNING: This will PERMANENTLY delete resources!"
echo "=================================================="
read -p "Do you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Aborted by user"
    exit 0
fi

echo ""
echo "🚀 Starting cleanup..."
echo ""

# Delete Smart Detector Alert Rules first (they depend on App Insights)
echo "📍 Deleting Smart Detector Alert Rules..."
for alert in "${DUPLICATE_ALERTS[@]}"; do
    echo "   Deleting: $alert"
    az monitor smart-detector alert-rule delete \
        --name "$alert" \
        --resource-group "$RESOURCE_GROUP" \
        --yes 2>/dev/null || echo "   ⚠️  Could not delete $alert (may not exist or different name format)"
done
echo ""

# Delete duplicate Application Insights
echo "📍 Deleting duplicate Application Insights..."
for appinsights in "${DUPLICATE_APP_INSIGHTS[@]}"; do
    echo "   Deleting: $appinsights"
    az monitor app-insights component delete \
        --app "$appinsights" \
        --resource-group "$RESOURCE_GROUP" \
        --yes 2>/dev/null || echo "   ⚠️  Could not delete $appinsights"
done
echo ""

# Delete duplicate Key Vaults
echo "📍 Deleting duplicate Key Vaults..."
for kv in "${DUPLICATE_KEY_VAULTS[@]}"; do
    echo "   Deleting: $kv"
    az keyvault delete \
        --name "$kv" \
        --resource-group "$RESOURCE_GROUP" 2>/dev/null || echo "   ⚠️  Could not delete $kv"
done
echo ""

# Purge deleted Key Vaults (they go to soft-delete state first)
echo "📍 Purging soft-deleted Key Vaults..."
for kv in "${DUPLICATE_KEY_VAULTS[@]}"; do
    echo "   Purging: $kv"
    az keyvault purge \
        --name "$kv" 2>/dev/null || echo "   ⚠️  Could not purge $kv (may not be in deleted state)"
done
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "📋 Remaining resources to verify:"
echo "   - Key Vault: proteinlens-kv-y4bxfzhg (keep this one)"
echo "   - Application Insights: proteinlens-api-prod (keep this one)"
echo "   - Function App: proteinlens-api-prod"
echo "   - Static Web App: proteinlens-web-prod"
echo "   - PostgreSQL: proteinlens-db-prod-1523"
echo "   - Storage: plprod1523"
echo ""
echo "Run this to verify:"
echo "   az resource list --resource-group $RESOURCE_GROUP --output table"
