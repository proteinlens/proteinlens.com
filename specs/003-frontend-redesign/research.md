# Research & Best Practices: ProteinLens Frontend Redesign

**Feature**: 003-frontend-redesign  
**Created**: 2025-12-22  
**Purpose**: Research best practices for React SPA, mobile-first design, performance optimization, and accessibility

---

## Technology Choices & Rationale

### React Query (TanStack Query) for Server State

**Decision**: Use React Query v5 for all server state (meals, goals, food items)

**Rationale**:
- **Automatic caching**: Reduces redundant API calls, improves perceived performance
- **Background refetching**: Keeps data fresh without user-initiated refresh
- **Optimistic updates**: Perfect for food item edits (FR-024 requires immediate UI updates)
- **Built-in loading/error states**: Simplifies UI state management
- **Offline support**: Query cache persists across page refreshes

**Alternatives Considered**:
- **Custom hooks with useState**: More code, no caching, manual error handling
- **Redux Toolkit Query**: Heavier bundle size, steeper learning curve
- **SWR**: Lighter but less feature-rich (no mutations, manual optimistic updates)

**Best Practices**:
- Use `queryClient.setQueryData` for optimistic updates (edit food item → instant UI change)
- Enable `staleTime: 5 * 60 * 1000` (5 min) for goal data (changes infrequently)
- Use `refetchOnWindowFocus: false` for meal history (avoid unnecessary refetches)
- Implement `retry: 3` with exponential backoff for network resilience

**Example Pattern**:
```typescript
// useMeals.ts
export const useMeals = () => {
  return useQuery({
    queryKey: ['meals'],
    queryFn: () => mealService.getAll(),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useEditFoodItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EditFoodItemRequest) => mealService.editFoodItem(data),
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries(['meals', newData.mealId]);
      const previous = queryClient.getQueryData(['meals', newData.mealId]);
      queryClient.setQueryData(['meals', newData.mealId], (old) => ({
        ...old,
        foodItems: old.foodItems.map(item =>
          item.id === newData.foodId ? { ...item, ...newData } : item
        ),
      }));
      return { previous };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['meals', newData.mealId], context.previous);
    },
  });
};
```

---

### Framer Motion for Animations

**Decision**: Use Framer Motion for page transitions, card expansions, list insertions

**Rationale**:
- **Declarative API**: Matches React mental model (`<motion.div animate={{ opacity: 1 }}>`)
- **Built-in gestures**: Drag, tap, hover states for mobile interactions
- **Layout animations**: Automatic smooth transitions when DOM changes (perfect for list insertions)
- **Accessibility**: Respects `prefers-reduced-motion` by default
- **Performance**: Uses CSS transforms (GPU-accelerated), avoids layout thrashing

**Alternatives Considered**:
- **React Spring**: More complex API, steeper learning curve
- **CSS animations**: Harder to coordinate with React state, no gesture support
- **Anime.js**: Imperative API, not React-friendly

**Best Practices**:
- Use `layoutId` for shared element transitions (meal card → detail view)
- Keep animation durations short: 150-250ms for micro-interactions, 300-400ms for page transitions
- Use `initial={{ opacity: 0 }}` + `animate={{ opacity: 1 }}` for fade-ins (skeleton → content)
- Disable animations for `prefers-reduced-motion: reduce` users

**Example Pattern**:
```typescript
// FoodItemList.tsx
import { motion, AnimatePresence } from 'framer-motion';

export const FoodItemList = ({ items }) => (
  <AnimatePresence>
    {items.map((item) => (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
      >
        <FoodItem data={item} />
      </motion.div>
    ))}
  </AnimatePresence>
);
```

---

### shadcn/ui + Tailwind for Design System

**Decision**: Use shadcn/ui component primitives with Tailwind utility classes

**Rationale**:
- **Copy-paste components**: No npm dependency bloat, full control over code
- **Accessible by default**: Built on Radix UI primitives (ARIA patterns, keyboard nav)
- **Tailwind integration**: Components styled with utility classes, easy to customize
- **TypeScript-first**: Full type safety for component props
- **Dark mode built-in**: Uses CSS variables for theming

**Alternatives Considered**:
- **Material-UI**: Heavy bundle size (300kb+), opinionated design language
- **Chakra UI**: Larger bundle, runtime styles overhead
- **Headless UI**: Lower-level, requires more custom styling

