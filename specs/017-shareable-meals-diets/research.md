# Research: Shareable Meal Scans & Diet Style Profiles

**Feature**: 017-shareable-meals-diets  
**Date**: 2026-01-01  
**Status**: Complete

## Overview

Research findings for implementing shareable meal URLs with Open Graph tags, Pro Tip persistence, and diet style profiles.

---

## 1. Short URL ID Generation

### Decision: nanoid with custom alphabet

**Chosen approach**: Use `nanoid` library with URL-safe alphabet (21 chars → 8-12 char IDs)

```typescript
import { customAlphabet } from 'nanoid';
const generateShareId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
```

**Rationale**:
- 62^10 = 839 quadrillion combinations (collision-proof at scale)
- URL-safe by design (no encoding issues)
- Human-readable and typeable
- Lightweight (~108 bytes minified)
- Already used in similar production systems (Notion, Vercel)

**Alternatives considered**:
- **UUID (rejected)**: Too long (36 chars), ugly in URLs, not human-friendly
- **hashids (rejected)**: Reversible encoding reveals internal IDs (security concern)
- **base62 encode of auto-increment (rejected)**: Sequential IDs are guessable, privacy issue
- **crypto.randomBytes (rejected)**: Requires manual base62 encoding, more complex

**Collision handling**: Generate → check DB → retry (max 3) → fail with unique constraint fallback

---

## 2. Open Graph Meta Tag Implementation

### Decision: Server-side rendering for /meal/:shareId routes

**Chosen approach**: Azure Function with HTML template rendering

**Implementation**:
```
GET /meal/:shareId → Azure Function renders HTML with OG tags → returns full page
```

**OG tags required**:
```html
<meta property="og:title" content="Meal Analysis - ProteinLens" />
<meta property="og:description" content="45g protein • Grilled chicken, rice, vegetables" />
<meta property="og:image" content="https://[storage].blob.core.windows.net/meals/[blobName]?[SAS]" />
<meta property="og:url" content="https://www.proteinlens.com/meal/abc12xyz" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="ProteinLens" />
<!-- Twitter cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Meal Analysis - ProteinLens" />
<meta name="twitter:description" content="45g protein • Grilled chicken, rice, vegetables" />
<meta name="twitter:image" content="https://[storage].blob.core.windows.net/meals/[blobName]?[SAS]" />
```

**Rationale**:
- Social crawlers (Facebook, Twitter, LinkedIn) don't execute JavaScript
- OG tags must be present in initial HTML response
- Same-origin Azure Function can access blob storage for image URLs

**Alternatives considered**:
- **React Helmet on client (rejected)**: Crawlers don't execute JS
- **Separate SSR service (rejected)**: Over-engineering for single page type
- **Static prerender build (rejected)**: Meals are dynamic, can't pre-generate

**Image fallback**: If blob URL fails, use a generic branded image with text overlay showing stats

---

## 3. Pro Tip Persistence Strategy

### Decision: Store AI-generated pro tip at scan time in MealAnalysis

**Current state**: 
- Backend AI prompt already includes `notes` field in response schema
- `notes` column exists in MealAnalysis table
- Frontend displays `result.notes` as "Pro Tip" after scan
- History modal generates client-side tips (not persisted)

**Chosen approach**: Rename usage of `notes` to `proTip` conceptually, enhance AI prompt

**AI Prompt update**:
```
"notes": "A helpful, actionable pro tip about this meal's nutrition (e.g., protein optimization, pairing suggestions)"
```

**Rationale**:
- `notes` field already exists and is stored - no schema change needed for MVP
- AI is already generating contextual observations
- Enhancing the prompt makes tips more actionable
- Frontend just needs to read `notes` as the pro tip

**Alternative considered**:
- **Add separate `proTip` column (rejected for MVP)**: Existing `notes` field serves the purpose
- **Client-side generation (rejected)**: Generic tips don't leverage meal context

---

## 4. Diet Style Configuration Schema

### Decision: Database-stored config with admin CRUD

**DietStyle entity design**:
```typescript
interface DietStyle {
  id: string;           // UUID
  slug: string;         // "ketogenic", "mediterranean" - unique, URL-safe
  name: string;         // "Ketogenic", "Mediterranean"
  description: string;  // User-facing explanation
  netCarbCapG: number | null;    // Daily carb limit (null = no limit)
  fatTargetPercent: number | null; // Target fat % (null = no target)
  isActive: boolean;    // Admin can disable
  sortOrder: number;    // Display order in UI
  createdAt: Date;
  updatedAt: Date;
}
```

**Default diet styles**:
| Slug | Name | Carb Cap | Fat Target | Description |
|------|------|----------|------------|-------------|
| balanced | Balanced | null | null | Standard nutrition, no restrictions |
| mediterranean | Mediterranean | null | 35% | Heart-healthy, olive oil focus |
| low-carb | Low-Carb | 100g | null | Reduced carbs, moderate protein |
| ketogenic | Ketogenic | 30g | 70% | Very low carb, high fat |
| plant-based | Plant-Based | null | null | No animal products |

**Rationale**:
- Database storage enables admin edits without deployment
- Nullable constraints = diet style is advisory only
- `slug` enables stable references even if name changes
- `sortOrder` lets admin control Settings dropdown order

