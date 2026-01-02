# CRITICAL: Fix Database Connection String

## 🚨 Root Cause Found

The **function app is connecting to the WRONG database server!**

| Component | Database Server | Status |
|-----------|-----------------|--------|
| Local (backend) | `protein-lens-db.postgres.database.azure.com` | ❌ WRONG |
| Actual Production | `proteinlens-db-prod-1523.postgres.database.azure.com` | ✅ CORRECT |
| Function App | `protein-lens-db.postgres.database.azure.com` | ❌ WRONG |

**This is why meals aren't being found!** The scans are saving to one database, but we're querying another.

---

## Fix (Via Azure Portal)

### Step 1: Open Azure Portal
1. Go to https://portal.azure.com
2. Search for: **Key Vault**
3. Select: **proteinlens-kv-fzpkp4yb**

### Step 2: Update the Secret
1. Click **Secrets** (left sidebar)
2. Find: **database-url**
3. Click it to open
4. Click **New Version** button
5. Paste this value:
   ```
   postgresql://pgadmin:ProteinLens2025SecureDB@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require
   ```
6. Click **Create**

### Step 3: Restart Function App
1. Go to **Function Apps**
2. Select: **proteinlens-api-prod**
3. Click **Restart** button at top
4. Wait 2-3 minutes for restart

### Step 4: Test
Scan a new meal and verify the share link works:
```bash
curl https://api.proteinlens.com/api/meals/6ap2ZsUH2N/public
# Should return 200 OK (not 404)
```

---

## Why This Happened

1. You have **two database servers**:
   - `protein-lens-db` - old/dev database
   - `proteinlens-db-prod-1523` - new production database

2. The **function app is still pointing to the old one**

3. **New meals are being saved to the correct production database** (through the scan process)

4. But **the function app is querying the old database** (which doesn't have the new meals)

---

## After Fix

Once the Key Vault secret is updated and the function app restarts:

✅ All new meal scans will be saved correctly
✅ Share links will work
✅ Migrations will apply (the correct database has the schema)
✅ Daily summary endpoint will work
✅ Everything syncs properly

---

## Timeline

1. **Now**: Update Key Vault secret (Portal)
2. **Immediately**: Restart function app
3. **2-3 min**: Wait for restart to complete
4. **~5 min total**: Ready to test

## Quick Checklist

- [ ] Go to Azure Portal
- [ ] Open Key Vault: proteinlens-kv-fzpkp4yb
- [ ] Update secret "database-url" with correct value
- [ ] Restart function app: proteinlens-api-prod
- [ ] Wait for restart
- [ ] Scan a new meal
- [ ] Test share link
- [ ] Verify it works (200 OK, not 404)

---

## If You Need Direct Access

The correct DATABASE_URL is:
```
postgresql://pgadmin:ProteinLens2025SecureDB@proteinlens-db-prod-1523.postgres.database.azure.com:5432/proteinlens?sslmode=require
```

Current (wrong) DATABASE_URL:
```
postgresql://pgadmin:ProteinLens2025SecureDB@protein-lens-db.postgres.database.azure.com:5432/proteinlens?sslmode=require
```

**The difference:** `-1523` in the hostname
