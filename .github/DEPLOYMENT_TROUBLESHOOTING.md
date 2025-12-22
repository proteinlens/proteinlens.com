# Deployment Troubleshooting Guide

This guide helps troubleshoot common issues encountered during ProteinLens deployment workflows.

## Workflow Failures

### Infrastructure Workflow (infra.yml) Failures

#### Error: "confirm_deploy does not equal 'deploy-infra'"

**Symptom**: Workflow stops at confirmation validation step
```
Error: confirm_deploy validation failed. Must set confirm_deploy=deploy-infra to proceed
```

**Root Cause**: Safety gate - requires explicit confirmation to deploy infrastructure

**Solution**:
```bash
# Run workflow with correct parameter:
gh workflow run infra.yml \
  -f environment=prod \
  -f confirm_deploy=deploy-infra
```

---

#### Error: "Bicep compilation failed"

**Symptom**: Error during `az bicep build` or `az deployment group create` step
```
InvalidTemplate | The template is invalid: Template validation failed: 
'[parameters('functionAppName')]' is not valid according to the template schema.
```

**Root Cause**: Invalid Bicep syntax, missing parameters, or circular dependencies

**Solution**:
1. Validate Bicep locally:
   ```bash
   cd infra
   az bicep build main.bicep --outfile main.json
   ```
2. Check parameter file syntax:
   ```bash
   jq . infra/parameters/prod.parameters.json  # Should be valid JSON
   ```
3. Review error message for specific line number and syntax issue
4. Common issues:
   - Missing required parameters in parameter file
   - Typos in variable references (check curly braces)
   - Module path incorrect or file doesn't exist
   - Circular dependencies between modules

---

#### Error: "ServicePrincipalNotFound" or "InvalidServicePrincipalId"

**Symptom**: Error granting Managed Identity access to Key Vault
```
No matching service principal found in directory for XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**Root Cause**: Service principal doesn't have permission to grant Key Vault access, or Managed Identity not properly created

**Solution**:
1. Verify service principal has "Owner" or "User Access Administrator" role on subscription:
   ```bash
   az role assignment list \
     --assignee $AZURE_CLIENT_ID \
     --output table
   ```
2. Wait 30 seconds after infrastructure deployment before granting access (propagation delay)
3. Verify Function App Managed Identity was created:
   ```bash
   az functionapp identity show \
     --resource-group proteinlens-prod \
     --name proteinlens-api-prod
   ```

---

#### Error: "Insufficient quota"

**Symptom**: Bicep deployment fails with quota error
```
The subscription does not have enough quota of compute resources in the 'eastus' region.
```

**Root Cause**: Azure subscription has reached resource limits for the region

**Solution**:
1. Check current usage:
   ```bash
   az resource list \
     --resource-group proteinlens-prod \
     --output table | wc -l
   ```
2. Delete unused resources:
   ```bash
   az group delete --name old-resource-group --yes
   ```
3. Request quota increase in Azure portal:
   - Go to "Help + Support" → "New Support Request"
   - Category: "Service and subscription limits (quotas)"
   - Select your region and resource type
4. Alternatively, try different region: `location=westus`

---

#### Error: "Key Vault access denied"

**Symptom**: Workflow fails when trying to access Key Vault
```
Operation failed with status: 'Forbidden'. Details: Activity ID: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**Root Cause**: Service principal doesn't have permission to create/read Key Vault secrets

**Solution**:
1. Verify service principal has Key Vault Administrator role:
   ```bash
   az role assignment create \
     --assignee $AZURE_CLIENT_ID \
     --role "Key Vault Administrator" \
     --scope /subscriptions/$AZURE_SUBSCRIPTION_ID
   ```
2. Or manually grant in Azure portal:
   - Key Vault → Access Control (IAM) → Add Role Assignment
   - Role: "Key Vault Administrator"
   - Select your service principal
3. Wait 30 seconds for propagation

---

### Backend Deployment Workflow (deploy-api.yml) Failures

#### Error: "npm ERR! code E401 Unauthorized"

**Symptom**: Build fails during `npm ci`
```
npm error code E401
npm error Unexpected end of JSON input while parsing near '...'
```

**Root Cause**: Missing or invalid npm authentication token for private packages

**Solution**:
1. Check if using private npm packages:
   ```bash
   grep "@" backend/package.json | grep "/"
   ```
