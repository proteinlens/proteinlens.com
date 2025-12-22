# Data Model: ProteinLens Frontend Redesign

**Feature**: 003-frontend-redesign  
**Created**: 2025-12-22  
**Purpose**: Define TypeScript interfaces and data structures for frontend state management

---

## Frontend Data Model (TypeScript Interfaces)

### Meal Entity

Represents a single meal logged by a user (consumed from backend API).

```typescript
interface Meal {
  id: string;                    // UUID from backend
  userId: string;                // User who logged the meal
  uploadedAt: Date;              // When meal was uploaded
  imageUrl: string;              // Blob storage URL (full URL, not path)
  imageThumbUrl?: string;        // Optional thumbnail URL
  analysis: MealAnalysis;        // AI analysis results
  corrections: Correction[];     // User edits to food items
  notes?: string;                // Optional user notes
}

interface MealAnalysis {
  totalProtein: number;          // Sum of all food items (grams)
  totalCalories?: number;        // Optional calorie estimate
  macros?: {                     // Optional macro breakdown
    carbs: number;               // grams
    fats: number;                // grams
    protein: number;             // grams (matches totalProtein)
  };
  foodItems: FoodItem[];         // Detected foods in the meal
  analyzedAt: Date;              // When analysis completed
  requestId: string;             // Correlation ID for tracing
}
```

**Validation Rules**:
- `totalProtein` must equal sum of `foodItems[].proteinGrams`
- `imageUrl` must be valid HTTPS URL
- `foodItems` array must have at least 1 item (empty meals are invalid)

**Display Rules**:
- Show `totalProtein` prominently (20px+ font size)
- Display `uploadedAt` as relative time ("2 hours ago")
- If `macros` is null, show protein only (no calorie/macro breakdown)

---

### FoodItem Entity

Represents an individual food detected in a meal (nested within Meal).

```typescript
interface FoodItem {
  id: string;                    // UUID from backend
  mealId: string;                // Parent meal ID
  name: string;                  // Food name ("Grilled chicken breast")
  portion: string;               // Portion descriptor ("100g", "1 cup", "half plate")
  proteinGrams: number;          // Protein content
  confidence: number;            // AI confidence (0-100)
  aiDetected: boolean;           // true if from AI, false if user-added
  isEdited: boolean;             // true if user modified this item
  originalName?: string;         // Original AI name (if edited)
  originalProtein?: number;      // Original AI protein value (if edited)
}
```

**Validation Rules**:
- `confidence` must be 0-100 (percentage)
- `proteinGrams` must be >= 0
- If `isEdited = true`, must have `originalName` and/or `originalProtein`
- If `aiDetected = false`, confidence should be 100 (user-added items are "certain")

**Display Rules**:
- Show confidence badge only if < 95% ("85% confident")
- Highlight edited items with visual indicator (e.g., pencil icon)
- Display original vs. edited values side-by-side when editing

---

### Correction Entity

Represents a user edit to a food item (used for audit trail and undo).

```typescript
interface Correction {
  id: string;                    // UUID (frontend-generated or backend)
  foodItemId: string;            // Which food item was edited
  fieldEdited: 'name' | 'portion' | 'protein';  // What field changed
  originalValue: string | number;  // Value before edit
  newValue: string | number;     // Value after edit
  savedAt: Date;                 // When edit was saved
}
```

**Validation Rules**:
- `fieldEdited` must be one of: 'name', 'portion', 'protein'
- `originalValue` type must match `fieldEdited` (string for name/portion, number for protein)

**Usage**:
- Store corrections in meal object after successful save
- Display in edit history (future feature)
- Enable undo functionality (restore `originalValue`)

---

### DailyGoal Entity

Represents a user's daily protein target (stored in backend, cached in frontend).

```typescript
interface DailyGoal {
  userId: string;                // User who owns this goal
  goalGrams: number;             // Target protein (default: 150g)
  lastUpdated: Date;             // When goal was last changed
}
```

**Validation Rules**:
- `goalGrams` must be > 0 and <= 500 (reasonable bounds)
- Default to 150g if user hasn't set a goal

