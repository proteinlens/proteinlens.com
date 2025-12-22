# Quick Start Guide: ProteinLens Frontend Redesign

**Feature**: 003-frontend-redesign  
**Created**: 2025-12-22  
**Purpose**: Get developers up and running with the frontend redesign implementation

---

## Prerequisites

- **Node.js**: v25+ (project uses latest features)
- **npm**: v10+ (for package management)
- **Git**: Checkout `003-frontend-redesign` branch
- **VS Code**: Recommended editor (with ESLint + Prettier extensions)
- **Backend running**: Azure Functions backend on `localhost:7071` (for API calls)

---

## Initial Setup

### 1. Install Dependencies

```bash
cd /Users/lberton/prj/github/proteinlens.com/frontend
npm install
```

**New dependencies to add**:
```bash
# React Query for server state
npm install @tanstack/react-query @tanstack/react-query-devtools

# Framer Motion for animations
npm install framer-motion

# Charting library (lazy-loaded)
npm install recharts

# Image compression
npm install browser-image-compression

# Utility libraries
npm install clsx tailwind-merge date-fns

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D eslint-plugin-jsx-a11y
```

### 2. Install shadcn/ui Components

```bash
npx shadcn-ui@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Install needed components:
```bash
npx shadcn-ui@latest add button card input label toast skeleton
```

### 3. Configure Tailwind

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui color system
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Add custom gradient colors
        gradient: {
          from: '#8B5CF6', // Purple
          to: '#EC4899',   // Pink
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '375px',   // Mobile (iPhone SE)
        'sm': '640px',
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop
        'xl': '1280px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### 4. Update ESLint Config

Add accessibility linting in `.eslintrc.cjs`:

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended', // NEW
  ],
  plugins: ['jsx-a11y'], // NEW
  rules: {
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
  },
};
```

---

## Project Structure Tour

```
frontend/src/
├── components/          # React components (NEW: major expansion)
│   ├── home/
│   │   ├── HeroUploadCard.tsx
│   │   └── ExampleResults.tsx
│   ├── upload/
│   │   ├── UploadDropzone.tsx
│   │   ├── ImagePreview.tsx
│   │   └── AnalyzeProgress.tsx
│   ├── results/
│   │   ├── MealSummaryCard.tsx
│   │   ├── FoodItemList.tsx
│   │   └── FoodItemEditor.tsx
│   ├── coaching/
│   │   ├── ProteinGapWidget.tsx
│   │   └── SuggestionCard.tsx
│   ├── history/
│   │   ├── MealHistoryList.tsx
│   │   ├── MealHistoryCard.tsx
│   │   └── WeeklyTrendChart.tsx
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageContainer.tsx
│   └── ui/              # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── toast.tsx
│       └── skeleton.tsx
├── hooks/               # Custom React hooks (NEW)
│   ├── useUpload.ts     # Upload state machine
│   ├── useMeals.ts      # React Query hooks
│   ├── useMeal.ts
│   ├── useEditFoodItem.ts
│   ├── useDeleteMeal.ts
│   ├── useGoal.ts       # Goal management
│   ├── useProteinGap.ts # Computed gap
│   └── useWeeklyTrend.ts
├── services/            # API client + utilities (EXPAND)
│   ├── apiClient.ts     # Fetch wrapper with auth
│   ├── mealService.ts   # CRUD for meals
│   └── uploadService.ts # Blob upload + analysis
├── types/               # TypeScript interfaces (EXPAND)
│   ├── meal.ts
│   ├── goal.ts
│   └── api.ts
├── utils/               # Helpers (NEW)
│   ├── uploadStateMachine.ts
│   ├── proteinCalc.ts
│   └── cn.ts            # clsx + tailwind-merge utility
├── pages/               # Route components (NEW)
│   ├── Home.tsx
│   ├── History.tsx
│   └── Settings.tsx
├── contexts/            # React contexts (NEW)
│   └── ThemeContext.tsx
├── App.tsx              # Root component + routing
└── main.tsx             # Entry point
```

---

## Development Workflow

### Start Dev Server

```bash
npm run dev
```

Server runs on `http://localhost:5173`

### Run Tests

