# Fixing Meal Share Link Issue

## Problem
The meal share link `https://www.proteinlens.com/meal/msTBQWZlI0` returns "Meal Not Found" (404).

## Root Cause
The meal with shareId `msTBQWZlI0` doesn't exist in the production database. This could be because:

1. **Migration not applied**: The database migrations (especially `20260102200423_fix_missing_shareid_and_public`) haven't been run in production
2. **Test meal**: The meal was created locally for testing and never made it to production
3. **Legacy data**: The meal was created before the `shareId` and `isPublic` columns were added

## Solution

### Step 1: Apply Database Migrations to Production

The migrations need to be run against the production database. You can do this via:

**Option A: Azure Portal Cloud Shell**
```bash
cd /path/to/backend
npx prisma migrate deploy
```

**Option B: Local with Production Connection**
```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgresql://username:password@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require"
cd backend
npx prisma migrate deploy
```

**Option C: Via Azure DevOps Pipeline**
Add a migration step to your deployment pipeline (recommended for future deployments).

### Step 2: Fix Existing Meals Missing shareIds

After migrations are applied, run the maintenance endpoint to fix any meals created before the shareId column:

```bash
# Get admin JWT token first
TOKEN="your-admin-jwt-token"

# Call the maintenance endpoint
curl -X POST https://api.proteinlens.com/api/admin/maintenance/regenerate-shareids \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Step 3: Scan a New Test Meal

Since the specific meal `msTBQWZlI0` doesn't exist, you should:

1. Go to https://www.proteinlens.com
2. Scan a new meal (or use the demo)
3. Get the new share URL from the result
4. Test that the share URL works

### Step 4: Verify the Fix

Test the new share URL:
```bash
# Should return meal data (200 OK)
curl -v https://api.proteinlens.com/api/meals/<NEW_SHARE_ID>/public
```

## Expected Behavior After Fix

1. **New meals**: All new meal scans should automatically get a `shareId` and `isPublic=true`
2. **Legacy meals**: The maintenance endpoint will generate shareIds for any meals missing them
3. **Share URLs**: URLs like `https://www.proteinlens.com/meal/<shareId>` should work for public meals

## Code Changes Already Deployed

✅ Backend:
- `mealService.ts` - Enhanced validation and auto-recovery for shareIds
- `public-meal.ts` - Aggressive caching (1 year) for shared meals
- Migration - Ensures `isPublic` defaults to `true` for NULL values
- Maintenance endpoint - Batch regenerate missing shareIds

✅ Frontend:
- `SharedMealPage.tsx` - Skeleton loading, image preload, DNS prefetch
- `usePublicMeal.ts` - React Query caching hooks
- Performance optimizations throughout

## Testing Checklist

- [ ] Database migrations applied to production
- [ ] Maintenance endpoint run to fix legacy meals  
- [ ] New meal scanned in production
- [ ] New share URL works and loads fast
- [ ] Cache headers set correctly (inspect in DevTools Network tab)
- [ ] Skeleton loading displays before meal data loads
- [ ] Social sharing preview works (Open Graph tags)

## Notes

- The meal `msTBQWZlI0` was likely created in a local/development database
- Production database needs the full migration history applied
- All future deployments should include migration steps
- Consider adding migration check to CI/CD pipeline
