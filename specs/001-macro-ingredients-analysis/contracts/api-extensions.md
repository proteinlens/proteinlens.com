# API Contracts: Macro Ingredients Analysis

**Feature**: Macro Ingredients Analysis  
**Phase**: 1 (Design & Contracts)  
**Date**: 2 January 2026

## Overview

This document specifies the API contract changes for macronutrient tracking. All changes are backward compatible - existing clients continue to work, new clients receive extended data.

---

## 1. POST /api/analyze

**Purpose**: Analyze uploaded meal photo and extract macronutrient data

**Changes**: Response includes carbs/fat data alongside protein

### Request (UNCHANGED)

```http
POST /api/analyze
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "blobName": "users/user-123/meals/meal-456.jpg"
}
```

### Response (EXTENDED)

**Status 200 - Success (New Meals)**:
```json
{
  "mealAnalysisId": "uuid",
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "portion": "150g",
      "protein": 45.0,
      "carbs": 0.0,
      "fat": 7.5
    },
    {
      "name": "Brown Rice",
      "portion": "1 cup cooked",
      "protein": 5.0,
      "carbs": 45.0,
      "fat": 1.5
    }
  ],
  "totalProtein": 50.0,
  "totalCarbs": 45.0,
  "totalFat": 9.0,
  "confidence": "high",
  "notes": "Well-balanced meal with lean protein and complex carbs"
}
```

**Field Specifications**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| foods[].protein | number | Yes | Protein in grams (1 decimal precision) |
| foods[].carbs | number | Yes | Carbohydrates in grams (1 decimal precision) |
| foods[].fat | number | Yes | Fat in grams (1 decimal precision) |
| totalProtein | number | Yes | Sum of all foods' protein |
| totalCarbs | number | Yes | Sum of all foods' carbs |
| totalFat | number | Yes | Sum of all foods' fat |
| confidence | enum | Yes | "high" \| "medium" \| "low" |

**Validation Rules**:
- Each macro value: 0.0 ≤ value ≤ 999.9
- Totals must equal sum of individual foods (±0.1g tolerance for rounding)
- At least 1 food item required

**Error Responses** (UNCHANGED):
- 400: Invalid blobName or validation failure
- 401: Missing/invalid auth token
- 404: Blob not found in storage
- 500: AI service unavailable or JSON parse error

---

## 2. GET /api/meals

**Purpose**: Retrieve user's meal history with macro data

**Changes**: Response includes carbs/fat for each meal

### Request (UNCHANGED)