**Best Practices**:
- Install only needed components (`npx shadcn-ui add button card toast`)
- Customize `tailwind.config.js` with design tokens (colors, spacing, typography)
- Use `cn()` utility for conditional classes (`cn('base-classes', condition && 'conditional-class')`)
- Extend components in `components/ui/` when needed (e.g., add `SkeletonCard` variant)

**Example Pattern**:
```typescript
// Button usage
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg" className="mt-4">
  Upload Meal Photo
</Button>

// Custom variant in button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Add custom variant
        premium: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      },
    },
  }
);
```

---

### Upload State Machine

**Decision**: Implement upload flow as finite state machine with 5 states

**Rationale**:
- **Prevents impossible states**: Can't be "uploading" and "analyzing" simultaneously
- **Clear error recovery**: Each state defines valid transitions (e.g., error → retry → uploading)
- **Easier testing**: State machine logic is pure, easy to unit test
- **Better UX**: Always know which UI to show (idle → dropzone, selected → preview, analyzing → skeleton)

**States**: `idle → selected → uploading → analyzing → done | error`

**Alternatives Considered**:
- **Multiple useState hooks**: Leads to impossible states (uploading=true + analyzing=true)
- **XState library**: Overkill for simple 5-state machine, adds bundle size
- **useReducer only**: Works but less explicit than dedicated state machine

**Best Practices**:
- Define state transitions explicitly (no direct jumps from `idle` to `analyzing`)
- Store blob URL in `selected` state (enables preview before upload)
- Keep upload progress % in state (show "Uploading... 45%")
- Store error message in `error` state (display to user with retry CTA)

**Example Pattern**:
```typescript
// uploadStateMachine.ts
type UploadState =
  | { status: 'idle' }
  | { status: 'selected'; file: File; preview: string }
  | { status: 'uploading'; file: File; progress: number }
  | { status: 'analyzing'; blobUrl: string }
  | { status: 'done'; mealId: string }
  | { status: 'error'; message: string };

type UploadAction =
  | { type: 'SELECT'; file: File; preview: string }
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_PROGRESS'; progress: number }
  | { type: 'UPLOAD_COMPLETE'; blobUrl: string }
  | { type: 'ANALYZE_START' }
  | { type: 'ANALYZE_COMPLETE'; mealId: string }
  | { type: 'ERROR'; message: string }
  | { type: 'RETRY' }
  | { type: 'RESET' };

const uploadReducer = (state: UploadState, action: UploadAction): UploadState => {
  switch (state.status) {
    case 'idle':
      if (action.type === 'SELECT') {
        return { status: 'selected', file: action.file, preview: action.preview };
      }
      break;
    case 'selected':
      if (action.type === 'UPLOAD_START') {
        return { status: 'uploading', file: state.file, progress: 0 };
      }
      break;
    // ... other transitions
  }
  return state;
};
```

---

### Mobile-First Responsive Breakpoints

**Decision**: Design for 375px first, then enhance at 768px (tablet), 1024px+ (desktop)

**Rationale**:
- **Constitution requirement**: Principle VIII mandates mobile-first design
- **Usage pattern**: Users log meals during meals (mobile context)
- **Performance**: Mobile-first CSS is smaller (base styles + min-width media queries)
- **Accessibility**: Forces simplified UI (better for all users)

**Breakpoints**:
- **Base (375px-767px)**: Single column, bottom nav, thumb-zone CTAs
- **Tablet (768px-1023px)**: Two-column layout for results, side-by-side charts
- **Desktop (1024px+)**: Sidebar nav, three-column layouts, larger images

**Alternatives Considered**:
- **Desktop-first**: Requires max-width media queries, harder to simplify down
- **Mobile-only**: Ignores 30% of users on desktop/tablet
- **Fluid design (no breakpoints)**: Harder to test, unpredictable layouts

**Best Practices**:
- Use Tailwind responsive prefixes: `<div className="flex flex-col md:flex-row">`
- Test on real devices (375px iPhone SE, 390px iPhone 15, 430px iPhone 15 Pro Max)
- Use `@container` queries for component-level responsiveness (when widely supported)
- Avoid horizontal scrolling at any breakpoint

