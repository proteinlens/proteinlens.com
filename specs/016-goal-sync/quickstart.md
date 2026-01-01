# Quickstart: Goal Sync Between Calculator and Settings

**Feature**: 016-goal-sync  
**Date**: 2025-12-31

## What This Feature Does

Ensures that when a user saves their protein goal in the Protein Calculator page, that same goal appears in the Settings page (and vice versa).

## Key Files Modified

| File | Purpose |
|------|---------|
| `frontend/src/hooks/useProteinCalculator.ts` | Calculator state management - reset hasServerProfile on form changes |
| `frontend/src/hooks/useGoal.ts` | Goal retrieval - read from protein profile sources |

## Quick Test

1. **Login** to the app
2. Go to **Protein Calculator** (`/protein-calculator`)
3. Change any form value (e.g., set Goal to "Lose Weight")
4. Click **"Calculate My Protein Target"**
5. Verify button shows **"Save to My Profile"** (not "✓ Saved")
6. Click **"Save to My Profile"**
7. Verify button changes to **"✓ Saved to your profile"**
8. Navigate to **Settings** (`/settings`)
9. Verify the Daily Protein Goal matches what you saved

## How It Works

### Before (Bug)
```
Calculator loads → hasServerProfile=true → Button shows "✓ Saved"
User changes goal → hasServerProfile still true → Button still shows "✓ Saved" ❌
```

### After (Fix)
```
Calculator loads → hasServerProfile=true → Button shows "✓ Saved"
User changes goal → hasServerProfile=false → Button shows "Save to My Profile" ✅
User saves → hasServerProfile=true → Button shows "✓ Saved" ✅
```

## Local Development

```bash
# Start backend
cd backend && npm run dev

# Start frontend (separate terminal)
cd frontend && npm run dev

# Run tests
cd frontend && npm test
```

## Related Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/protein/profile` | GET | Fetch user's saved protein profile |
| `/api/protein/profile` | POST | Save protein profile |
| `/api/protein/calculate` | POST | Calculate protein target (doesn't save) |
