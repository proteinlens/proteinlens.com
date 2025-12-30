#!/bin/bash
# Query meal user IDs from the database

set -e

RG="proteinlens-prod"
DB_SERVER="proteinlens-db-prod-1523"
DB_NAME="proteinlens"
DB_USER="pgadmin"
KV_NAME="proteinlens-kv-fzpkp4yb"

echo "=== Querying MealAnalysis user IDs ==="

# Generate new password
NEW_PASS="Pl$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)!"
echo "Generated new password"

# Update PostgreSQL password
echo "Updating PostgreSQL password..."
az postgres flexible-server update \
  --resource-group "$RG" \
  --name "$DB_SERVER" \
  --admin-password "$NEW_PASS" \
  --output none

echo "Updated PostgreSQL password"

# Update Key Vault
echo "Updating Key Vault..."
NEW_URL="postgresql://${DB_USER}:${NEW_PASS}@${DB_SERVER}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"
az keyvault set-policy --name proteinlens-kv-fzpkp4yb --upn luca@OpenEmpower.onmicrosoft.com --secret-permissions get list set delete
az keyvault secret set --vault-name "$KV_NAME" --name database-url --value "$NEW_URL" --output none
az keyvault secret set --vault-name "$KV_NAME" --name db-password --value "$NEW_PASS" --output none
echo "Updated Key Vault"

# Restart function app to pick up new credentials
echo "Restarting Function App..."
az functionapp restart --name proteinlens-api-prod --resource-group "$RG"
echo "Function App restarted"

# Wait a moment for DB to be ready
sleep 3

# Run query
echo ""
echo "=== Meal User IDs ==="
PGPASSWORD="$NEW_PASS" psql \
  -h "${DB_SERVER}.postgres.database.azure.com" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -c 'SELECT "userId", COUNT(*) as meal_count FROM "MealAnalysis" GROUP BY "userId" ORDER BY meal_count DESC;'

echo ""
echo "=== User accounts ==="
PGPASSWORD="$NEW_PASS" psql \
  -h "${DB_SERVER}.postgres.database.azure.com" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -c 'SELECT id, email, "firstName", "lastName" FROM "User";'

echo ""
echo "=== Done ==="
