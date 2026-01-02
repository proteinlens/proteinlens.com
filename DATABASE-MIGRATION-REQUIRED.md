# Meal Share Link 404 - Root Cause & Solution

## Problem Summary
New meals scanned in production (e.g., `6ap2ZsUH2N`) are getting 404 when trying to access the share link at `https://www.proteinlens.com/meal/6ap2ZsUH2N/public`.

**This means the meal data is NOT being saved to the production database.**

## Root Cause Analysis

### Likely Causes (in order of probability):

1. **⚠️ MOST LIKELY: Migrations not applied to production database**
   - The `shareId` and `isPublic` columns might not exist in production
   - Code tries to save these fields but database rejects them silently

2. **Database Connection Wrong**
   - Function app is connecting to wrong database (dev vs prod)

3. **Permissions Issue**
   - Service principal doesn't have write access to mealAnalysis table

4. **Transaction Issue**
   - Meal created but not committed/visible immediately

## Solution: Apply Migrations to Production

### Step 1: Connect to Production Database

```bash
# Get the database URL from Key Vault
az keyvault secret show --vault-name proteinlens-kv-fzpkp4yb \
  --name database-url --query value -o tsv
```

### Step 2: Apply Prisma Migrations

```bash
cd backend

# Set the production database URL
export DATABASE_URL="<paste-the-url-from-step-1>"

# Apply all pending migrations
npx prisma migrate deploy

# Verify the migration was applied
npx prisma db push
```

### Step 3: Verify Migrations Applied

```bash
# Check if tables have the required columns
npx prisma db execute --stdin <<'EOF'
SELECT column_name FROM information_schema.columns 
WHERE table_name='meal_analysis' 
AND column_name IN ('shareId', 'isPublic');
EOF
```

Should return:
```
shareId
isPublic
```

## Critical Migration Files

These MUST be applied in production:

| File | Change | Date |
|------|--------|------|
| `20260101_add_shareable_meals_diet_styles` | Adds `shareId`, `isPublic`, `dietStyleAtScanId` | Jan 1 |
| `20260102200423_fix_missing_shareid_and_public` | Ensures defaults, creates indices | Jan 2 |

## Testing After Migration

1. **Scan a new meal** in production
2. **Get the shareId** from the response
3. **Test the share URL:**
   ```bash
   curl https://api.proteinlens.com/api/meals/<shareId>/public
   # Should return 200 OK with meal data
   ```

## Verification Checklist

- [ ] Connected to production database
- [ ] Ran `npx prisma migrate deploy`
- [ ] No errors reported
- [ ] Verified `shareId` and `isPublic` columns exist
- [ ] Scanned a new meal
- [ ] Share URL returns 200 OK (not 404)
- [ ] Meal data displays correctly

## If Migrations Can't Be Applied Directly

**Alternative: Restart the function app** (this might reset issues):

```bash
az functionapp restart --resource-group proteinlens-prod \
  --name proteinlens-api-prod
```

Then scan a new meal and test.

## Long-term Fix: CI/CD Pipeline

Add to `azure-pipelines.yml`:

```yaml
- task: CmdLine@2
  displayName: 'Apply Prisma Migrations'
  inputs:
    script: |
      cd backend
      npx prisma migrate deploy
```

This ensures migrations are automatically applied on every deployment.

## Status

**Current Issues:**
- ❌ Meal `6ap2ZsUH2N` returns 404
- ❌ Previous meal `msTBQWZlI0` also 404
- ⚠️ Suggests database schema issue, not code issue

**Next Action:**
Apply Prisma migrations to production database

---

See also: [MEAL-SHARELINK-FIX.md](MEAL-SHARELINK-FIX.md) and [DEPLOY-DAILY-SUMMARY-FIX.md](DEPLOY-DAILY-SUMMARY-FIX.md)