```http
GET /api/meals?limit=10&daysBack=30
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `limit` (optional): Max meals to return (default: 20)
- `daysBack` (optional): Days of history (default: 30)

### Response (EXTENDED)

**Status 200 - Success**:
```json
{
  "meals": [
    {
      "id": "meal-uuid-1",
      "uploadedAt": "2026-01-02T12:30:00Z",
      "imageUrl": "https://storage.azure.com/.../meal-456.jpg",
      "totalProtein": 50.0,
      "totalCarbs": 45.0,
      "totalFat": 9.0,
      "totalCalories": 477,
      "confidence": "high",
      "foods": [
        {
          "id": "food-uuid-1",
          "name": "Grilled Chicken Breast",
          "portion": "150g",
          "protein": 45.0,
          "carbs": 0.0,
          "fat": 7.5
        },
        {
          "id": "food-uuid-2",
          "name": "Brown Rice",
          "portion": "1 cup cooked",
          "protein": 5.0,
          "carbs": 45.0,
          "fat": 1.5
        }
      ],
      "macroPercentages": {
        "protein": 42,
        "carbs": 38,
        "fat": 20
      }
    },
    {
      "id": "meal-uuid-legacy",
      "uploadedAt": "2025-12-15T10:00:00Z",
      "imageUrl": "https://storage.azure.com/.../old-meal.jpg",
      "totalProtein": 30.0,
      "totalCarbs": null,
      "totalFat": null,
      "totalCalories": null,
      "confidence": "medium",
      "foods": [
        {
          "id": "food-uuid-old",
          "name": "Protein Shake",
          "portion": "1 scoop",
          "protein": 30.0,
          "carbs": null,
          "fat": null
        }
      ],
      "macroPercentages": null
    }
  ]
}
```

**New Fields**:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| totalCarbs | number | Yes | Total carbs (null for legacy meals) |
| totalFat | number | Yes | Total fat (null for legacy meals) |
| totalCalories | number | Yes | Calculated calories (null if macros incomplete) |
| macroPercentages | object | Yes | % distribution (null if macros incomplete) |
| foods[].carbs | number | Yes | Carbs per food (null for legacy) |
| foods[].fat | number | Yes | Fat per food (null for legacy) |

**Legacy Meal Handling**:
- Pre-feature meals return null for carbs/fat
- Frontend displays "Macro data unavailable" message
- Protein data always present (backward compatibility)

---

## 3. PATCH /api/meals/:id

**Purpose**: Update meal with user corrections

**Changes**: Support editing carbs/fat alongside protein

### Request (EXTENDED)

```http
PATCH /api/meals/meal-uuid-1
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "foods": [
    {
      "id": "food-uuid-1",
      "name": "Grilled Chicken Breast",
      "portion": "150g",
      "protein": 45.0,
      "carbs": 0.0,
      "fat": 7.5
    },
    {
      "id": "food-uuid-2",
      "name": "Brown Rice",
      "portion": "1 cup cooked",
      "protein": 5.0,
      "carbs": 50.0,
      "fat": 1.5
    }
  ],
  "notes": "Corrected rice carbs - was larger portion"
}
```

**Request Body Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| foods | array | Yes | Complete list of foods (replaces existing) |
| foods[].id | string | No | Omit for new foods, include for edits |
| foods[].name | string | Yes | Food name (1-200 chars) |
| foods[].portion | string | Yes | Portion description (1-100 chars) |
| foods[].protein | number | Yes | Protein in grams (0-999.9) |
| foods[].carbs | number | Yes | Carbs in grams (0-999.9) |
| foods[].fat | number | Yes | Fat in grams (0-999.9) |
| notes | string | No | Optional user notes |

**Validation Rules**:
- At least 1 food required
- All macro values: 0.0 ≤ value ≤ 999.9
- Each value must have ≤ 1 decimal place
- Empty string not allowed for name/portion

### Response (EXTENDED)

**Status 200 - Success**:
```json
{
  "id": "meal-uuid-1",
  "totalProtein": 50.0,
  "totalCarbs": 50.0,
  "totalFat": 9.0,
  "totalCalories": 509,
  "foods": [
    {
      "id": "food-uuid-1",
      "name": "Grilled Chicken Breast",
      "portion": "150g",
      "protein": 45.0,
      "carbs": 0.0,
      "fat": 7.5,
      "isEdited": false
    },
    {
      "id": "food-uuid-2",
      "name": "Brown Rice",
      "portion": "1 cup cooked",
      "protein": 5.0,
      "carbs": 50.0,
      "fat": 1.5,
      "isEdited": true
    }
  ],
  "macroPercentages": {
    "protein": 39,
    "carbs": 39,
    "fat": 22
  }
}
```

**Error Responses**:
- 400: Validation error (invalid macro range, missing required field)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (user doesn't own this meal)
- 404: Meal not found

---

## 4. GET /api/meals/daily-summary

**Purpose**: Get aggregated macro totals by date

**NEW ENDPOINT** (extends existing daily summary logic)

### Request

```http
GET /api/meals/daily-summary?startDate=2026-01-01&endDate=2026-01-07
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `startDate` (optional): ISO date, default: 30 days ago
- `endDate` (optional): ISO date, default: today

### Response

