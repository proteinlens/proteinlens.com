# State Management Contracts: ProteinLens Frontend Redesign

**Feature**: 003-frontend-redesign  
**Created**: 2025-12-22  
**Purpose**: Define state machines, React Query setup, and local state patterns

---

## Upload State Machine

### State Definition

```typescript
type UploadState =
  | { status: 'idle' }
  | { status: 'selected'; file: File; preview: string }
  | { status: 'uploading'; file: File; progress: number }
  | { status: 'analyzing'; blobUrl: string }
  | { status: 'done'; mealId: string }
  | { status: 'error'; message: string; retryable: boolean };

type UploadAction =
  | { type: 'SELECT'; file: File; preview: string }
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_PROGRESS'; progress: number }
  | { type: 'UPLOAD_COMPLETE'; blobUrl: string }
  | { type: 'ANALYZE_START' }
  | { type: 'ANALYZE_COMPLETE'; mealId: string }
  | { type: 'ERROR'; message: string; retryable: boolean }
  | { type: 'RETRY' }
  | { type: 'RESET' };
```

### State Transitions

```
Valid Transitions:
idle → selected (user picks file)
selected → uploading (user taps "Analyze")
uploading → analyzing (upload complete)
uploading → error (network failure, retryable=true)
analyzing → done (analysis complete)
analyzing → error (AI timeout, retryable=true)
error → uploading (user taps "Retry" and retryable=true)
any → idle (user taps "Cancel" or "Start Over")

Invalid Transitions (should never occur):
idle → uploading (must select file first)
selected → analyzing (must upload first)
analyzing → uploading (no backwards flow)
```

### Reducer Implementation

```typescript
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
      if (action.type === 'RESET') {
        URL.revokeObjectURL(state.preview); // Clean up blob URL
        return { status: 'idle' };
      }
      break;

    case 'uploading':
      if (action.type === 'UPLOAD_PROGRESS') {
        return { ...state, progress: action.progress };
      }
      if (action.type === 'UPLOAD_COMPLETE') {
        return { status: 'analyzing', blobUrl: action.blobUrl };
      }
      if (action.type === 'ERROR') {
        return { status: 'error', message: action.message, retryable: action.retryable };
      }
      break;

    case 'analyzing':
      if (action.type === 'ANALYZE_COMPLETE') {
        return { status: 'done', mealId: action.mealId };
      }
      if (action.type === 'ERROR') {
        return { status: 'error', message: action.message, retryable: action.retryable };
      }
      break;

    case 'error':
      if (action.type === 'RETRY' && state.retryable) {
        return { status: 'idle' }; // Start over
      }
      if (action.type === 'RESET') {
        return { status: 'idle' };
      }
      break;

    case 'done':
      if (action.type === 'RESET') {
        return { status: 'idle' };
      }
      break;
  }

  console.warn('Invalid state transition:', state, action);
  return state; // No-op for invalid transitions
};
```

### Hook Usage

```typescript
// useUpload.ts
export const useUpload = () => {
  const [state, dispatch] = useReducer(uploadReducer, { status: 'idle' });
  
  const selectFile = (file: File) => {
    const preview = URL.createObjectURL(file);
    dispatch({ type: 'SELECT', file, preview });
  };

  const startUpload = async () => {
    if (state.status !== 'selected') return;
    
    dispatch({ type: 'UPLOAD_START' });
    
    try {
      const result = await uploadService.upload(state.file, (progress) => {
        dispatch({ type: 'UPLOAD_PROGRESS', progress });
      });
      
      dispatch({ type: 'UPLOAD_COMPLETE', blobUrl: result.blobUrl });
      dispatch({ type: 'ANALYZE_START' });
      
      // Analysis happens server-side, poll for completion
      const meal = await uploadService.pollAnalysis(result.blobUrl);
      dispatch({ type: 'ANALYZE_COMPLETE', mealId: meal.id });
      
    } catch (error) {
      const retryable = error instanceof NetworkError;
      dispatch({ 
        type: 'ERROR', 
        message: error.message, 
        retryable 
      });
    }
  };

  const reset = () => dispatch({ type: 'RESET' });
  const retry = () => dispatch({ type: 'RETRY' });

  return { state, selectFile, startUpload, reset, retry };
};
```