**Example Pattern**:
```typescript
// MealSummaryCard.tsx
<Card className="w-full max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Mobile: stacked, Desktop: side-by-side */}
    <div className="order-1 md:order-2">
      <img src={meal.image} alt="Meal" className="w-full h-48 md:h-64 object-cover" />
    </div>
    <div className="order-2 md:order-1">
      <h2 className="text-2xl md:text-3xl font-bold">{meal.totalProtein}g</h2>
      <FoodItemList items={meal.foodItems} />
    </div>
  </CardContent>
</Card>
```

---

### Performance Optimization Patterns

**Decision**: Implement code-splitting, lazy loading, and image optimization

**Rationale**:
- **Constitution requirement**: Principle IX mandates <300ms FCP, <3s TTI
- **Bundle size**: React + Framer Motion + Chart library = ~200kb+ (need chunking)
- **Network conditions**: 3G is worst-case target (1.6 Mbps down, 750 Kbps up)

**Strategies**:
1. **Route-based code splitting**: Lazy-load `/history` route (not critical for FCP)
2. **Component lazy loading**: Lazy-load chart library (only needed in history)
3. **Image optimization**: Compress uploads client-side before sending to backend
4. **Skeleton screens**: Show layout immediately, load content in background

**Best Practices**:
- Use `React.lazy()` + `Suspense` for route splitting
- Preload critical routes on hover (`<Link onMouseEnter={() => import('./History')}>`)
- Use `loading="lazy"` for below-fold images
- Compress images with `browser-image-compression` library before upload

**Example Pattern**:
```typescript
// App.tsx - Route-based code splitting
const History = React.lazy(() => import('./pages/History'));
const Settings = React.lazy(() => import('./pages/Settings'));

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/" element={<Home />} /> {/* NOT lazy - critical for FCP */}
    <Route path="/history" element={<History />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>

// Image compression before upload
import imageCompression from 'browser-image-compression';

const handleUpload = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  const compressedFile = await imageCompression(file, options);
  await uploadService.upload(compressedFile);
};
```

---

### Accessibility Implementation

**Decision**: Integrate eslint-plugin-jsx-a11y + axe DevTools + manual keyboard testing

**Rationale**:
- **Constitution requirement**: Principle XI mandates WCAG AA compliance
- **Legal requirement**: WCAG AA is legally required in many jurisdictions
- **User benefit**: 15% of users have some form of disability

**Implementation Checklist**:
- [ ] Install `eslint-plugin-jsx-a11y` (catches common a11y issues at build time)
- [ ] Add axe DevTools to test suite (automated a11y testing)
- [ ] Test all flows with keyboard only (Tab, Enter, Esc, Arrow keys)
- [ ] Verify focus indicators are visible (3:1 contrast ratio)
- [ ] Ensure all images have alt text
- [ ] Confirm form labels are always visible (not placeholder-only)
- [ ] Test with screen reader (VoiceOver on macOS/iOS)

**Best Practices**:
- Use semantic HTML (`<button>` not `<div onClick>`)
- Add ARIA labels for icon-only buttons (`<button aria-label="Delete meal">`)
- Ensure modals trap focus (can't Tab outside modal)
- Announce dynamic content with `aria-live="polite"` (toast notifications)

**Example Pattern**:
```typescript
// FoodItemEditor.tsx - Accessible form
<form onSubmit={handleSubmit} aria-labelledby="edit-form-title">
  <h2 id="edit-form-title" className="sr-only">Edit Food Item</h2>
  
  <label htmlFor="food-name" className="block text-sm font-medium">
    Food Name
  </label>
  <Input
    id="food-name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    aria-describedby="name-hint"
  />
  <p id="name-hint" className="text-sm text-gray-500">
    Original: {originalName}
  </p>

  <Button type="submit" aria-label="Save changes">
    Save
  </Button>
</form>
```

---

## Summary

All technology choices resolved:
- **React Query**: Server state management with automatic caching and optimistic updates
- **Framer Motion**: Declarative animations with accessibility support
- **shadcn/ui + Tailwind**: Design system with accessible primitives
- **Upload state machine**: Finite state machine for upload flow
- **Mobile-first responsive**: 375px → 768px → 1024px breakpoints
- **Performance optimizations**: Code splitting, lazy loading, image compression
- **Accessibility tooling**: eslint-plugin-jsx-a11y + axe DevTools + manual testing

No NEEDS CLARIFICATION items remain. Ready for Phase 1 (data model, contracts, quickstart).
