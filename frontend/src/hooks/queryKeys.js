export const queryKeys = {
    meals: {
        all: ['meals'],
        lists: () => [...queryKeys.meals.all, 'list'],
        list: (userId) => [...queryKeys.meals.lists(), { userId }],
        details: () => [...queryKeys.meals.all, 'detail'],
        detail: (mealId) => [...queryKeys.meals.details(), mealId],
    },
    goals: {
        all: ['goals'],
        lists: () => [...queryKeys.goals.all, 'list'],
        list: (userId) => [...queryKeys.goals.lists(), { userId }],
    },
    trends: {
        all: ['trends'],
        weekly: (userId) => [...queryKeys.trends.all, 'weekly', userId],
    },
};
