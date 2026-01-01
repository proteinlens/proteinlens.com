# API Contracts: Public Meal Sharing

**Feature**: 017-shareable-meals-diets  
**Version**: 1.0.0

---

## GET /api/meals/{shareId}/public

Retrieve a public meal analysis by its share ID. No authentication required.

### Request

```http
GET /api/meals/abc12xyz/public HTTP/1.1
Host: api.proteinlens.com
Accept: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shareId | string | Yes | 10-character alphanumeric share ID |

### Response

#### 200 OK

```json
{
  "meal": {
    "shareId": "abc12xyz",
    "imageUrl": "https://proteinlensprod.blob.core.windows.net/meals/...[SAS token]",
    "totalProtein": 45.5,
    "confidence": "high",
    "proTip": "Great protein meal! Consider adding fiber-rich vegetables for better digestion.",
    "scannedAt": "2026-01-01T12:30:00Z",
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
    "dietStyle": {
      "name": "Ketogenic",
      "warnings": ["⚠️ High carbs: 35g exceeds 30g daily limit"]
    }
  },
  "meta": {
    "ogTitle": "Meal Analysis - ProteinLens",
    "ogDescription": "45g protein • Grilled Chicken Breast, Brown Rice",
    "ogImage": "https://proteinlensprod.blob.core.windows.net/meals/...[SAS token]"
  }
}
```

#### 404 Not Found

```json
{
  "error": "not_found",
  "message": "Meal not found or is private"
}
```

### Notes

- Returns meal regardless of owner authentication
- `imageUrl` includes time-limited SAS token (1 hour expiry)
- `dietStyle` only included if meal was scanned with a diet style
- `meta` section provides pre-computed Open Graph values for SSR

---

## PATCH /api/meals/{id}/privacy

Toggle the privacy setting for a meal. Requires authentication.

### Request

```http
PATCH /api/meals/123e4567-e89b-12d3-a456-426614174000/privacy HTTP/1.1
Host: api.proteinlens.com
Authorization: Bearer <token>
Content-Type: application/json

{
  "isPublic": false
}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Internal meal analysis ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isPublic | boolean | Yes | Whether meal is publicly shareable |

### Response

#### 200 OK

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "shareId": "abc12xyz",
  "isPublic": false,
  "shareUrl": null
}
```

#### 401 Unauthorized

```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

#### 403 Forbidden

```json
{
  "error": "forbidden",
  "message": "You do not own this meal"
}
```

### Notes

- `shareUrl` is null when `isPublic` is false
- When `isPublic` is true, `shareUrl` returns full URL: `https://www.proteinlens.com/meal/{shareId}`

---

## GET /meal/{shareId}

Server-rendered HTML page for social sharing. Returns full HTML with Open Graph tags.

### Request

```http
GET /meal/abc12xyz HTTP/1.1
Host: www.proteinlens.com
Accept: text/html
```

### Response

#### 200 OK

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meal Analysis - ProteinLens</title>
  
  <!-- Open Graph -->
  <meta property="og:title" content="Meal Analysis - ProteinLens" />
  <meta property="og:description" content="45g protein • Grilled Chicken Breast, Brown Rice" />
  <meta property="og:image" content="https://proteinlensprod.blob.core.windows.net/meals/...[SAS]" />
  <meta property="og:url" content="https://www.proteinlens.com/meal/abc12xyz" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="ProteinLens" />
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Meal Analysis - ProteinLens" />
  <meta name="twitter:description" content="45g protein • Grilled Chicken Breast, Brown Rice" />
  <meta name="twitter:image" content="https://proteinlensprod.blob.core.windows.net/meals/...[SAS]" />
  
  <!-- Hydration data -->
  <script>
    window.__MEAL_DATA__ = {
      "shareId": "abc12xyz",
      "totalProtein": 45.5,
      ...
    };
  </script>
</head>
<body>
  <div id="root">
    <!-- Server-rendered meal card for no-JS fallback -->
    <div class="meal-card">...</div>
  </div>
  <script type="module" src="/assets/main.js"></script>
</body>
</html>
```

#### 404 Not Found

Returns HTML page with "Meal not found" message and link to homepage.

### Notes

- This endpoint is handled by Azure Function for SSR
- Full React app hydrates on client for interactivity
- `window.__MEAL_DATA__` enables hydration without additional API call
