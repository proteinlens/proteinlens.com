# API Contracts: Meal Analysis Extension

**Feature**: 017-shareable-meals-diets  
**Version**: 1.0.0

---

## POST /api/analyze (Extended Response)

The existing analyze endpoint response is extended to include shareable URL and diet feedback.

### Response (Extended)

```json
{
  "mealAnalysisId": "123e4567-e89b-12d3-a456-426614174000",
  "shareId": "abc12xyz",
  "shareUrl": "https://www.proteinlens.com/meal/abc12xyz",
  "isPublic": true,
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "portion": "200g",
      "protein": 42.0
    },
    {
      "name": "Brown Rice",
      "portion": "150g",
      "protein": 3.5
    }
  ],
  "totalProtein": 45.5,
  "confidence": "high",
  "notes": "Great protein-rich meal! The chicken provides complete protein with all essential amino acids. Consider adding a side of leafy greens for additional micronutrients.",
  "dietFeedback": {
    "dietStyleName": "Ketogenic",
    "warnings": [
      "⚠️ High carbs: 35g exceeds your 30g daily limit"
    ],
    "tips": [
      "💡 Swap brown rice for cauliflower rice to stay keto-friendly"
    ]
  }
}
```

### New Fields

| Field | Type | Description |
|-------|------|-------------|
| shareId | string | 10-character alphanumeric share ID |
| shareUrl | string | Full shareable URL |
| isPublic | boolean | Whether meal is publicly shareable |
| dietFeedback | object \| null | Diet-specific feedback (null if user has no diet style) |
| dietFeedback.dietStyleName | string | Name of user's diet style |
| dietFeedback.warnings | string[] | Diet constraint violations |
| dietFeedback.tips | string[] | Diet-specific improvement suggestions |

### Notes

- `shareId` is generated at scan time using nanoid
- `shareUrl` is computed from shareId
- `dietFeedback` is populated based on user's diet style at scan time
- `notes` field now contains AI-generated Pro Tip (already existed, usage unchanged)

---

## GET /api/meals (Extended Response)

The meal history endpoint response is extended to include shareable info.

### Response (Extended)

```json
{
  "meals": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "shareId": "abc12xyz",
      "shareUrl": "https://www.proteinlens.com/meal/abc12xyz",
      "isPublic": true,
      "uploadedAt": "2026-01-01T12:30:00Z",
      "imageUrl": "https://proteinlensprod.blob.core.windows.net/meals/...[SAS]",
      "totalProtein": 45.5,
      "confidence": "high",
      "proTip": "Great protein-rich meal! The chicken provides complete protein...",
      "foods": [
        {
          "name": "Grilled Chicken Breast",
          "portion": "200g",
          "protein": 42.0
        }
      ],
      "dietStyleAtScan": {
        "slug": "ketogenic",
        "name": "Ketogenic"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 127
  }
}
```

### New Fields per Meal

| Field | Type | Description |
|-------|------|-------------|
| shareId | string | 10-character share ID |
| shareUrl | string \| null | Full URL if public, null if private |
| isPublic | boolean | Privacy status |
| proTip | string \| null | AI-generated pro tip (maps to `notes` field) |
| dietStyleAtScan | object \| null | Diet style snapshot at scan time |

### Notes

- `proTip` is the same as the `notes` field, renamed for clarity in API
- `shareUrl` is null when `isPublic` is false
- `dietStyleAtScan` shows historical diet, may differ from user's current diet

---

## GET /api/meals/{id} (Extended Response)

The meal detail endpoint response is extended.

### Response (Extended)

```json
{
  "meal": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "shareId": "abc12xyz",
    "shareUrl": "https://www.proteinlens.com/meal/abc12xyz",
    "isPublic": true,
    "userId": "user-uuid",
    "uploadedAt": "2026-01-01T12:30:00Z",
    "imageUrl": "https://proteinlensprod.blob.core.windows.net/meals/...[SAS]",
    "totalProtein": 45.5,
    "confidence": "high",
    "proTip": "Great protein-rich meal!...",
    "foods": [...],
    "aiModel": "gpt-5.1-vision",
    "dietStyleAtScan": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "slug": "ketogenic",
      "name": "Ketogenic",
      "netCarbCapG": 30,
      "fatTargetPercent": 70
    }
  }
}
```

### Notes

- Full diet style details included in single meal view
- Owner-only endpoint (requires auth, validates userId)
