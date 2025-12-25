# Database Credentials Sync - Troubleshooting Checklist

## Quick Diagnostic Commands

Run these commands to understand the current state:

```bash
# 1. Check PostgreSQL server settings
az postgres flexible-server show \
  --resource-group proteinlens-prod \
  --name proteinlens-db-prod-1523 \
  --query "[name, administratorLogin, state, fullyQualifiedDomainName]" -o table

# 2. Check Key Vault secrets
az keyvault secret list \
  --vault-name proteinlens-kv-fzpkp4yb \
  --query "[].name" -o table

# 3. Check DATABASE-URL secret (redacted password)
az keyvault secret show \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name DATABASE-URL \
  --query "value" -o tsv | sed 's/:.*@/:***@/g'

# 4. Check Function App settings
az functionapp config appsettings list \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod \
  --query "[?name=='DATABASE_URL'].value" -o tsv

# 5. Check Function App status
az functionapp show \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod \
  --query "[name, state, hostNames[0]]" -o table

# 6. Test API health
curl -s "https://proteinlens-api-prod.azurewebsites.net/api/health" | jq .
```

## Issue: "Authentication failed against database server"

### Symptoms
- Error: `Authentication failed against database server at proteinlens-db-prod-1523.postgres.database.azure.com`
- Database connection fails even though API is running
- Usually happens right after a deployment

### Root Causes & Solutions

#### A. PostgreSQL password doesn't match Key Vault

**Check:**
```bash
# Extract password from Key Vault
KV_PASSWORD=$(az keyvault secret show \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name DATABASE-URL \
  --query value -o tsv | \
  sed 's/^postgresql:\/\/[^:]*:\([^@]*\)@.*/\1/')

echo "Password in Key Vault: $KV_PASSWORD"

# Try to manually connect (requires psql installed)
# If psql is not available, move to next fix
```

**Fix:**
```bash
# Update PostgreSQL password to match Key Vault
az postgres flexible-server update \
  --resource-group proteinlens-prod \
  --name proteinlens-db-prod-1523 \
  --admin-password "ProteinLens2025SecureDB"

# Restart Function App
az functionapp restart \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod

# Wait 60 seconds for restart
sleep 60

# Test
curl -X POST "https://proteinlens-api-prod.azurewebsites.net/api/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileSize":1000,"contentType":"image/jpeg"}'
```

#### B. Key Vault secret has wrong value

**Check:**
```bash
# Get full DATABASE-URL from Key Vault
az keyvault secret show \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name DATABASE-URL \
  --query value -o tsv
```

Should be in format: `postgresql://pgadmin:PASSWORD@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require`

**Fix:**
```bash
# Update Key Vault secret
az keyvault secret set \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name DATABASE-URL \
  --value "postgresql://pgadmin:ProteinLens2025SecureDB@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require"

# Also update the lowercase variant if it exists
az keyvault secret set \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name database-url \
  --value "postgresql://pgadmin:ProteinLens2025SecureDB@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require"

# Restart Function App
az functionapp restart \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod

sleep 60
curl -X POST "https://proteinlens-api-prod.azurewebsites.net/api/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileSize":1000,"contentType":"image/jpeg"}'
```

#### C. Multiple Key Vaults (common issue!)

Function App might be using a DIFFERENT Key Vault than you expect.

**Check:**
```bash
# Get Function App's DATABASE_URL setting
az functionapp config appsettings list \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod \
  --query "[?name=='DATABASE_URL']"

# Look for line like:
# "value": "@Microsoft.KeyVault(SecretUri=https://proteinlens-kv-XXXXXXXX.vault.azure.net/secrets/DATABASE-URL/)"

# Extract the Key Vault name from the SecretUri
# Example: proteinlens-kv-XXXXXXXX is the actual Key Vault being used
```

**List all Key Vaults:**
```bash
az keyvault list --resource-group proteinlens-prod --query "[].name" -o table
```

**Fix (if using wrong Key Vault):**
```bash
# Get the CORRECT key vault name
CORRECT_KV="proteinlens-kv-fzpkp4yb"  # Update if different

# Update the KEY_VAULT_NAME variable in pipeline to match

# Update Function App to point to correct Key Vault
az functionapp config appsettings set \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod \
  --settings "DATABASE_URL=@Microsoft.KeyVault(SecretUri=https://${CORRECT_KV}.vault.azure.net/secrets/DATABASE-URL/)"

# Update Key Vault secrets in the CORRECT vault
az keyvault secret set \
  --vault-name $CORRECT_KV \
  --name DATABASE-URL \
  --value "postgresql://pgadmin:ProteinLens2025SecureDB@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require"

# Restart
az functionapp restart \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod

sleep 60
curl -X POST "https://proteinlens-api-prod.azurewebsites.net/api/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileSize":1000,"contentType":"image/jpeg"}'
```

## Issue: "Pipeline SyncInfrastructure stage failing"

### Symptoms
- Build succeeds but SyncInfrastructure stage fails
- Error: "Variable not found" or "Access denied"

### Solutions

#### A. Missing or wrong pipeline variables

**Check:**
```bash
# View pipeline variables
az pipelines variable list --pipeline-name "proteinlens" 2>/dev/null || echo "Use Azure Pipelines UI"
```

