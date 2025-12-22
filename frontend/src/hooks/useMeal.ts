import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/apiClient'
import { queryKeys } from './queryKeys'
import type { Meal } from '@/types/meal'

export function useMeals(userId?: string) {
  return useQuery({
    queryKey: userId ? queryKeys.meals.list(userId) : queryKeys.meals.all,
    queryFn: async () => {
      if (!userId) return []
      return apiClient.getMealHistory(userId)
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes (previously cacheTime)
    enabled: !!userId,
  })
}

export function useMeal(mealId?: string) {
  return useQuery({
    queryKey: mealId ? queryKeys.meals.detail(mealId) : ['meal'],
    queryFn: async () => {
      if (!mealId) throw new Error('mealId is required')
      // Would need a getMeal endpoint
      return null
    },
    enabled: !!mealId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useDeleteMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mealId: string) => {
      return apiClient.deleteMeal(mealId)
    },
    onMutate: async (mealId: string) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.meals.all })

      // Optimistically update all meals lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.meals.lists() },
        (old: any) => {
          if (Array.isArray(old)) {
            return old.filter((meal: any) => meal.mealId !== mealId)
          }
          return old
        }
      )

      return { mealId }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.all })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.all })
    },
  })
}
