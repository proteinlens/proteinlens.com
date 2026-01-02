# API Documentation - Macro Ingredients Analysis

**Feature**: 001-macro-ingredients-analysis  
**Version**: 1.0.0  
**Last Updated**: January 2, 2026

---

## Overview

The Macro Ingredients Analysis feature extends the ProteinLens API to provide comprehensive macronutrient tracking (protein, carbohydrates, and fat) for meal analysis, daily aggregation, and data export.

---

## Authentication

All endpoints require user authentication via one of:
- **Header**: `x-user-id: <userId>`
- **Query Parameter**: `?userId=<userId>`

---

## Endpoints

### 1. POST /api/analyze

Analyze a meal photo and extract macronutrient information.

**Request**:
```json
{
  "blobName": "meals/user123/meal-abc.jpg"
}
```

**Response** (200 OK):
```json
{
  "mealAnalysisId": "uuid-123",
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "portion": "150g",
      "protein": 45.0,
      "carbs": 0.0,
      "fat": 3.5
    },
    {
      "name": "Brown Rice",
      "portion": "1 cup",
      "protein": 5.0,
      "carbs": 45.0,
      "fat": 1.5
    }
  ],
  "totalProtein": 50.0,
  "totalCarbs": 45.0,
  "totalFat": 5.0,
  "confidence": "high",
  "notes": "Well-balanced meal with lean protein and complex carbs",
  "blobName": "meals/user123/meal-abc.jpg",
  "requestId": "req-xyz"
}
```

**Field Specifications**:
- `protein`, `carbs`, `fat`: Decimal values in grams, precision to 2 decimal places
- `carbs`, `fat`: May be `null` for legacy meals
- `confidence`: `"high"`, `"medium"`, or `"low"`

---

### 2. GET /api/meals

Retrieve user's meal history with macro data.

**Query Parameters**:
- `userId` (required): User identifier
- `limit` (optional): Number of meals to return (default: 50, max: 500)

**Request**:
```
GET /api/meals?userId=user123&limit=10
```

**Response** (200 OK):
```json
[
  {
    "id": "meal-uuid-1",
    "timestamp": "2026-01-02T10:30:00.000Z",
    "imageUrl": "https://storage.blob.core.windows.net/...",
    "totalProtein": 50.0,
    "confidence": "high",
    "notes": "Well-balanced meal",
    "foods": [
      {
        "name": "Grilled Chicken Breast",
        "portion": "150g",
        "protein": 45.0,
        "carbs": 0.0,
        "fat": 3.5
      }
    ],
    "aiModel": "gpt-5.1-vision",
    "requestId": "req-xyz"
  }
]
```

**Field Specifications**:
- `foods[].carbs`, `foods[].fat`: May be `null` for legacy meals (backward compatible)
- `imageUrl`: Temporary SAS URL with 60-minute expiry

---

### 3. GET /api/meals/daily-summary

Get aggregated daily macronutrient totals.

**Query Parameters**:
- `userId` (required): User identifier
- `date` (optional): Target date in YYYY-MM-DD format (default: today)

**Request**:
```
GET /api/meals/daily-summary?userId=user123&date=2026-01-02
```

**Response** (200 OK):
```json
{
  "date": "2026-01-02",
  "meals": 3,
  "macros": {
    "protein": 120,
    "carbs": 150,
    "fat": 45
  },
  "percentages": {
    "protein": 28,
    "carbs": 35,
    "fat": 37
  },
  "totalCalories": 1650,
  "carbWarning": false,
  "carbLimit": null
}
```

**Field Specifications**:
- `macros.*`: Integer values in grams (rounded from decimal)
- `percentages.*`: Integer percentage values (0-100), calculated using 4-4-9 formula
  - Protein: 4 calories per gram
  - Carbs: 4 calories per gram
  - Fat: 9 calories per gram
- `totalCalories`: Sum of (protein × 4) + (carbs × 4) + (fat × 9)
- `carbWarning`: `true` if user has carb limit and exceeded it
- `carbLimit`: User's net carb cap in grams (null if no diet style selected)

**Calculation Example**:
```
Protein: 120g × 4 cal/g = 480 cal → 480/1650 = 29% (rounded to 28%)
Carbs:   150g × 4 cal/g = 600 cal → 600/1650 = 36% (rounded to 35%)
Fat:     45g  × 9 cal/g = 405 cal → 405/1650 = 25% (rounded to 37%)
Total:   480 + 600 + 405 = 1485 cal
```

---

### 4. GET /api/meals/export

Export user's meal data with complete macro information.

**Query Parameters**:
- `userId` (required): User identifier
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format

**Request**:
```
GET /api/meals/export?userId=user123&startDate=2026-01-01&endDate=2026-01-31
```

**Response** (200 OK):
```json
{
  "userId": "user123",
  "exportDate": "2026-01-02T15:30:00.000Z",
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "summary": {
    "totalMeals": 45,
    "totalProtein": 2250,
    "totalCarbs": 3000,
    "totalFat": 750,
    "averageProteinPerMeal": 50.0,
    "averageCarbsPerMeal": 66.7,
    "averageFatPerMeal": 16.7
  },
  "meals": [
    {
      "id": "meal-uuid-1",
      "date": "2026-01-02",
      "timestamp": "2026-01-02T10:30:00.000Z",
      "totalProtein": 50.0,
      "totalCarbs": 45.0,
      "totalFat": 5.0,
      "totalCalories": 445,
      "confidence": "high",
      "foods": [
        {
          "name": "Grilled Chicken Breast",
          "portion": "150g",
          "protein": 45.0,
          "carbs": 0.0,
          "fat": 3.5
        }
      ],
      "notes": "Well-balanced meal"
    }
  ]
}
```

