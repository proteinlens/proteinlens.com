# API Contracts: Diet Style Configuration

**Feature**: 017-shareable-meals-diets  
**Version**: 1.0.0

---

## GET /api/diet-styles

Retrieve all active diet styles for user selection. No authentication required.

### Request

```http
GET /api/diet-styles HTTP/1.1
Host: api.proteinlens.com
Accept: application/json
```

### Response

#### 200 OK

```json
{
  "dietStyles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "balanced",
      "name": "Balanced",
      "description": "Standard nutrition with no specific restrictions. Focus on overall protein goals.",
      "netCarbCapG": null,
      "fatTargetPercent": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "slug": "mediterranean",
      "name": "Mediterranean",
      "description": "Heart-healthy eating emphasizing olive oil, fish, whole grains, and vegetables.",
      "netCarbCapG": null,
      "fatTargetPercent": 35
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "slug": "low-carb",
      "name": "Low-Carb",
      "description": "Reduced carbohydrate intake while maintaining moderate protein.",
      "netCarbCapG": 100,
      "fatTargetPercent": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "slug": "ketogenic",
      "name": "Ketogenic",
      "description": "Very low carb, high fat diet to achieve ketosis.",
      "netCarbCapG": 30,
      "fatTargetPercent": 70
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "slug": "plant-based",
      "name": "Plant-Based",
      "description": "Nutrition from plant sources only.",
      "netCarbCapG": null,
      "fatTargetPercent": null
    }
  ]
}
```

### Notes

- Returns only active diet styles, ordered by `sortOrder`
- Publicly accessible (no auth) for unauthenticated Settings preview

---

## PATCH /api/me/diet-style

Update the authenticated user's diet style preference.

### Request

```http
PATCH /api/me/diet-style HTTP/1.1
Host: api.proteinlens.com
Authorization: Bearer <token>
Content-Type: application/json

{
  "dietStyleId": "550e8400-e29b-41d4-a716-446655440003"
}
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| dietStyleId | UUID \| null | Yes | Diet style ID, or null for Balanced (default) |

### Response

#### 200 OK

```json
{
  "dietStyleId": "550e8400-e29b-41d4-a716-446655440003",
  "dietStyle": {
    "slug": "ketogenic",
    "name": "Ketogenic",
    "netCarbCapG": 30,
    "fatTargetPercent": 70
  }
}
```

#### 400 Bad Request

```json
{
  "error": "invalid_diet_style",
  "message": "Diet style not found or inactive"
}
```

#### 401 Unauthorized

```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

### Notes

- Setting `dietStyleId` to `null` reverts to implicit Balanced (no record)
- Diet style is immediately effective for future meal scans
- Historical meals retain their original diet style snapshot

---

## GET /api/me

Extended to include diet style in user profile response.

### Response (Updated)

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "plan": "pro",
  "dietStyle": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "slug": "ketogenic",
    "name": "Ketogenic",
    "description": "Very low carb, high fat diet to achieve ketosis.",
    "netCarbCapG": 30,
    "fatTargetPercent": 70
  }
}
```

### Notes

- `dietStyle` is null if user has no preference (implicit Balanced)
- Included in existing `/api/me` response, no breaking change

---

## Admin Endpoints

### GET /api/admin/diet-styles

Retrieve all diet styles (including inactive) for admin management.

### Request

```http
GET /api/admin/diet-styles HTTP/1.1
Host: api.proteinlens.com
Authorization: Bearer <admin-token>
Accept: application/json
```

### Response

#### 200 OK

```json
{
  "dietStyles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "balanced",
      "name": "Balanced",
      "description": "Standard nutrition...",
      "netCarbCapG": null,
      "fatTargetPercent": null,
      "isActive": true,
      "sortOrder": 0,
      "userCount": 1523,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    },
    ...
  ]
}
```

### Notes

- Includes `isActive` and `userCount` for admin visibility
- Returns all diet styles regardless of active status

---

### POST /api/admin/diet-styles

Create a new diet style.

### Request

```http
POST /api/admin/diet-styles HTTP/1.1
Host: api.proteinlens.com
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "slug": "paleo",
  "name": "Paleo",
  "description": "Focus on whole foods that were available to our ancestors.",
  "netCarbCapG": 150,
  "fatTargetPercent": null,
  "isActive": true,
  "sortOrder": 5
}
```

### Response

#### 201 Created

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "slug": "paleo",
  "name": "Paleo",
  ...
}
```

#### 400 Bad Request

```json
{
  "error": "validation_error",
  "message": "Slug must be lowercase alphanumeric with hyphens only",
  "details": {
    "slug": ["Invalid format"]
  }
}
```

#### 409 Conflict

```json
{
  "error": "duplicate_slug",
  "message": "A diet style with slug 'paleo' already exists"
}
```

---

### PATCH /api/admin/diet-styles/{id}

Update an existing diet style.

### Request

```http
PATCH /api/admin/diet-styles/550e8400-e29b-41d4-a716-446655440003 HTTP/1.1
Host: api.proteinlens.com
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "netCarbCapG": 25
}
```

### Response

#### 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "slug": "ketogenic",
  "name": "Ketogenic",
  "netCarbCapG": 25,
  ...
}
```

### Notes

- Partial updates supported (only include fields to change)
- Changes are effective immediately for new scans
- Historical meal snapshots are not retroactively updated

---

### DELETE /api/admin/diet-styles/{id}

Soft-delete a diet style by setting `isActive` to false.

### Request

```http
DELETE /api/admin/diet-styles/550e8400-e29b-41d4-a716-446655440005 HTTP/1.1
Host: api.proteinlens.com
Authorization: Bearer <admin-token>
```

### Response

#### 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "isActive": false
}
```

### Notes

- Does not physically delete the record (preserves meal snapshots)
- Users with this diet style are not affected (their FK remains valid)
- Diet style is hidden from user selection after deletion