---

## React Query Configuration

### QueryClient Setup

```typescript
// queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute (data is fresh for 1 min)
      cacheTime: 5 * 60 * 1000,    // 5 minutes (cache persists for 5 min)
      retry: 3,                     // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),  // Exponential backoff
      refetchOnWindowFocus: false, // Don't refetch on tab focus (avoid unnecessary requests)
    },
    mutations: {
      retry: 1,                     // Retry mutations once
    },
  },
});
```

### Query Keys

```typescript
// queryKeys.ts
export const queryKeys = {
  meals: {
    all: ['meals'] as const,
    byId: (id: string) => ['meals', id] as const,
    byDate: (date: Date) => ['meals', 'byDate', date.toISOString()] as const,
  },
  goal: {
    current: ['goal'] as const,
  },
  gap: {
    today: ['gap', 'today'] as const,
  },
} as const;
```

---

## React Query Hooks

### useMeals (Fetch All Meals)

```typescript
// useMeals.ts
import { useQuery } from '@tanstack/react-query';
import { mealService } from '@/services/mealService';
import { queryKeys } from './queryKeys';

export const useMeals = (params?: { startDate?: Date; endDate?: Date }) => {
  return useQuery({
    queryKey: params 
      ? [...queryKeys.meals.all, params]
      : queryKeys.meals.all,
    queryFn: () => mealService.getAll(params),
    staleTime: 60 * 1000, // 1 minute
  });
};
```

### useMeal (Fetch Single Meal)

```typescript
// useMeal.ts
import { useQuery } from '@tanstack/react-query';
import { mealService } from '@/services/mealService';
import { queryKeys } from './queryKeys';

export const useMeal = (id: string) => {
  return useQuery({
    queryKey: queryKeys.meals.byId(id),
    queryFn: () => mealService.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes (meals don't change often)
    enabled: !!id, // Only run if id is provided
  });
};
```

### useEditFoodItem (Optimistic Update)

```typescript
// useEditFoodItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mealService } from '@/services/mealService';
import { queryKeys } from './queryKeys';

export const useEditFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditFoodItemRequest) => mealService.editFoodItem(data),
    
    // Optimistic update (instant UI feedback)
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.meals.byId(newData.mealId) });

      // Snapshot previous value
      const previous = queryClient.getQueryData<Meal>(queryKeys.meals.byId(newData.mealId));

      // Optimistically update cache
      queryClient.setQueryData<Meal>(queryKeys.meals.byId(newData.mealId), (old) => {
        if (!old) return old;
        return {
          ...old,
          analysis: {
            ...old.analysis,
            foodItems: old.analysis.foodItems.map(item =>
              item.id === newData.foodItemId
                ? { ...item, ...newData.updates, isEdited: true }
                : item
            ),
            totalProtein: calculateTotalProtein(old.analysis.foodItems, newData),
          },
        };
      });

      return { previous };
    },

    // Rollback on error
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.meals.byId(newData.mealId), context.previous);
      }
    },

    // Refetch after success (ensure server state is correct)
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.byId(variables.mealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.all });
    },
  });
};

// Helper to recalculate total protein
const calculateTotalProtein = (items: FoodItem[], update: EditFoodItemRequest): number => {
  return items.reduce((sum, item) => {
    if (item.id === update.foodItemId && update.updates.proteinGrams !== undefined) {
      return sum + update.updates.proteinGrams;
    }
    return sum + item.proteinGrams;
  }, 0);
};
```

### useDeleteMeal (Optimistic Delete)

