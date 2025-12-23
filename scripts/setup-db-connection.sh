#!/bin/bash
# Setup database connection in Function App
# This script runs after PostgreSQL is provisioned

set -euo pipefail

RESOURCE_GROUP="${1:-proteinlens-prod-v2}"
FUNCTION_APP="${2:-proteinlens-api-prod}"
POSTGRES_SERVER="${3:-proteinlens-db-prod-east}"
POSTGRES_USER="${4:-pgadmin}"
POSTGRES_PASSWORD="${5:-}"
DATABASE_NAME="${6:-proteinlens}"

echo "📋 Setting up database connection in Function App..."
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Function App: $FUNCTION_APP"
echo "  PostgreSQL Server: $POSTGRES_SERVER"
echo ""

# Get PostgreSQL FQDN
echo "🔍 Getting PostgreSQL server details..."
POSTGRES_FQDN=$(az postgres flexible-server show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$POSTGRES_SERVER" \
  --query "fullyQualifiedDomainName" -o tsv)

if [ -z "$POSTGRES_FQDN" ]; then
  echo "❌ Could not find PostgreSQL server: $POSTGRES_SERVER"
  exit 1
fi

echo "✅ PostgreSQL FQDN: $POSTGRES_FQDN"

# Build database connection string for Node.js (prisma compatible)
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_FQDN}:5432/${DATABASE_NAME}?sslmode=require"

echo "🔐 Updating Function App configuration..."
az functionapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FUNCTION_APP" \
  --settings \
    "DATABASE_URL=$DATABASE_URL" \
    "POSTGRES_HOST=$POSTGRES_FQDN" \
    "POSTGRES_PORT=5432" \
    "POSTGRES_USER=$POSTGRES_USER" \
    "POSTGRES_DATABASE=$DATABASE_NAME" \
  --output none

echo "✅ Database connection configured"

# Run Prisma migrations
echo "🔄 Running database migrations..."
az functionapp deployment source config-zip \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FUNCTION_APP" \
  --src backend-deploy.zip \
  --output none 2>/dev/null || true

echo "✅ Setup complete!"
echo ""
echo "Connection details:"
echo "  Host: $POSTGRES_FQDN"
echo "  User: $POSTGRES_USER"
echo "  Database: $DATABASE_NAME"
echo "  Port: 5432"