**Display Rules**:
- Show goal in gap widget ("150g daily goal")
- Allow user to edit in settings page
- Persist to backend immediately on change

---

### ProteinGap (Computed)

Calculated client-side from meals + goal (not stored in backend).

```typescript
interface ProteinGap {
  goalGrams: number;             // User's daily goal
  consumedGrams: number;         // Sum of all meals today
  gapGrams: number;              // goalGrams - consumedGrams (can be negative)
  percentComplete: number;       // (consumedGrams / goalGrams) * 100
  isMet: boolean;                // gapGrams <= 0
  lastMealAt?: Date;             // Timestamp of most recent meal
}
```

**Calculation Logic**:
```typescript
const calculateGap = (meals: Meal[], goal: DailyGoal): ProteinGap => {
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysMeals = meals.filter(m => 
    new Date(m.uploadedAt).setHours(0, 0, 0, 0) === today
  );
  
  const consumed = todaysMeals.reduce((sum, meal) => 
    sum + meal.analysis.totalProtein, 0
  );
  
  const gap = goal.goalGrams - consumed;
  
  return {
    goalGrams: goal.goalGrams,
    consumedGrams: consumed,
    gapGrams: gap,
    percentComplete: Math.min(100, (consumed / goal.goalGrams) * 100),
    isMet: gap <= 0,
    lastMealAt: todaysMeals.length > 0 
      ? new Date(Math.max(...todaysMeals.map(m => m.uploadedAt.getTime())))
      : undefined,
  };
};
```

**Display Rules**:
- If `isMet = true`, show "🎯 Goal met!" message
- If `gapGrams > 0`, show "X grams to go" with suggestions
- Color-code gap widget: red (< 50% complete), yellow (50-90%), green (90%+)

---

### HighProteinSuggestion (Static Data)

Suggested high-protein foods to close the gap (hardcoded, not from backend).

```typescript
interface HighProteinSuggestion {
  name: string;                  // "Grilled chicken breast"
  proteinPer100g: number;        // 31g
  servingSize: string;           // "100g"
  category: 'meat' | 'fish' | 'dairy' | 'plant';  // Food category
  icon?: string;                 // Emoji or icon name
}

// Example static data
const suggestions: HighProteinSuggestion[] = [
  { name: 'Grilled chicken breast', proteinPer100g: 31, servingSize: '100g', category: 'meat', icon: '🍗' },
  { name: 'Greek yogurt', proteinPer100g: 10, servingSize: '100g', category: 'dairy', icon: '🥛' },
  { name: 'Salmon fillet', proteinPer100g: 25, servingSize: '100g', category: 'fish', icon: '🐟' },
  { name: 'Lentils (cooked)', proteinPer100g: 9, servingSize: '100g', category: 'plant', icon: '🌱' },
  { name: 'Eggs', proteinPer100g: 13, servingSize: '2 large', category: 'dairy', icon: '🥚' },
  { name: 'Tofu', proteinPer100g: 8, servingSize: '100g', category: 'plant', icon: '🧈' },
];
```

**Selection Logic**:
- Pick 3 random suggestions from list
- Optionally filter by user preferences (future: vegetarian/vegan)
- Rotate suggestions on widget refresh

---

### Weekly Trend (Aggregated)

7-day protein intake trend (computed from meals, not stored).

```typescript
interface DailyProtein {
  date: Date;                    // Day (midnight UTC)
  totalProtein: number;          // Sum of all meals that day
  mealCount: number;             // Number of meals logged
}

interface WeeklyTrend {
  days: DailyProtein[];          // 7 days (today - 6 days)
  averageProtein: number;        // Mean of 7 days
  highestDay: DailyProtein;      // Day with max protein
  lowestDay: DailyProtein;       // Day with min protein
}
```

