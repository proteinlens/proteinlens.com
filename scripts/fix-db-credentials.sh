#!/bin/bash
set -e

#Add firewall rule for current IP
MY_IP=$(curl -s ifconfig.me) && echo "My IP: $MY_IP"
az postgres flexible-server firewall-rule create --resource-group proteinlens-prod --name proteinlens-db-prod-1523 --rule-name MyIP --start-ip-address $MY_IP --end-ip-address $MY_IP --only-show-errors

# Generate strong password
NEW_PASSWORD=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9!@#$%^&*' | head -c 24)

echo "🔐 Updating PostgreSQL admin password..."
az postgres flexible-server update \
  --resource-group proteinlens-prod \
  --name proteinlens-db-prod-1523 \
  --admin-password "$NEW_PASSWORD" \
  --output none

echo "✅ PostgreSQL password updated"

# Build DATABASE_URL connection string
DB_URL="postgresql://pgadmin:${NEW_PASSWORD}@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require"

echo "🔑 Updating Key Vault secret: database-url..."
az keyvault secret set \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name database-url \
  --value "$DB_URL" \
  --output none

DB_VAULT=$(az keyvault secret show --vault-name proteinlens-kv-fzpkp4yb --name database-url --query id -o tsv)
az functionapp show --name proteinlens-api-prod --resource-group proteinlens-prod --query "state" -o tsv
echo "✅ Key Vault secret updated"

echo "🔄 Updating Function App settings to refresh secret..."
az functionapp config appsettings set --name proteinlens-api-prod --resource-group proteinlens-prod --settings "SECRET_REFRESH=$(date +%s)" --only-show-errors -o none
az functionapp config appsettings set --name proteinlens-api-prod --resource-group proteinlens-prod --settings "DATABASE_URL=@Microsoft.KeyVault(SecretUri=$DB_VAULT)" --only-show-errors -o none

echo "🔄 Restarting Function App..."
az functionapp stop --name proteinlens-api-prod --resource-group proteinlens-prod --only-show-errors 
sleep 5
az functionapp start --name proteinlens-api-prod --resource-group proteinlens-prod --only-show-errors
echo "✅ Function App restarted"
echo ""
echo "🎉 Database credentials synchronized!"
echo "Waiting 15s for Function App to reload..."
sleep 15

echo "🧪 Testing auth endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.proteinlens.com/api/auth/check-email?email=test@example.com")

# Test database connection
echo $NEW_PASSWORD | psql -h proteinlens-db-prod-1523.postgres.database.azure.com -U pgadmin -d proteinlens -c "SELECT 1;"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Auth endpoint is working! (HTTP $HTTP_CODE)"
else
  echo "⚠️  Auth endpoint returned HTTP $HTTP_CODE"
fi