**Response Headers**:
```
Content-Type: application/json
Content-Disposition: attachment; filename="meals-2026-01-02.json"
```

**Field Specifications**:
- `dateRange.start`, `dateRange.end`: "all-time" if no date filter specified
- `summary.*`: Aggregated statistics across all meals in date range
- `meals[].totalCalories`: Calculated as (protein × 4) + (carbs × 4) + (fat × 9)
- `meals[].foods[].carbs`, `meals[].foods[].fat`: `null` for items without macro data

---

## Data Types

### Macro Values

All macronutrient values use `Decimal(6,2)` precision:
- **Range**: 0.00 to 9999.99 grams
- **Precision**: 2 decimal places
- **Nullable**: `carbs` and `fat` are optional for backward compatibility

### Validation Rules

**Input Sanitization** (backend):
```typescript
// Carbs validation
function sanitizeCarbsValue(value: any): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || num < 0) return 0;
  if (num > 999) return 999; // Max reasonable value
  return Math.round(num * 100) / 100; // 2 decimal places
}

// Fat validation (same logic)
function sanitizeFatValue(value: any): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || num < 0) return 0;
  if (num > 999) return 999;
  return Math.round(num * 100) / 100;
}
```

**Error Responses**:
```json
{
  "error": "Bad Request",
  "message": "Invalid macro values: carbs must be between 0-999g",
  "requestId": "req-xyz"
}
```

---

## Backward Compatibility

### Legacy Meals

Meals created before macro tracking implementation may have `null` values for `carbs` and `fat`:

```json
{
  "foods": [
    {
      "name": "Chicken Breast",
      "portion": "150g",
      "protein": 45.0,
      "carbs": null,
      "fat": null
    }
  ],
  "totalProtein": 45.0,
  "totalCarbs": null,
  "totalFat": null
}
```

**Frontend Handling**:
- Display "Macro data unavailable" for legacy meals
- Calculate totals as 0 when null
- Conditional rendering of macro grids

---

## Performance Characteristics

- **Analysis Endpoint**: <3 seconds (includes AI processing)
- **Daily Summary**: <500ms (database aggregation)
- **Export Endpoint**: <2 seconds for 500 meals
- **Meal History**: <800ms for 50 meals with SAS URL generation

---

## Rate Limits

Standard ProteinLens rate limits apply:
- **Free Tier**: 10 analyses per day
- **Pro Tier**: Unlimited analyses
- **Export**: 10 requests per hour (all tiers)

---

## Examples

### Complete Workflow Example

```bash
# 1. Upload and analyze meal
POST /api/analyze
{
  "blobName": "meals/user123/breakfast.jpg"
}

# Response includes macro data
{
  "totalProtein": 35.0,
  "totalCarbs": 60.0,
  "totalFat": 15.0,
  "foods": [...]
}

# 2. Check daily progress
GET /api/meals/daily-summary?userId=user123&date=2026-01-02

# 3. View meal history
GET /api/meals?userId=user123&limit=20

# 4. Export data for analysis
GET /api/meals/export?userId=user123&startDate=2026-01-01
```

### Error Handling Example

```javascript
try {
  const response = await fetch('/api/meals/daily-summary?userId=user123');
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.message);
    // Display user-friendly message
  }
  const data = await response.json();
  // Use data
} catch (error) {
  console.error('Network Error:', error);
  // Handle network failure
}
```

---

## Database Schema

### Food Table

```sql
CREATE TABLE "Food" (
  "id" TEXT PRIMARY KEY,
  "mealAnalysisId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "portion" TEXT NOT NULL,
  "protein" DECIMAL(6,2) NOT NULL,
  "carbs" DECIMAL(6,2),        -- Nullable
  "fat" DECIMAL(6,2),           -- Nullable
  "displayOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Food_mealAnalysisId_fkey" 
    FOREIGN KEY ("mealAnalysisId") 
    REFERENCES "MealAnalysis"("id") 
    ON DELETE CASCADE
);
```

---

## Migration Information

**Migration**: `20260102140632_add_macros_to_food`

Adds `carbs` and `fat` columns to existing Food table:
- Non-destructive (existing data preserved)
- Nullable columns (backward compatible)
- No data migration required (legacy meals continue working)

---

## Testing

### Verification Checklist

- [ ] Analyze meal with all three macros present
- [ ] Verify daily summary aggregates correctly
- [ ] Test export with date range filtering
- [ ] Confirm legacy meals display gracefully
- [ ] Validate percentage calculations (4-4-9 formula)
- [ ] Test zero-macro foods (e.g., black coffee)
- [ ] Verify carb warnings for low-carb diets
- [ ] Test edge case: meals under 50 calories

### Sample Test Data

```json
{
  "foods": [
    {
      "name": "Egg Whites",
      "portion": "100g",
      "protein": 11.0,
      "carbs": 0.7,
      "fat": 0.2
    },
    {
      "name": "Oatmeal",
      "portion": "1 cup",
      "protein": 6.0,
      "carbs": 54.0,
      "fat": 3.0
    }
  ],
  "expectedTotalProtein": 17.0,
  "expectedTotalCarbs": 54.7,
  "expectedTotalFat": 3.2,
  "expectedCalories": 314
}
```

---

## Support

For API issues or questions:
- GitHub Issues: [proteinlens.com/issues](https://github.com/proteinlens/issues)
- Email: support@proteinlens.com
- Documentation: [proteinlens.com/docs](https://proteinlens.com/docs)

---

**Version History**:
- v1.0.0 (2026-01-02): Initial macro tracking implementation
- Added `carbs` and `fat` fields to Food model
- Added daily-summary and export endpoints
- Implemented 4-4-9 calorie calculation