2. If no private packages, clear npm cache:
   ```bash
   npm cache clean --force
   rm package-lock.json
   npm ci
   ```
3. If using private packages, configure token:
   ```bash
   npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN
   ```

---

#### Error: "TypeScript compilation failed"

**Symptom**: Build fails with TypeScript errors
```
backend/src/index.ts(10,5): error TS2322: Type 'string' is not assignable to type 'number'
```

**Root Cause**: TypeScript compilation errors in source code

**Solution**:
1. Run TypeScript locally:
   ```bash
   cd backend
   npm run build
   # Shows all errors with line numbers
   ```
2. Fix errors in IDE with TypeScript support (VS Code recommended)
3. Verify `tsconfig.json` is correct:
   ```bash
   cat backend/tsconfig.json | jq '.compilerOptions.strict'
   # Should be true for type safety
   ```

---

#### Error: "Health check failed: curl: (7) Failed to connect"

**Symptom**: Deployment completes but health check times out
```
Health check attempt 1/5 failed: curl: (7) Failed to connect to proteinlens-api-prod.azurewebsites.net:443
Waiting 5 seconds before retry...
```

**Root Cause**: Function App cold start (first deployment), network timeout, or health endpoint not responding

**Solution**:
1. Wait 30 seconds (cold start delay):
   ```bash
   sleep 30
   curl -v https://proteinlens-api-prod.azurewebsites.net/api/health
   ```
2. Check Function App status:
   ```bash
   az functionapp show \
     --resource-group proteinlens-prod \
     --name proteinlens-api-prod \
     --query "state"
   ```
3. View Function App logs:
   ```bash
   az functionapp log download \
     --resource-group proteinlens-prod \
     --name proteinlens-api-prod \
     --destination ~/function-logs.zip
   ```
4. Check health endpoint implementation:
   ```bash
   grep -A 10 "GET /api/health" backend/src/functions/health.ts
   ```
5. Verify environment variables set in Function App:
   ```bash
   az functionapp config appsettings list \
     --resource-group proteinlens-prod \
     --name proteinlens-api-prod
   ```

---

#### Error: "No such file or directory: .azure/functions/..."

**Symptom**: Azure Functions deployment fails
```
Error: ENOENT: no such file or directory, open '.azure/functions/proteinlens-api-prod'
```

**Root Cause**: Publish profile not found or wrong structure

**Solution**:
1. Regenerate publish profile:
   ```bash
   az functionapp deployment source config-zip \
     --resource-group proteinlens-prod \
     --name proteinlens-api-prod \
     --src-path ./backend/dist.zip
   ```
2. Or retrieve publish profile:
   ```bash
   az functionapp deployment list-publishing-profiles \
     --resource-group proteinlens-prod \
     --name proteinlens-api-prod \
     --output xml > publish-profile.xml
   ```
3. Store in GitHub Secrets as `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`

---

### Frontend Deployment Workflow (deploy-web.yml) Failures

#### Error: "Build size exceeds 300KB"

**Symptom**: Build passes but size validation fails
```
Build size: 350KB - EXCEEDS 300KB LIMIT
Build failed: Artifact size constraint violated
```

**Root Cause**: Frontend bundle too large (principle IX violation)

**Solution**:
1. Check what's in the bundle:
   ```bash
   cd frontend
   npm run build -- --report  # or --report-json
   # Shows which modules contribute most to size
   ```
2. Optimize bundle:
   - Remove unused dependencies: `npm ls` and `npm uninstall`
   - Use dynamic imports: `import { Module } from './module'` → `const Module = () => import('./module')`
   - Enable gzip in vite.config.ts
   - Consider Code splitting: `manualChunks` in Vite config
3. Check Vite config optimization:
   ```bash
   grep -A 5 "build:" frontend/vite.config.ts
   # Should have minify: 'terser' or esbuild
   ```

---

#### Error: "VITE_API_URL is undefined"

**Symptom**: Frontend deploys but API calls fail
```
Error: Cannot POST http://undefined/api/users
# Or error in console about missing VITE_API_URL
```

**Root Cause**: Environment variable not injected during build

**Solution**:
1. Check environment variable in build:
   ```bash
   echo $VITE_API_URL
   # Should output the API URL or 'undefined' if not set
   ```
2. Verify in frontend code:
   ```bash
   grep -r "VITE_API_URL\|import.meta.env" frontend/src
   # Should see const API_URL = import.meta.env.VITE_API_URL
   ```
