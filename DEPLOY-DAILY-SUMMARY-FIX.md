# Deployment Instructions - Fixed Daily Summary Endpoint

## Current Status
✅ **Code is fixed locally and built successfully**
❌ **Not yet deployed to production**

## What Changed
- Removed duplicate `daily-summary.ts` endpoint
- Kept only `get-daily-summary.ts` (the correct implementation)
- Rebuilt backend successfully

## Deploy to Azure

### Option 1: Via Azure CLI (Recommended - Fastest)

```bash
# Login to Azure
az login

# Deploy only the backend
cd backend
func azure functionapp publish proteinlens-backend

# Verify deployment
curl https://api.proteinlens.com/api/meals/daily-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Option 2: Via Azure Portal
1. Go to https://portal.azure.com
2. Find your Function App: `proteinlens-backend`
3. Deployment Center → GitHub Actions
4. Trigger a new deployment or redeploy

### Option 3: Via Git Push (If CI/CD is set up)
```bash
# Commit and push changes
git add backend/src backend/dist
git commit -m "fix: Remove duplicate daily-summary endpoint, keep get-daily-summary"
git push origin main

# This should trigger Azure DevOps pipeline automatically
```

## Verify Deployment

After deployment, test the endpoint:

```bash
# Test the endpoint (should return 200 OK, not 404)
curl -v https://api.proteinlens.com/api/meals/daily-summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response:
# HTTP/1.1 200 OK
# {
#   "date": "2026-01-02",
#   "mealCount": 5,
#   "totalProtein": 150,
#   "totalCarbs": 200,
#   "totalFat": 75,
#   ...
# }
```

## Deployment Checklist

- [ ] Run `az login` and authenticate with Azure
- [ ] Navigate to `backend` directory
- [ ] Run `func azure functionapp publish proteinlens-backend`
- [ ] Wait for deployment to complete (2-3 minutes)
- [ ] Test endpoint with curl command above
- [ ] Verify response is 200 OK, not 404
- [ ] Check Azure Function App logs for any errors

## Troubleshooting

If still getting 404 after deployment:

1. **Check function name mapping:**
   ```bash
   az functionapp function list --resource-group YOUR_RG --name proteinlens-backend
   ```

2. **View function app logs:**
   ```bash
   az webapp log tail --resource-group YOUR_RG --name proteinlens-backend
   ```

3. **Check if app service restart is needed:**
   ```bash
   az functionapp restart --resource-group YOUR_RG --name proteinlens-backend
   ```

4. **Verify the route is correct:**
   - The file registers route: `meals/daily-summary`
   - Full URL: `https://api.proteinlens.com/api/meals/daily-summary`
   - Auth level: Uses `extractUserId` from quota middleware

## Files Changed
- ✅ Removed: `backend/src/functions/daily-summary.ts` (duplicate)
- ✅ Removed: `backend/dist/functions/daily-summary.js` (compiled duplicate)
- ✅ Kept: `backend/src/functions/get-daily-summary.ts` (main implementation)
- ✅ Built: `backend/dist/functions/get-daily-summary.js`
