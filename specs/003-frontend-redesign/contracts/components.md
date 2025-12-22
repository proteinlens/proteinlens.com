# Component Contracts: ProteinLens Frontend Redesign

**Feature**: 003-frontend-redesign  
**Created**: 2025-12-22  
**Purpose**: Define component APIs, props, and responsibilities

---

## Component Inventory & Hierarchy

```
App
├── Layout (Mobile/Desktop)
│   ├── BottomNav (mobile)
│   └── Sidebar (desktop)
├── Home Page
│   ├── HeroUploadCard
│   ├── UploadDropzone
│   ├── ImagePreview
│   ├── AnalyzeProgress
│   ├── MealSummaryCard
│   └── FoodItemList
│       └── FoodItemEditor
├── History Page
│   ├── WeeklyTrendChart
│   ├── ProteinGapWidget
│   └── MealHistoryList
│       └── MealHistoryCard
└── Settings Page
    ├── GoalInput
    └── ThemeToggle
```

---

## Core Components

### HeroUploadCard

**Purpose**: Home page hero section with value proposition + upload CTA

**Props**:
```typescript
interface HeroUploadCardProps {
  onUploadClick: () => void;     // Trigger file picker or dropzone
  isLoading?: boolean;           // Disable button during upload
}
```

**Responsibilities**:
- Display hero header: "Analyze meals in seconds, track protein effortlessly"
- Show primary CTA button: "📸 Upload Meal Photo" (44×44px minimum, thumb zone)
- Display trust elements: "AI-powered", "Edit anytime", "Your data, your control"
- Show example results preview (static mock data)

**Accessibility**:
- CTA button has `aria-label="Upload meal photo"`
- Hero header is `<h1>` (semantic HTML)

**Performance**:
- Render within 300ms (critical for FCP)
- No external images (use CSS gradients for background)

**Example Usage**:
```tsx
<HeroUploadCard 
  onUploadClick={() => setShowDropzone(true)} 
  isLoading={uploadState.status === 'uploading'}
/>
```

---

### UploadDropzone

**Purpose**: Drag/drop zone (desktop) + file picker (mobile) for meal photo upload

**Props**:
```typescript
interface UploadDropzoneProps {
  onFileSelect: (file: File, preview: string) => void;  // Callback when file chosen
  onCancel: () => void;                                  // Close dropzone
  maxSizeMB?: number;                                    // Default: 10MB
  acceptedTypes?: string[];                              // Default: ['image/*']
}
```

**Responsibilities**:
- Show drag/drop zone on desktop (with "Drag photo here" text)
- Show file picker button on mobile ("Choose from library")
- Validate file size (reject if > maxSizeMB)
- Validate file type (reject if not image)
- Generate preview URL (blob URL for image)
- Display error toast if validation fails

**States**:
- Idle: Show dropzone/picker
- Dragging (desktop only): Highlight dropzone border
- Error: Show error message + retry CTA

**Accessibility**:
- File input has `aria-label="Choose meal photo"`
- Drag zone has `role="button"` + keyboard support (Enter to trigger picker)

**Example Usage**:
```tsx
<UploadDropzone
  onFileSelect={(file, preview) => {
    dispatch({ type: 'SELECT', file, preview });
  }}
  onCancel={() => setShowDropzone(false)}
/>
```

---

### ImagePreview

**Purpose**: Show selected image with options to replace or remove

**Props**:
```typescript
interface ImagePreviewProps {
  preview: string;               // Blob URL or data URL
  fileName: string;              // Display name
  onReplace: () => void;         // Trigger file picker again
  onRemove: () => void;          // Clear selection
}
```

**Responsibilities**:
- Display preview image (1:1 aspect ratio, max 400px width)
- Show file name below image
- Provide "Replace" and "Remove" buttons (44×44px touch targets)
- Animate in with fade (200ms)

**Accessibility**:
- Image has `alt={fileName}`
- Buttons have clear labels (not icons only)

**Example Usage**:
```tsx
<ImagePreview
  preview={uploadState.preview}
  fileName={uploadState.file.name}
  onReplace={() => dispatch({ type: 'RESET' })}
  onRemove={() => dispatch({ type: 'RESET' })}
/>
```