3. Check workflow passes environment:
   ```bash
   grep "VITE_API_URL" .github/workflows/deploy-web.yml
   # Should see: VITE_API_URL=$API_URL npm run build --prefix frontend
   ```
4. Verify vite.config.ts doesn't override:
   ```bash
   cat frontend/vite.config.ts | grep -i env
   ```

---

#### Error: "Static Web App deployment timed out"

**Symptom**: Static Web Apps deploy step hangs or times out
```
Timeout waiting for Static Web App deployment
Total wait time: 10 minutes
```

**Root Cause**: Static Web Apps slow to provision, or deployment blocked

**Solution**:
1. Check SWA status:
   ```bash
   az staticwebapp show \
     --resource-group proteinlens-prod \
     --name proteinlens-web-prod
   ```
2. Check SWA deployment history:
   ```bash
   az staticwebapp deployment list \
     --resource-group proteinlens-prod \
     --name proteinlens-web-prod \
     --output table
   ```
3. Verify app is linked to Function App backend:
   ```bash
   az staticwebapp backend show \
     --resource-group proteinlens-prod \
     --name proteinlens-web-prod
   ```
4. Increase timeout in workflow (temporarily):
   ```yaml
   timeout-minutes: 20
   ```

---

#### Error: "Homepage accessibility check failed"

**Symptom**: Frontend deploys but smoke test fails
```
Failed to fetch homepage: HTTP 404
URL: https://proteinlens-web-prod.azurewebsites.net
```

**Root Cause**: Static Web App not yet healthy, or SPA routing not configured

**Solution**:
1. Check SPA routing in staticwebapp.config.json:
   ```json
   {
     "routes": [
       {
         "route": "/*",
         "allowedRoles": ["anonymous"],
         "serve": "/index.html",
         "statusCode": 200
       }
     ]
   }
   ```
2. Verify homepage loads:
   ```bash
   curl -v https://proteinlens-web-prod.azurewebsites.net
   # Should return 200 and HTML content
   ```
3. Check if Static Web App still building:
   ```bash
   az staticwebapp show \
     --resource-group proteinlens-prod \
     --name proteinlens-web-prod \
     --query "repositoryUrl,branch"
   ```
4. Manually trigger deployment if needed

---

## Database Connection Issues

#### Error: "FATAL: remaining connection slots are reserved"

**Symptom**: Database connection fails in health check
```
Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect...
```

**Root Cause**: PostgreSQL server not accessible, or connection pool exhausted

**Solution**:
1. Check PostgreSQL server status:
   ```bash
   az postgres flexible-server show \
     --resource-group proteinlens-prod \
     --server-name proteinlens-db-prod \
     --query "state"
   ```
2. Check firewall rule allows Azure services:
   ```bash
   az postgres flexible-server firewall-rule list \
     --resource-group proteinlens-prod \
     --server-name proteinlens-db-prod
   ```
3. Add firewall rule if needed:
   ```bash
   az postgres flexible-server firewall-rule create \
     --resource-group proteinlens-prod \
     --server-name proteinlens-db-prod \
     --start-ip-address 0.0.0.0 \
     --end-ip-address 255.255.255.255 \
     --name "AllowAllAzureServices"
   ```
4. Test connection directly:
   ```bash
   psql -h proteinlens-db-prod.postgres.database.azure.com \
     -U adminuser@proteinlens-db-prod \
     -d proteinlens \
     -c "SELECT 1"
   ```

---

#### Error: "SSL connection required"

**Symptom**: Database connection fails with SSL error
```
SSL connection required, but ssl option not specified
```

**Root Cause**: Connection string missing SSL parameter

**Solution**:
1. Update connection string to include `sslmode`:
   ```
   postgresql://user:pass@host:5432/db?sslmode=require
   ```
2. Or set in application code:
   ```typescript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }  // Unsafe, use for dev only
   });
   ```
3. For production, use:
   ```typescript
   ssl: {
     rejectUnauthorized: true,
     ca: readFileSync('/path/to/ca.crt', 'utf8')
   }
   ```

---

## Azure Key Vault Issues

#### Error: "Secret not found"

**Symptom**: Function App health check fails when accessing Key Vault
```
Unhandled Promise Rejection: SecretNotFound
Requested secret 'openai-api-key' not found in Key Vault
```

**Root Cause**: Secret not created in Key Vault, or wrong name