**Status 200 - Success**:
```json
{
  "summaries": [
    {
      "date": "2026-01-02",
      "mealCount": 3,
      "totalProtein": 120.5,
      "totalCarbs": 150.0,
      "totalFat": 45.2,
      "totalCalories": 1471,
      "macroPercentages": {
        "protein": 33,
        "carbs": 41,
        "fat": 26
      },
      "mealsWithMacroData": 3,
      "incomplete": false
    },
    {
      "date": "2025-12-15",
      "mealCount": 2,
      "totalProtein": 80.0,
      "totalCarbs": 45.0,
      "totalFat": 15.0,
      "totalCalories": 605,
      "macroPercentages": {
        "protein": 53,
        "carbs": 30,
        "fat": 17
      },
      "mealsWithMacroData": 1,
      "incomplete": true
    }
  ]
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| date | string | ISO date (YYYY-MM-DD) |
| mealCount | number | Total meals logged on this date |
| totalProtein | number | Sum of all meals' protein |
| totalCarbs | number | Sum of meals with carbs data |
| totalFat | number | Sum of meals with fat data |
| totalCalories | number | Sum of individual meal calories |
| macroPercentages | object | % distribution if all meals have macros |
| mealsWithMacroData | number | Count of meals with complete macro data |
| incomplete | boolean | True if some meals lack carbs/fat |

**Incomplete Data Handling**:
- If `incomplete = true`, show warning: "Macro data incomplete (X of Y meals analyzed)"
- Totals represent sum of available data (not extrapolated)
- Percentages only shown if all meals have complete macros

---

## Backward Compatibility

### Client Compatibility Matrix

| Client Version | Backend Version | Behavior |
|----------------|-----------------|----------|
| Old | Old | ✅ Protein-only (no changes) |
| Old | New | ✅ Protein-only (ignores new fields) |
| New | Old | ❌ N/A (deploy backend first) |
| New | New | ✅ Full macro support |

### Migration Strategy

**Phase 1 - Backend Deploy**:
- Deploy backend with extended schemas
- Old frontend continues to work (ignores carbs/fat)
- New analyses populate macro data
- Legacy meals return null for macros

**Phase 2 - Frontend Deploy**:
- Deploy frontend with macro UI
- Gracefully handles null carbs/fat (shows "unavailable")
- Displays full macros for new analyses

**Phase 3 - Optional Backfill** (future):
- Re-analyze old meals using cached blob images
- Populate carbs/fat for legacy data
- Requires user consent (privacy consideration)

---

## Schema Versioning

**API Version**: No version bump required (additive-only changes)

**Schema Changelog**:
```
v1.0.0 (original)
  - POST /api/analyze: returns protein only
  - GET /api/meals: returns protein only

v1.1.0 (this feature - backward compatible)
  - POST /api/analyze: +carbs, +fat, +totalCarbs, +totalFat
  - GET /api/meals: +carbs, +fat, +totalCalories, +macroPercentages
  - PATCH /api/meals/:id: accepts carbs, fat in request
  - GET /api/meals/daily-summary: NEW endpoint
```

**Deprecation Policy**:
- No fields removed (100% backward compatible)
- Protein-only clients supported indefinitely
- Future: May require carbs/fat for new analyses (warn 6 months in advance)

---

## Testing Contracts

### Contract Tests (Vitest)

**Location**: `backend/tests/contract/`

**Test Cases**:
```typescript
describe('POST /api/analyze', () => {
  it('should include carbs and fat in response', async () => {
    const response = await analyzeRequest(mockBlobName);
    
    expect(response.foods[0]).toHaveProperty('carbs');
    expect(response.foods[0]).toHaveProperty('fat');
    expect(response).toHaveProperty('totalCarbs');
    expect(response).toHaveProperty('totalFat');
  });
  
  it('should validate macro values are within range', async () => {
    const invalidMacro = { protein: 1000, carbs: 0, fat: 0 };
    await expect(submitMacro(invalidMacro)).rejects.toThrow('exceeds maximum');
  });
});

describe('GET /api/meals', () => {
  it('should return null macros for legacy meals', async () => {
    const response = await getMeals({ includeLegacy: true });
    const legacyMeal = response.meals.find(m => m.id === 'legacy-id');
    
    expect(legacyMeal.totalCarbs).toBeNull();
    expect(legacyMeal.totalFat).toBeNull();
    expect(legacyMeal.totalProtein).toBeGreaterThan(0);
  });
});
```

---

## Summary

**Extended Endpoints**: 3
- POST /api/analyze (extended response)
- GET /api/meals (extended response)
- PATCH /api/meals/:id (extended request/response)

**New Endpoints**: 1
- GET /api/meals/daily-summary

**Backward Compatibility**: 100%
- All changes are additive (no breaking changes)
- Legacy meals return null for new fields
- Old clients ignore unknown fields

**Validation**: Enhanced
- Macro range checks (0-999.9g)
- Total consistency validation (sum of foods = meal total)
- Decimal precision enforcement (max 1 decimal place)

**Ready for**: Implementation (Phase 2 tasks generation)