**Calculation Logic**:
```typescript
const calculateWeeklyTrend = (meals: Meal[]): WeeklyTrend => {
  const today = new Date();
  const days: DailyProtein[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayMeals = meals.filter(m => {
      const mealDate = new Date(m.uploadedAt);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === date.getTime();
    });
    
    const total = dayMeals.reduce((sum, m) => sum + m.analysis.totalProtein, 0);
    
    days.push({
      date,
      totalProtein: total,
      mealCount: dayMeals.length,
    });
  }
  
  const avgProtein = days.reduce((sum, d) => sum + d.totalProtein, 0) / 7;
  
  return {
    days,
    averageProtein: avgProtein,
    highestDay: days.reduce((max, d) => d.totalProtein > max.totalProtein ? d : max),
    lowestDay: days.reduce((min, d) => d.totalProtein < min.totalProtein ? d : min),
  };
};
```

**Display Rules**:
- Show 7 bars (one per day) with day labels (Mon, Tue, Wed...)
- Highlight today's bar with different color
- Show average line across chart
- Display tooltip on hover/tap: "Monday: 145g protein (3 meals)"

---

### Upload State Machine

Frontend-only state for upload flow (not persisted).

```typescript
type UploadState =
  | { status: 'idle' }
  | { status: 'selected'; file: File; preview: string }
  | { status: 'uploading'; file: File; progress: number }
  | { status: 'analyzing'; blobUrl: string }
  | { status: 'done'; mealId: string }
  | { status: 'error'; message: string; retryable: boolean };
```

**State Transitions**:
```
idle → selected (user picks file)
selected → uploading (user taps "Analyze")
uploading → analyzing (upload complete, analysis starts)
analyzing → done (analysis complete, mealId returned)
analyzing → error (AI service timeout)
error → uploading (user taps "Retry")
any → idle (user taps "Cancel" or "Start Over")
```

**Validation Rules**:
- `file` must be image/* MIME type (reject PDFs, videos)
- `file.size` must be <= 10MB (enforce before upload)
- `progress` must be 0-100 (percentage)
- `preview` must be valid data URL (blob:// or data:image/...)

---

## API Request/Response Types

### Upload Meal Request

```typescript
interface UploadMealRequest {
  image: File;                   // Multipart form data
  userId: string;                // From auth context
}

interface UploadMealResponse {
  mealId: string;                // UUID of created meal
  blobUrl: string;               // URL of uploaded image
  status: 'analyzing' | 'done';  // Analysis may be async
}
```

### Get Meals Request

```typescript
interface GetMealsRequest {
  userId: string;                // From auth context
  startDate?: Date;              // Optional date range
  endDate?: Date;
  limit?: number;                // Pagination (default: 50)
  offset?: number;
}

interface GetMealsResponse {
  meals: Meal[];
  total: number;                 // Total count (for pagination)
  hasMore: boolean;              // More results available?
}
```

### Edit Food Item Request

```typescript
interface EditFoodItemRequest {
  mealId: string;
  foodItemId: string;
  updates: {
    name?: string;
    portion?: string;
    proteinGrams?: number;
  };
}

interface EditFoodItemResponse {
  foodItem: FoodItem;            // Updated food item
  meal: Meal;                    // Updated meal (with recalculated totalProtein)
}
```

---

## LocalStorage Schema

Frontend caches data in localStorage for offline access.

### Cached Meals

```typescript
// Key: 'proteinlens:meals'
interface CachedMeals {
  meals: Meal[];
  lastSync: Date;                // When last synced with backend
  version: number;               // Schema version (for migrations)
}
```

### User Preferences

```typescript
// Key: 'proteinlens:preferences'
interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  goal: number;                  // Daily protein goal (grams)
  lastGoalUpdate: Date;
  reducedMotion: boolean;        // Override for animations
}
```

**Sync Strategy**:
- On app load: fetch meals from backend, update localStorage
- On edit: optimistic update localStorage, sync to backend
- On offline: read from localStorage, queue edits for sync when online

---

## Summary

Frontend data model defined:
- **4 core entities**: Meal, FoodItem, Correction, DailyGoal
- **3 computed entities**: ProteinGap, WeeklyTrend, UploadState
- **1 static dataset**: HighProteinSuggestion
- **3 API contracts**: Upload, GetMeals, EditFoodItem
- **2 localStorage schemas**: CachedMeals, UserPreferences

All TypeScript interfaces are type-safe, validated, and ready for implementation in Phase 2.