**Alternative considered**:
- **JSON config file (rejected)**: Requires deployment for changes
- **Environment variables (rejected)**: Not structured, hard to validate

---

## 5. Meal Privacy Toggle Implementation

### Decision: `isPublic` boolean on MealAnalysis, default true

**Implementation**:
- Add `isPublic Boolean @default(true)` to MealAnalysis
- Shareable URL endpoint checks `isPublic` flag
- Owner can toggle via PATCH /api/meals/:id { isPublic: false }
- Private meals return 404 to non-owners

**Rationale**:
- Per-meal granularity (not account-wide setting)
- Default public maximizes viral potential
- Simple boolean is easier than complex ACL

**Alternative considered**:
- **Account-wide privacy setting (rejected)**: Too restrictive, users want per-meal control
- **Unlisted/public/private enum (rejected)**: "Unlisted" adds complexity without clear benefit

---

## 6. Frontend Routing Strategy

### Decision: Hybrid SSR/SPA approach

**Routes**:
```
/meal/:shareId → Azure Function (SSR for OG tags) → hydrates React SPA
```

**Flow**:
1. Social crawler hits `/meal/abc12xyz`
2. Azure Function renders HTML with OG tags + React app bundle
3. React hydrates and handles interactivity
4. If user is logged in and owns meal, show edit/delete buttons

**Implementation**:
- New Azure Function: `public-meal.ts`
- Returns HTML document with:
  - OG meta tags (server-rendered)
  - `<div id="root">` for React hydration
  - Full React app bundle script
  - Inline `window.__MEAL_DATA__` for hydration

**Rationale**:
- OG tags require SSR, but interactivity needs React
- Hybrid approach gives both
- Single endpoint serves crawlers and users

---

## 7. User Profile Diet Style Integration

### Decision: Add `dietStyleId` to User table

**Schema update**:
```prisma
model User {
  // ... existing fields
  dietStyleId  String?  @db.Uuid
  dietStyle    DietStyle? @relation(fields: [dietStyleId], references: [id])
}
```

**Behavior**:
- null = Balanced (implicit default, no DB row needed)
- Settings page shows DietStyle dropdown
- Meal analysis includes diet-specific feedback
- Historical meals keep their original analysis (no retroactive changes)

**Rationale**:
- Optional FK allows gradual migration (existing users have null)
- Implicit balanced default avoids migration complexity
- Meal-level snapshot via `dietStyleAtScan` preserves audit trail

---

## 8. Meal Analysis Diet Feedback

### Decision: Post-process AI response with diet constraints

**Flow**:
1. AI analyzes meal → returns standard response
2. Backend fetches user's diet style
3. Backend adds diet-specific warnings to response

**Example keto feedback**:
```typescript
if (dietStyle.netCarbCapG && totalCarbs > dietStyle.netCarbCapG) {
  warnings.push(`⚠️ High carbs for ${dietStyle.name}: ${totalCarbs}g exceeds ${dietStyle.netCarbCapG}g limit`);
}
```

**Rationale**:
- Decouples AI analysis from diet logic
- Diet rules are admin-configurable, not hardcoded in AI prompt
- Same AI response can be re-interpreted for different diets

---

## 9. Admin Dashboard Integration

### Decision: New "Diet Configuration" page in existing admin app

**Location**: `/admin/diet-config`

**Features**:
- List all diet styles with inline editing
- Add new diet style
- Toggle active/inactive
- Reorder via drag-drop or sort field
- Validation: non-negative numbers, unique slugs

**Implementation**:
- New React component in admin app
- Calls new admin API endpoints:
  - GET /api/admin/diet-styles
  - POST /api/admin/diet-styles
  - PATCH /api/admin/diet-styles/:id
  - DELETE /api/admin/diet-styles/:id

**Rationale**:
- Admin app already exists with auth
- Follows existing admin patterns
- No new infrastructure needed

---

## 10. Performance Considerations

### Meal Share URL Performance

**Target**: < 200ms response for `/meal/:shareId`

**Optimizations**:
- Index on `shareId` column
- SAS token caching (5-minute expiry)
- HTML template caching
- Database connection pooling

### Diet Style Caching

**Strategy**: Cache diet styles in memory for 5 minutes

**Implementation**:
```typescript
const dietStyleCache = new Map<string, { data: DietStyle[], expiry: number }>();
```

**Rationale**:
- Diet styles rarely change
- Avoids DB query on every meal analysis
- 5-minute cache aligns with Constitution Principle X

---

## Summary of Technical Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Share IDs | nanoid 10-char | Collision-proof, URL-safe, human-readable |
| OG Tags | SSR via Azure Function | Crawlers don't execute JS |
| Pro Tips | Use existing `notes` field | No schema change, AI already generates |
| Diet Styles | Database table | Admin-editable without deployment |
| Privacy | `isPublic` boolean, default true | Maximizes viral potential |
| Routing | Hybrid SSR/SPA | OG tags + React interactivity |
| Diet Integration | FK on User + snapshot on Meal | Gradual migration, audit trail |
| Admin | New page in existing admin app | Follows existing patterns |
