export const queryKeys = {
  meals: {
    all: ['meals'] as const,
    lists: () => [...queryKeys.meals.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.meals.lists(), { userId }] as const,
    details: () => [...queryKeys.meals.all, 'detail'] as const,
    detail: (mealId: string) => [...queryKeys.meals.details(), mealId] as const,
  },
  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeys.goals.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.goals.lists(), { userId }] as const,
  },
  trends: {
    all: ['trends'] as const,
    weekly: (userId: string) => [...queryKeys.trends.all, 'weekly', userId] as const,
  },
} as const