---

### AnalyzeProgress

**Purpose**: Show upload + analysis progress with skeleton loading

**Props**:
```typescript
interface AnalyzeProgressProps {
  status: 'uploading' | 'analyzing' | 'done';
  progress?: number;             // 0-100 for upload progress
}
```

**Responsibilities**:
- Display progress message:
  - Uploading: "Uploading... {progress}%"
  - Analyzing: "Analyzing meal..." (no spinner, use skeleton)
  - Done: "Analysis complete!" (brief, then fade to results)
- Show skeleton cards for expected results (shimmer effect)
- Animate skeleton → content fade-in (300ms)

**Performance**:
- No blocking spinners (use skeleton screens instead)
- Skeleton structure matches final results (card + list)

**Accessibility**:
- Progress text has `aria-live="polite"` (announces to screen readers)

**Example Usage**:
```tsx
<AnalyzeProgress 
  status={uploadState.status} 
  progress={uploadState.progress}
/>
```

---

### MealSummaryCard

**Purpose**: Display meal analysis results (total protein, calories, macros, image)

**Props**:
```typescript
interface MealSummaryCardProps {
  meal: Meal;                    // Full meal object with analysis
  onEdit?: () => void;           // Optional: trigger edit mode
  showImage?: boolean;           // Default: true
}
```

**Responsibilities**:
- Display total protein (large, bold, 24px+)
- Show estimated calories + macros (if available)
- Display original meal image (preview or full-size modal)
- Provide "Edit" button (if onEdit provided)
- Calculate and show confidence level (average of all food items)

**Layout**:
- Mobile: Stacked (image top, stats bottom)
- Desktop: Side-by-side (image left, stats right)

**Accessibility**:
- Total protein is `<h2>` (semantic hierarchy)
- Image has descriptive alt text: "Meal uploaded on {date}"

**Example Usage**:
```tsx
<MealSummaryCard 
  meal={mealData} 
  onEdit={() => setEditMode(true)}
  showImage={true}
/>
```

---

### FoodItemList

**Purpose**: Display all detected food items in a meal

**Props**:
```typescript
interface FoodItemListProps {
  items: FoodItem[];
  onItemClick?: (item: FoodItem) => void;  // Trigger edit
  editable?: boolean;                       // Show edit icons
}
```

**Responsibilities**:
- List all food items with columns: name, portion, protein, confidence
- Highlight edited items (visual indicator)
- Show confidence badge if < 95%
- Animate list items on insert/remove (Framer Motion layout)

**Performance**:
- Virtualize list if > 20 items (react-window)

**Accessibility**:
- List is `<ul>` with `<li>` items
- Each item is clickable with keyboard (Tab + Enter)

**Example Usage**:
```tsx
<FoodItemList
  items={meal.analysis.foodItems}
  onItemClick={(item) => setEditingItem(item)}
  editable={true}
/>
```

---

### FoodItemEditor

**Purpose**: Inline editor for food item (name, portion, protein)

**Props**:
```typescript
interface FoodItemEditorProps {
  item: FoodItem;
  onSave: (updates: Partial<FoodItem>) => Promise<void>;
  onCancel: () => void;
}
```

**Responsibilities**:
- Display editable fields: name (text), portion (text), protein (number)
- Show original AI values for reference ("AI detected: 25g")
- Provide "Save" and "Cancel" buttons
- Show loading state during save (optimistic update)
- Display error toast if save fails

**Validation**:
- Protein must be >= 0
- Name must not be empty

**Accessibility**:
- Form labels always visible (not placeholder-only)
- Focus input on mount
- Escape key cancels edit

**Example Usage**:
```tsx
<FoodItemEditor
  item={editingItem}
  onSave={async (updates) => {
    await editFoodItem.mutateAsync({ ...updates, foodItemId: editingItem.id });
  }}
  onCancel={() => setEditingItem(null)}
/>
```

---

### ProteinGapWidget

**Purpose**: Show daily protein gap + coaching suggestions

