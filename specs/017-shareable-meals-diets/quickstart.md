# Quickstart: Shareable Meal Scans & Diet Style Profiles

**Feature**: 017-shareable-meals-diets  
**Last Updated**: 2026-01-01

## Overview

This feature adds:
1. **Shareable meal URLs** - Every meal scan gets a unique, shareable URL with social media preview
2. **Pro Tip persistence** - AI-generated tips are stored and shown in meal history
3. **Diet style profiles** - Users can select a diet style (Keto, Mediterranean, etc.) for personalized feedback
4. **Admin diet config** - Admins can edit diet parameters without code deployment

---

## Quick Test Flows

### 1. Share a Meal (User Flow)

```bash
# 1. Scan a meal (auth required)
POST /api/analyze
# Response includes:
# - shareId: "abc12xyz"
# - shareUrl: "https://www.proteinlens.com/meal/abc12xyz"

# 2. Share the URL on social media
# Recipients see the meal image and protein stats in preview

# 3. View shared meal (no auth)
GET /meal/abc12xyz
# Returns full HTML with OG tags for social preview
```

### 2. Toggle Meal Privacy (User Flow)

```bash
# Make a meal private
PATCH /api/meals/{id}/privacy
{ "isPublic": false }

# Private meals return 404 for non-owners
GET /meal/abc12xyz
# Returns: 404 "Meal not found or is private"
```

### 3. Change Diet Style (User Flow)

```bash
# List available diet styles
GET /api/diet-styles

# Set user's diet style to Ketogenic
PATCH /api/me/diet-style
{ "dietStyleId": "550e8400-e29b-41d4-a716-446655440003" }

# Next meal scan includes diet feedback
POST /api/analyze
# Response includes:
# - dietFeedback.warnings: ["⚠️ High carbs: 35g exceeds 30g limit"]
```

### 4. Admin Diet Configuration

```bash
# List all diet styles (admin)
GET /api/admin/diet-styles

# Update keto carb cap
PATCH /api/admin/diet-styles/{id}
{ "netCarbCapG": 25 }

# Changes effective immediately for new scans
```

---

## Key Files

### Backend

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | DietStyle model, MealAnalysis extensions |
| `backend/src/functions/public-meal.ts` | SSR endpoint for /meal/:shareId |
| `backend/src/functions/diet-styles.ts` | Diet style CRUD endpoints |
| `backend/src/services/dietService.ts` | Diet style business logic |
| `backend/src/services/mealService.ts` | Extended with shareId generation |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/pages/SharedMealPage.tsx` | Public meal view |
| `frontend/src/pages/Settings.tsx` | Diet style selector |
| `frontend/src/components/history/MealCard.tsx` | Pro Tip display, share button |
| `frontend/src/components/meal/ShareButton.tsx` | Copy share URL |

### Admin

| File | Purpose |
|------|---------|
| `admin/src/pages/DietConfigPage.tsx` | Diet style management |
| `admin/src/components/DietStyleForm.tsx` | Diet style edit form |

---

## Database Migration

```bash
# Generate migration
cd backend
npx prisma migrate dev --name add_shareable_meals_diet_styles

# Run seed for default diet styles
npx prisma db seed
```

---

## Environment Variables

No new environment variables required. Feature uses existing:
- `AZURE_STORAGE_*` - Blob storage for meal images
- `DATABASE_URL` - PostgreSQL connection
- `FRONTEND_URL` - Base URL for share links

---

## Testing Checklist

### Unit Tests

- [ ] shareId generation (unique, 10 chars, alphanumeric)
- [ ] DietStyle validation (slug format, carb cap >= 0)
- [ ] Privacy toggle (owner only)
- [ ] Diet feedback calculation

### Integration Tests

- [ ] GET /meal/:shareId returns OG tags
- [ ] Private meals return 404 to non-owners
- [ ] Diet style updates immediately affect new scans
- [ ] Admin diet changes are effective without restart

### E2E Tests

- [ ] Scan meal → share URL → view in incognito
- [ ] Social preview renders on Twitter card validator
- [ ] Toggle privacy → verify 404 → re-enable → verify accessible
- [ ] Change diet → scan → see diet feedback

---

## Common Issues

### Issue: Share URL returns 404
**Cause**: Meal was set to private, or shareId doesn't exist
**Fix**: Check `isPublic` flag, verify shareId format

### Issue: OG tags not showing in social preview
**Cause**: Social crawler cached old version
**Fix**: Use Twitter Card Validator or Facebook Debugger to refresh cache

### Issue: Diet feedback not appearing
**Cause**: User has no diet style set (null = Balanced, no warnings)
**Fix**: Set a diet style in Settings first

### Issue: Pro Tip missing in history
**Cause**: Older meals scanned before this feature
**Fix**: Pro Tips only available for meals scanned after feature deployment

---

## API Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/meal/:shareId` | GET | No | SSR meal page with OG tags |
| `/api/meals/:shareId/public` | GET | No | Public meal JSON |
| `/api/meals/:id/privacy` | PATCH | Yes | Toggle meal privacy |
| `/api/diet-styles` | GET | No | List active diet styles |
| `/api/me/diet-style` | PATCH | Yes | Set user diet style |
| `/api/admin/diet-styles` | GET | Admin | List all diet styles |
| `/api/admin/diet-styles` | POST | Admin | Create diet style |
| `/api/admin/diet-styles/:id` | PATCH | Admin | Update diet style |
| `/api/admin/diet-styles/:id` | DELETE | Admin | Deactivate diet style |