```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

### Build for Production

```bash
npm run build
```

Output: `frontend/dist/`

---

## Key Implementation Steps

### Phase 1: Setup & Infrastructure (Day 1)

1. **Install dependencies** (React Query, Framer Motion, shadcn/ui)
2. **Configure Tailwind** with design tokens
3. **Set up React Query** in `App.tsx`:
   ```tsx
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   
   const queryClient = new QueryClient(/* config from state.md */);
   
   function App() {
     return (
       <QueryClientProvider client={queryClient}>
         {/* Routes */}
         <ReactQueryDevtools initialIsOpen={false} />
       </QueryClientProvider>
     );
   }
   ```
4. **Create ThemeProvider** (light/dark/system modes)
5. **Set up routing** (/, /history, /settings)

### Phase 2: Upload Flow (Days 2-3)

1. **Implement upload state machine** (`useUpload` hook)
2. **Build UploadDropzone** component (drag/drop + file picker)
3. **Build ImagePreview** component (selected image with replace/remove)
4. **Build AnalyzeProgress** component (skeleton loading states)
5. **Integrate with backend API** (`uploadService.ts`)

### Phase 3: Results Display (Days 4-5)

1. **Build MealSummaryCard** (total protein, calories, macros)
2. **Build FoodItemList** (itemized foods with confidence badges)
3. **Build FoodItemEditor** (inline editing with optimistic updates)
4. **Implement useMeals hook** (React Query data fetching)
5. **Implement useEditFoodItem hook** (optimistic mutations)

### Phase 4: Coaching Widget (Day 6)

1. **Build ProteinGapWidget** (gap calculation + progress bar)
2. **Implement useProteinGap hook** (derived state from meals + goal)
3. **Add suggestion cards** (3 high-protein food recommendations)
4. **Implement quick add** (optional - add suggestion to meal)

### Phase 5: History & Trends (Days 7-8)

1. **Build MealHistoryList** (grouped by date)
2. **Build WeeklyTrendChart** (7-day bar chart with Recharts)
3. **Implement useWeeklyTrend hook** (computed trend from meals)
4. **Add lazy loading** for History route (code-splitting)

### Phase 6: Polish & Testing (Days 9-10)

1. **Add Framer Motion animations** (page transitions, card expansions)
2. **Test accessibility** (keyboard nav, screen reader, axe DevTools)
3. **Optimize performance** (Lighthouse audit, bundle size analysis)
4. **Write unit tests** (components, hooks, utilities)
5. **Run E2E tests** (upload flow, edit flow, history navigation)

---

## Testing Checklist

### Accessibility (WCAG AA)

- [ ] All interactive elements are keyboard-navigable (Tab, Enter, Esc)
- [ ] Focus states are visible (3:1 contrast ratio)
- [ ] Color contrast meets 4.5:1 for normal text, 3:1 for large text
- [ ] Images have alt text
- [ ] Form labels are always visible (not placeholder-only)
- [ ] ARIA labels on icon-only buttons
- [ ] Test with screen reader (VoiceOver on macOS)
- [ ] Run axe DevTools (zero critical violations)

### Performance

- [ ] Home page FCP < 300ms (test with Lighthouse)
- [ ] TTI < 3 seconds on simulated 3G (Lighthouse)
- [ ] Upload + analysis flow < 5 seconds
- [ ] Results display < 1 second after analysis
- [ ] Edit response < 100ms (optimistic update)
- [ ] History page load < 1 second

### Responsiveness

- [ ] Test on 375px viewport (iPhone SE)
- [ ] Test on 768px viewport (iPad)
- [ ] Test on 1024px+ viewport (desktop)
- [ ] No horizontal scrolling on any breakpoint
- [ ] Touch targets >= 44×44px on mobile

### Functionality

- [ ] Upload flow (idle → selected → uploading → analyzing → done)
- [ ] Edit food item (inline edit, optimistic update, server sync)
- [ ] Delete meal (optimistic delete, server sync)
- [ ] Protein gap calculation (accurate, updates in real-time)
- [ ] Weekly trend chart (7 days, correct totals)
- [ ] Dark mode (toggle works, proper contrast)

---

## Common Tasks

### Add a New Component

```bash
# Create component file
touch src/components/upload/NewComponent.tsx

# Create test file
touch src/components/upload/NewComponent.test.tsx
```

**Template**:
```tsx
// NewComponent.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
};
```

### Add a New shadcn/ui Component

```bash
npx shadcn-ui@latest add [component-name]
```

Example: `npx shadcn-ui@latest add dialog`

### Add a New Route

1. Create page component in `src/pages/`
2. Add route to `App.tsx`:
   ```tsx
   import { NewPage } from './pages/NewPage';
   
   const NewPageLazy = React.lazy(() => import('./pages/NewPage'));
   
   <Route path="/new" element={<NewPageLazy />} />
   ```
3. Add nav item to `BottomNav.tsx` and `Sidebar.tsx`

---

## Troubleshooting

### Issue: React Query not fetching data

**Solution**: Check network tab. Ensure backend is running on `localhost:7071`. Verify `apiClient.ts` base URL.

### Issue: Tailwind classes not working

**Solution**: Run `npm run dev` to restart Vite. Check `tailwind.config.js` content paths include your component directory.

### Issue: Dark mode not applying

**Solution**: Verify `ThemeProvider` is wrapping `App`. Check `document.documentElement.classList.toggle('dark')` is working.

### Issue: Framer Motion animations not smooth

**Solution**: Use CSS transforms (x, y, scale, opacity) only. Avoid animating width/height. Check `transition={{ duration: 0.3 }}` is set.

### Issue: Upload state machine stuck

**Solution**: Check reducer logic. Log state transitions. Ensure actions match expected types. Verify `dispatch` is called with correct action.

---

## Resources

- **React Query Docs**: https://tanstack.com/query/latest
- **Framer Motion Docs**: https://www.framer.com/motion/
- **shadcn/ui Components**: https://ui.shadcn.com/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Recharts Docs**: https://recharts.org/
- **WCAG AA Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa

---

## Next Steps

After setup:
1. Read [research.md](research.md) for best practices
2. Read [data-model.md](data-model.md) for TypeScript interfaces
3. Read [contracts/routes.md](contracts/routes.md) for route definitions
4. Read [contracts/components.md](contracts/components.md) for component specs
5. Read [contracts/state.md](contracts/state.md) for state management patterns
6. Start implementing Phase 1 (Setup & Infrastructure)

Happy coding! 🚀