**Props**:
```typescript
interface ProteinGapWidgetProps {
  gap: ProteinGap;               // Computed gap object
  suggestions: HighProteinSuggestion[];  // 3 suggestions
  onQuickAdd?: (suggestion: HighProteinSuggestion) => void;
}
```

**Responsibilities**:
- Display gap message:
  - Positive gap: "X grams to reach your 150g daily goal"
  - Met goal: "🎯 Goal met! Protein: 155g (Goal: 150g)"
- Show 3 suggested high-protein foods with protein content
- Provide "Quick Add" button for each suggestion (optional)
- Color-code based on completion: red (< 50%), yellow (50-90%), green (90%+)

**Accessibility**:
- Gap number is `aria-live="polite"` (announces updates)

**Example Usage**:
```tsx
<ProteinGapWidget
  gap={proteinGap}
  suggestions={randomSuggestions}
  onQuickAdd={(suggestion) => addSuggestionToMeal(suggestion)}
/>
```

---

### WeeklyTrendChart

**Purpose**: Bar chart showing 7-day protein intake trend

**Props**:
```typescript
interface WeeklyTrendChartProps {
  trend: WeeklyTrend;            // 7 days of data
  onDayClick?: (day: DailyProtein) => void;  // Optional: navigate to day view
}
```

**Responsibilities**:
- Display 7 bars (one per day) with day labels (Mon, Tue, Wed...)
- Highlight today's bar with different color
- Show average line across chart (optional)
- Display tooltip on hover/tap: "Monday: 145g protein (3 meals)"
- Responsive: no horizontal scrolling on mobile

**Library**: Recharts (lazy-loaded with History route)

**Accessibility**:
- Chart has `role="img"` + `aria-label` describing trend
- Data available in table format (visually hidden)

**Example Usage**:
```tsx
<WeeklyTrendChart
  trend={weeklyTrend}
  onDayClick={(day) => navigate(`/history?date=${day.date}`)}
/>
```

---

### MealHistoryList

**Purpose**: Display all logged meals grouped by date

**Props**:
```typescript
interface MealHistoryListProps {
  meals: Meal[];
  onMealClick?: (meal: Meal) => void;  // Navigate to meal detail
}
```

**Responsibilities**:
- Group meals by date (most recent first)
- Display date headers ("Today", "Yesterday", "Dec 20, 2025")
- Show meal cards with: thumbnail, total protein, timestamp
- Infinite scroll (load 20 meals at a time)
- Empty state: "No meals yet. Upload your first meal →"

**Performance**:
- Virtualize list if > 50 meals

**Accessibility**:
- Date headers are `<h3>` (semantic hierarchy)

**Example Usage**:
```tsx
<MealHistoryList
  meals={allMeals}
  onMealClick={(meal) => navigate(`/meal/${meal.id}`)}
/>
```

---

## Layout Components

### BottomNav

**Purpose**: Mobile bottom navigation (Home, History, Settings)

**Props**:
```typescript
interface BottomNavProps {
  currentPath: string;           // Active route
}
```

**Responsibilities**:
- Display 3 navigation items with icons + labels
- Highlight active route (bold + color)
- Animate icon on tap (scale 1.1 → 1.0)

**Accessibility**:
- Each item is `<button>` with `aria-label`
- Keyboard navigation (Tab + Enter)

---

### Sidebar

**Purpose**: Desktop sidebar navigation

**Props**:
```typescript
interface SidebarProps {
  currentPath: string;
}
```

**Responsibilities**:
- Display 3 navigation items (vertical layout)
- Highlight active route
- Fixed position (stays visible while scrolling)

**Layout**:
- Width: 240px
- Height: 100vh

---

## Summary

Component inventory:
- **13 core components** defined (Hero, Upload, Preview, Progress, Summary, List, Editor, Gap, Chart, History, Nav, Sidebar, Settings)
- **All props typed** (TypeScript interfaces)
- **Responsibilities documented** (what each component does)
- **Accessibility requirements** (ARIA labels, semantic HTML, keyboard nav)
- **Performance targets** (FCP, lazy loading, virtualization)

All components use shadcn/ui primitives + Tailwind for styling. No custom CSS except animations (Framer Motion).