**Solution**:
1. List secrets in Key Vault:
   ```bash
   az keyvault secret list \
     --vault-name proteinlens-kv-prod \
     --output table
   ```
2. Check if required secrets exist:
   ```bash
   az keyvault secret show \
     --vault-name proteinlens-kv-prod \
     --name openai-api-key
   ```
3. Create missing secrets:
   ```bash
   az keyvault secret set \
     --vault-name proteinlens-kv-prod \
     --name openai-api-key \
     --value "sk-..."
   ```
4. Verify Function App can access:
   ```bash
   az keyvault secret show \
     --vault-name proteinlens-kv-prod \
     --name openai-api-key \
     --query "value"
   ```

---

#### Error: "The user, group, or application does not have the correct permissions"

**Symptom**: Function App can't read secrets from Key Vault
```
Operation: get
Key Vault Name: proteinlens-kv-prod
User: /subscriptions/.../providers/Microsoft.ManagedIdentity/userAssignedIdentities/proteinlens-api-prod
Status: Forbidden
```

**Root Cause**: Managed Identity doesn't have access to Key Vault

**Solution**:
1. Grant Managed Identity access:
   ```bash
   az keyvault set-policy \
     --vault-name proteinlens-kv-prod \
     --object-id $(az functionapp identity show \
       --resource-group proteinlens-prod \
       --name proteinlens-api-prod \
       --query principalId \
       --output tsv) \
     --secret-permissions get list
   ```
2. Or use Azure portal:
   - Key Vault → Access Control (IAM) → Add Role Assignment
   - Role: "Key Vault Secrets User"
   - Select Function App Managed Identity
3. Wait 30 seconds for permission propagation

---

## Rollback Procedures

### Rollback Failed Infrastructure Deployment

If infrastructure deployment fails and needs rollback:

```bash
# Option 1: Delete entire resource group (nuclear option)
az group delete \
  --resource-group proteinlens-prod \
  --yes \
  --no-wait

# Option 2: Delete specific resources (if partial deployment)
az functionapp delete \
  --resource-group proteinlens-prod \
  --name proteinlens-api-prod \
  --yes

az appconfig delete \
  --resource-group proteinlens-prod \
  --name proteinlens-web-prod \
  --yes
```

---

### Rollback Failed Backend Deployment

If backend deployment is bad, revert to previous version:

```bash
# List previous deployments
az functionapp deployment list \
  --resource-group proteinlens-prod \
  --name proteinlens-api-prod

# Activate previous deployment slot if using slots
az functionapp deployment slot swap \
  --resource-group proteinlens-prod \
  --name proteinlens-api-prod \
  --slot staging
```

---

### Rollback Failed Frontend Deployment

If frontend deployment is bad:

```bash
# View deployment history
az staticwebapp deployment list \
  --resource-group proteinlens-prod \
  --name proteinlens-web-prod

# Manually re-deploy last working build
git push origin main  # Triggers workflow again
```

---

## Monitoring & Debugging

### View Workflow Logs

```bash
# List recent workflow runs
gh run list --repo your-org/proteinlens.com

# View specific run logs
gh run view <run-id> --log

# Download full logs
gh run download <run-id> --dir ./logs
```

---

### Check Azure Resource Health

```bash
# Get overall health status
az resource health list \
  --resource-group proteinlens-prod \
  --output table

# Specific resource health
az resource health show \
  --resource-group proteinlens-prod \
  --resource-type "Microsoft.Web/sites" \
  --resource-name "proteinlens-api-prod"
```

---

### View Application Insights Logs

```bash
# Query Application Insights for errors
az monitor app-insights query \
  --app proteinlens-insights-prod \
  --resource-group proteinlens-prod \
  --analytics-query "exceptions | where timestamp > ago(1h)"
```

---

## Getting Help

If issues persist:

1. **Check GitHub Actions logs**:
   - Repository → Actions → Select workflow → Select run → View logs

2. **Check Azure Portal**:
   - View Resource Group → Check each resource status
   - Application Insights → Investigate failures
   - Key Vault → Access control and secret values

3. **Enable debug logging**:
   ```bash
   # Add to workflow for verbose output
   - name: Enable Actions Step Debug
     run: echo "ACTIONS_STEP_DEBUG=true" >> $GITHUB_ENV
   ```

4. **Contact support**:
   - Azure Support: https://support.microsoft.com/azure
   - GitHub Support: https://support.github.com
   - Include: error message, logs, resource names (sanitized)