```typescript
// useDeleteMeal.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mealService } from '@/services/mealService';
import { queryKeys } from './queryKeys';

export const useDeleteMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealId: string) => mealService.delete(mealId),
    
    onMutate: async (mealId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.meals.all });
      const previous = queryClient.getQueryData<Meal[]>(queryKeys.meals.all);

      // Optimistically remove from list
      queryClient.setQueryData<Meal[]>(queryKeys.meals.all, (old) =>
        old ? old.filter(m => m.id !== mealId) : []
      );

      return { previous };
    },

    onError: (err, mealId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.meals.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.all });
    },
  });
};
```

---

## Local State Patterns

### Goal State (localStorage + React Query)

```typescript
// useGoal.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

const GOAL_STORAGE_KEY = 'proteinlens:goal';

export const useGoal = () => {
  const queryClient = useQueryClient();

  // Load goal from localStorage (fallback to 150g)
  const { data: goal = 150 } = useQuery({
    queryKey: queryKeys.goal.current,
    queryFn: () => {
      const stored = localStorage.getItem(GOAL_STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 150;
    },
    staleTime: Infinity, // Goal rarely changes
  });

  // Update goal (persist to localStorage + backend)
  const setGoal = useMutation({
    mutationFn: async (newGoal: number) => {
      localStorage.setItem(GOAL_STORAGE_KEY, newGoal.toString());
      // Optionally sync to backend
      // await goalService.update(newGoal);
      return newGoal;
    },
    onSuccess: (newGoal) => {
      queryClient.setQueryData(queryKeys.goal.current, newGoal);
      queryClient.invalidateQueries({ queryKey: queryKeys.gap.today }); // Recalculate gap
    },
  });

  return { goal, setGoal: setGoal.mutateAsync };
};
```

### Theme State (Context + localStorage)

```typescript
// ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark'; // Resolved theme (system → light/dark)
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('proteinlens:theme');
    return (stored as Theme) || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Determine effective theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');

      const listener = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    // Apply theme to DOM
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, [effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('proteinlens:theme', newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

---

## Computed State (Derived Values)

### useProteinGap (Derived from Meals + Goal)

```typescript
// useProteinGap.ts
import { useMemo } from 'react';
import { useMeals } from './useMeals';
import { useGoal } from './useGoal';

export const useProteinGap = () => {
  const { data: meals = [] } = useMeals();
  const { goal } = useGoal();

  const gap = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaysMeals = meals.filter(m =>
      new Date(m.uploadedAt).setHours(0, 0, 0, 0) === today
    );

    const consumed = todaysMeals.reduce((sum, m) => sum + m.analysis.totalProtein, 0);
    const gapGrams = goal - consumed;

    return {
      goalGrams: goal,
      consumedGrams: consumed,
      gapGrams,
      percentComplete: Math.min(100, (consumed / goal) * 100),
      isMet: gapGrams <= 0,
      lastMealAt: todaysMeals.length > 0
        ? new Date(Math.max(...todaysMeals.map(m => new Date(m.uploadedAt).getTime())))
        : undefined,
    };
  }, [meals, goal]);

  return gap;
};
```

### useWeeklyTrend (Derived from Meals)

```typescript
// useWeeklyTrend.ts
import { useMemo } from 'react';
import { useMeals } from './useMeals';

export const useWeeklyTrend = () => {
  const { data: meals = [] } = useMeals();

  const trend = useMemo(() => {
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
  }, [meals]);

  return trend;
};
```

---

## Summary

State management defined:
- **Upload state machine**: 6 states, 9 actions, deterministic transitions
- **React Query setup**: QueryClient config, query keys, 5 hooks (fetch, edit, delete)
- **Optimistic updates**: Instant UI feedback for edits/deletes, rollback on error
- **Local state**: Goal (localStorage), Theme (Context + localStorage)
- **Computed state**: ProteinGap, WeeklyTrend (derived from meals + goal)

All state is type-safe (TypeScript), testable (pure functions), and follows React best practices.
