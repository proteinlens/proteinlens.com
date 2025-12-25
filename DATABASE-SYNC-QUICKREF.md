# Database Credentials Sync - Quick Reference

## The Problem (Fixed)
- Every deployment broke the database connection
- PostgreSQL password, Key Vault secret, and Function App settings were out of sync
- Manual `az keyvault secret set` + restart needed after each push

## The Solution (Implemented)
A two-tier automatic sync system:
1. **Bicep Module** (`db-credentials-sync.bicep`) - Runs during infrastructure deployment
2. **Pipeline Stage** (`SyncInfrastructure`) - Runs before each app deployment

## What Happens Now
Every time you `git push origin main`:
```
Build & Test → Sync Credentials → Deploy → Smoke Tests → Done ✅
                (automatic)
```

## One-Time Setup Required

Set these Azure Pipeline variables:

| Variable | Value | Secret? |
|----------|-------|---------|
| AZURE_SUBSCRIPTION_ID | 15728494-f8c0-46c5-aea9-553e6c28e19c | No |
| RESOURCE_GROUP_NAME | proteinlens-prod | No |
| POSTGRES_SERVER_NAME | proteinlens-db-prod-1523 | No |
| KEY_VAULT_NAME | proteinlens-kv-fzpkp4yb | No |
| FUNCTION_APP_NAME | proteinlens-api-prod | No |
| POSTGRES_ADMIN_PASSWORD | ProteinLens2025SecureDB | **Yes** ✓ |

→ See [PIPELINE-VARIABLES-SETUP.md](./PIPELINE-VARIABLES-SETUP.md) for detailed instructions

## Manual Sync (If Needed)

```bash
# Run the sync script standalone
pwsh scripts/sync-db-credentials.ps1 \
  -SubscriptionId "15728494-f8c0-46c5-aea9-553e6c28e19c" \
  -ResourceGroupName "proteinlens-prod" \
  -PostgresServerName "proteinlens-db-prod-1523" \
  -KeyVaultName "proteinlens-kv-fzpkp4yb" \
  -DatabasePassword "ProteinLens2025SecureDB" \
  -FunctionAppName "proteinlens-api-prod" \
  -Verbose
```

## Verify It Works

```bash
# After deployment, test the API
curl -X POST "https://proteinlens-api-prod.azurewebsites.net/api/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileSize":1000,"contentType":"image/jpeg"}'

# Should return upload URL without database auth error
```

## Troubleshooting

**Issue:** SyncInfrastructure stage fails
- Check pipeline variables are set correctly
- See [PIPELINE-VARIABLES-SETUP.md](./PIPELINE-VARIABLES-SETUP.md)

**Issue:** API still returns "Authentication failed"
- Run manual sync script
- See [DATABASE-CREDENTIALS-TROUBLESHOOTING.md](./DATABASE-CREDENTIALS-TROUBLESHOOTING.md)

**Issue:** "Variable not found" error
- Add missing variables to Azure Pipelines
- Check [PIPELINE-VARIABLES-SETUP.md](./PIPELINE-VARIABLES-SETUP.md) for all required vars

## Files to Know

| File | Purpose |
|------|---------|
| `scripts/sync-db-credentials.ps1` | PowerShell script for sync (manual or pipeline use) |
| `infra/bicep/db-credentials-sync.bicep` | Bicep module (runs during infrastructure deploy) |
| `infra/azure-pipelines.yml` | Pipeline config (includes SyncInfrastructure stage) |
| `DATABASE-CREDENTIALS-SYNC.md` | Full architecture documentation |
| `PIPELINE-VARIABLES-SETUP.md` | Configuration guide |
| `DATABASE-CREDENTIALS-TROUBLESHOOTING.md` | Detailed troubleshooting |

## Key Points

✅ **Automatic** - No manual steps needed
✅ **Idempotent** - Safe to run multiple times
✅ **Redundant** - Double checks before deployment
✅ **Documented** - 3 comprehensive guides included
✅ **Recoverable** - Troubleshooting guide provided

## Success Criteria

After setup:
- [ ] Pipeline variables configured
- [ ] SyncInfrastructure stage appears in pipeline logs
- [ ] API returns successful response (no database errors)
- [ ] Can push multiple times without manual fixes

## Still Failing?

1. Check pipeline logs: **SyncInfrastructure** stage
2. Run manual sync: `pwsh scripts/sync-db-credentials.ps1 ...`
3. Check Key Vault: `az keyvault secret show --vault-name proteinlens-kv-fzpkp4yb --name DATABASE-URL`
4. See [DATABASE-CREDENTIALS-TROUBLESHOOTING.md](./DATABASE-CREDENTIALS-TROUBLESHOOTING.md)

---

**Implementation Status:** ✅ Complete
**Tested:** ✅ Yes (manual sync works)
**Ready for Production:** ✅ Yes (after variable setup)

Need help? Read the docs or check the troubleshooting guide!
