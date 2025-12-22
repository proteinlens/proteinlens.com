# Route Contracts: ProteinLens Frontend Redesign

**Feature**: 003-frontend-redesign  
**Created**: 2025-12-22  
**Purpose**: Define all application routes, parameters, and navigation flows

---

## Route Definitions

### Home Page

**Path**: `/`  
**Component**: `Home.tsx`  
**Purpose**: Landing page with hero section, upload CTA, and example results

**Query Parameters**: None

**State**: 
- Upload state machine (idle → selected → uploading → analyzing → done)
- If analysis complete, redirect to same page but show results inline

**Layout**:
- Mobile: Full-screen, bottom nav visible
- Desktop: Centered content (max-width: 1024px), sidebar nav

**Success Criteria**:
- FCP < 300ms (hero header + CTA visible)
- Upload button in thumb zone (bottom 30% of screen)
- Mobile viewport: 375px minimum

**Example URL**: `https://proteinlens.com/`

---

### Meal Results (Optional - May Inline in Home)

**Path**: `/meal/:id`  
**Component**: `Results.tsx` (or inline in `Home.tsx`)  
**Purpose**: Display analysis results for a specific meal

**Route Parameters**:
- `id` (required): Meal UUID from backend

**Query Parameters**: None

**State**:
- Meal data fetched by ID
- Food items editable (optimistic updates)
- Protein gap widget visible if goal is set

**Layout**:
- Mobile: Full-screen, scrollable results
- Desktop: Two-column (image left, results right)

**Error Handling**:
- If meal ID not found → redirect to `/` with toast "Meal not found"
- If network error → show cached data + offline banner

**Navigation**:
- "← Back to Home" button (top-left)
- Bottom nav visible (tap "Home" to navigate)

**Example URL**: `https://proteinlens.com/meal/abc-123-def`

**Note**: This route may be eliminated in favor of showing results inline on home page after upload completes. Decision will be made during implementation based on UX flow testing.

---

### History & Trends

**Path**: `/history`  
**Component**: `History.tsx`  
**Purpose**: View all logged meals grouped by day + 7-day protein trend chart

**Query Parameters**:
- `range` (optional): `7d` | `30d` (default: `7d`)

**State**:
- All user meals fetched from backend
- Grouped by date (most recent first)
- Weekly trend computed client-side

**Layout**:
- Mobile: Single column, trend chart at top, meal list below
- Desktop: Two-column (trend + stats left, meal list right)

**Lazy Loading**:
- Route is lazy-loaded (not critical for FCP)
- Chart library (e.g., Recharts) loaded on demand

**Empty State**:
- If no meals logged: "No meals yet. Upload your first meal →" with CTA to `/`

**Performance**:
- Page load < 1 second
- Infinite scroll for meal list (load 20 meals at a time)

**Example URL**: `https://proteinlens.com/history?range=7d`

---

### Settings (Optional MVP)

**Path**: `/settings`  
**Component**: `Settings.tsx`  
**Purpose**: Configure daily protein goal, theme, and account settings

**Query Parameters**: None

**State**:
- User preferences (goal, theme)
- Account info (email, subscription)

**Layout**:
- Mobile: Single column form
- Desktop: Centered content (max-width: 600px)

**Sections**:
1. **Protein Goal**: Input field (default: 150g) + Save button
2. **Theme**: Toggle (Light / Dark / System)
3. **Account**: Email, subscription status (if applicable)
4. **Data**: Export meals (CSV download), Delete all data (confirmation dialog)

**Lazy Loading**:
- Route is lazy-loaded (not critical)

**Example URL**: `https://proteinlens.com/settings`

---

## Navigation Patterns

### Mobile Bottom Navigation

**Component**: `BottomNav.tsx`

**Items**:
1. **Home** (icon: home, path: `/`)
2. **History** (icon: calendar, path: `/history`)
3. **Settings** (icon: gear, path: `/settings`) - optional for MVP

**Behavior**:
- Always visible on mobile (< 768px)
- Active route highlighted (bold text + icon color)
- Tap to navigate (instant, no page reload)

**Accessibility**:
- Each item is `<button>` with `aria-label`
- Focus indicator visible (3:1 contrast)
- Keyboard navigation: Tab cycles through items, Enter activates

---

### Desktop Sidebar Navigation

**Component**: `Sidebar.tsx`

**Items**: Same as mobile (Home, History, Settings)

**Behavior**:
- Visible on desktop (>= 768px)
- Fixed position (stays visible while scrolling)
- Active route highlighted

**Layout**:
- Width: 240px
- Positioned: left side of screen
- Content area offset by 240px

---

## Route Transitions

### Navigation Animation

**Library**: Framer Motion

**Transition Type**: Fade + slide (300ms)

**Pattern**:
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    <Routes>
      {/* Routes here */}
    </Routes>
  </motion.div>
</AnimatePresence>
```

**Accessibility**:
- Respect `prefers-reduced-motion: reduce` (no animation)
- Announce route change to screen readers (`aria-live="polite"`)

---

## Deep Linking

### Share Meal

**Pattern**: `/meal/:id`

**Use Case**: User shares meal results via link (future feature)

**Behavior**:
- If user is logged in and owns meal → show results
- If user is logged in but doesn't own meal → 403 Forbidden
- If user is not logged in → redirect to login (preserve path)

---

### Direct Navigation to History

**Pattern**: `/history?range=30d`

**Use Case**: User bookmarks history page or receives push notification to view trends

**Behavior**:
- Load history page with specified date range
- If range is invalid → default to `7d`

---

## URL State Management

### React Router State

**Use Case**: Preserve upload state when navigating away

**Pattern**:
```typescript
// Before navigation
navigate('/history', { state: { returnTo: '/', uploadState } });

// On return
const location = useLocation();
if (location.state?.uploadState) {
  // Restore upload state
}
```

**Example**:
- User uploads meal → analyzing
- User taps "History" → navigate to `/history`
- User taps "Home" → return to `/` with analyzing state preserved

---

## Summary

Routes defined:
- **/ (Home)**: Hero upload + results (P1, critical for FCP)
- **/meal/:id (Results)**: Optional, may inline in Home (P1)
- **/history (History)**: Meal list + trends (P3, lazy-loaded)
- **/settings (Settings)**: Goal + preferences (optional MVP, lazy-loaded)

Navigation:
- Mobile: Bottom nav (3 items)
- Desktop: Sidebar nav (3 items)
- Transitions: Fade + slide (300ms, respects reduced-motion)

All routes support:
- Keyboard navigation
- Deep linking
- Offline viewing (cached data)
- Fast perceived performance (lazy loading for non-critical routes)