**Fix:**
1. Go to **Azure Pipelines** → Your pipeline → **Edit**
2. Click **Variables** button
3. Verify all these exist:
   - AZURE_SUBSCRIPTION_ID
   - RESOURCE_GROUP_NAME
   - POSTGRES_SERVER_NAME
   - KEY_VAULT_NAME
   - FUNCTION_APP_NAME
   - POSTGRES_ADMIN_PASSWORD (marked as secret)

4. If missing any, click **+ New variable** and add them

#### B. Service principal lacks permissions

**Check:**
```bash
# Get current service principal
az account show --query user.name -o tsv

# Check role assignments
az role assignment list \
  --resource-group proteinlens-prod \
  --query "[].roleDefinitionName" -o table
```

Should see at least **Contributor**.

**Fix:**
```bash
# Grant Contributor role
az role assignment create \
  --role Contributor \
  --assignee "$(az account show --query user.name -o tsv)" \
  --resource-group proteinlens-prod

# Verify
az role assignment list \
  --resource-group proteinlens-prod \
  --include-inherited \
  --query "[].roleDefinitionName" -o table
```

## Issue: "Function App doesn't restart"

### Symptoms
- SyncInfrastructure completes but credentials aren't picked up
- API still returns database auth error after deployment

### Solutions

```bash
# 1. Manually restart
az functionapp restart \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod

# 2. Wait for restart (usually 30-60 seconds)
sleep 60

# 3. Verify it's running
az functionapp show \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod \
  --query "state" -o tsv

# Should show: Running

# 4. Check health
curl -s "https://proteinlens-api-prod.azurewebsites.net/api/health"

# Should show: {"status":"healthy",...}

# 5. Test database connection
curl -X POST "https://proteinlens-api-prod.azurewebsites.net/api/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileSize":1000,"contentType":"image/jpeg"}'

# Should NOT show authentication error
```

## Issue: "Database connection string malformed"

### Symptoms
- Errors like "invalid connection option" or "port must be integer"
- API crashes on startup

### Check & Fix

```bash
# Get the current DATABASE-URL
CURRENT_URL=$(az keyvault secret show \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name DATABASE-URL \
  --query value -o tsv)

echo "$CURRENT_URL"

# Verify format is exactly:
# postgresql://pgadmin:PASSWORD@HOST:5432/DATABASE?sslmode=require

# If malformed, fix it:
az keyvault secret set \
  --vault-name proteinlens-kv-fzpkp4yb \
  --name DATABASE-URL \
  --value "postgresql://pgadmin:ProteinLens2025SecureDB@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require"

# Restart
az functionapp restart \
  --name proteinlens-api-prod \
  --resource-group proteinlens-prod
```

## Automated Fix (Nuclear Option)

If you want to reset everything to a known good state:

```bash
#!/bin/bash
# save as: fix-credentials.sh
# run: bash fix-credentials.sh

set -e

RG="proteinlens-prod"
PG_SERVER="proteinlens-db-prod-1523"
KV="proteinlens-kv-fzpkp4yb"
FUNC_APP="proteinlens-api-prod"
PASSWORD="ProteinLens2025SecureDB"
POSTGRES_FQDN="proteinlens-db-prod-1523.postgres.database.azure.com"

echo "=== Resetting Database Credentials ==="

echo "1. Updating PostgreSQL password..."
az postgres flexible-server update \
  --resource-group $RG \
  --name $PG_SERVER \
  --admin-password "$PASSWORD"

echo "2. Updating Key Vault secrets..."
DB_URL="postgresql://pgadmin:${PASSWORD}@${POSTGRES_FQDN}:5432/proteinlens?sslmode=require"

az keyvault secret set --vault-name $KV --name DATABASE-URL --value "$DB_URL"
az keyvault secret set --vault-name $KV --name database-url --value "$DB_URL"
az keyvault secret set --vault-name $KV --name DATABASE_ADMIN_PASSWORD --value "$PASSWORD"
az keyvault secret set --vault-name $KV --name POSTGRES_PASSWORD --value "$PASSWORD"

echo "3. Restarting Function App..."
az functionapp stop --resource-group $RG --name $FUNC_APP
sleep 10
az functionapp start --resource-group $RG --name $FUNC_APP

echo "4. Waiting for restart (60 seconds)..."
sleep 60

echo "5. Testing..."
curl -s -X POST "https://${FUNC_APP}.azurewebsites.net/api/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileSize":1000,"contentType":"image/jpeg"}' | \
  jq . || echo "API not responding yet, may need more time"

echo "=== Done ==="
```

## Escalation Path

If none of the above work:

1. **Check Azure status:** https://status.azure.com/
2. **Check Function App logs:**
   ```bash
   az functionapp log download \
     --name proteinlens-api-prod \
     --resource-group proteinlens-prod \
     --log-file /tmp/logs.zip
   unzip -p /tmp/logs.zip | tail -100
   ```

3. **Open Azure Support ticket** with logs attached

## Prevention

To avoid this in the future:

1. ✅ Always run SyncInfrastructure stage before deployment (done automatically now)
2. ✅ Monitor Key Vault access logs for credential changes
3. ✅ Test credentials immediately after deployment
4. ✅ Keep PostgreSQL password simple but strong (no special regex chars if possible)
5. ✅ Document current credentials in a secure location (Azure Key Vault)
