import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { FoodItem, Meal } from '@/types/meal';

interface EditFoodItemParams {
  mealId: string;
  foodItemId: string;
  updates: {
    name?: string;
    portion?: string;
    proteinGrams?: number;
  };
}

interface EditFoodItemResponse {
  success: boolean;
  foodItem: FoodItem;
  meal: Meal;
}

// Mock API call - replace with actual backend integration
const editFoodItem = async (params: EditFoodItemParams): Promise<EditFoodItemResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock success response
  return {
    success: true,
    foodItem: {
      id: params.foodItemId,
      mealId: params.mealId,
      name: params.updates.name || 'Updated Food',
      portion: params.updates.portion || '1 serving',
      proteinGrams: params.updates.proteinGrams || 0,
      confidence: 100, // Manual edits have 100% confidence
      aiDetected: false,
      isEdited: true,
    },
    meal: {
      id: params.mealId,
      userId: 'mock-user',
      imageUrl: 'mock-url',
      uploadedAt: new Date().toISOString(),
      analysis: {
        foods: [],
        totalProtein: 0,
      },
      corrections: [],
    },
  };
};

export const useEditFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editFoodItem,
    
    // Optimistic update - instant UI feedback
    onMutate: async (params: EditFoodItemParams) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.meals.detail(params.mealId) });

      // Snapshot previous value for rollback
      const previousMeal = queryClient.getQueryData<Meal>(queryKeys.meals.detail(params.mealId));

      // Optimistically update meal data
      queryClient.setQueryData<Meal>(queryKeys.meals.detail(params.mealId), (old) => {
        if (!old) return old;

        const updatedFoods = old.analysis.foods.map((food) => {
          if (food.id === params.foodItemId) {
            return {
              ...food,
              ...params.updates,
              isEdited: true,
              confidence: 100, // Manual edits have 100% confidence
            };
          }
          return food;
        });

        // Recalculate total protein
        const totalProtein = updatedFoods.reduce((sum, food) => sum + food.proteinGrams, 0);

        return {
          ...old,
          analysis: {
            ...old.analysis,
            foods: updatedFoods,
            totalProtein,
          },
        };
      });

      // Also update meals list if cached
      queryClient.setQueryData<Meal[]>(queryKeys.meals.all, (old) => {
        if (!old) return old;
        return old.map((meal) => {
          if (meal.id === params.mealId) {
            const updatedFoods = meal.analysis.foods.map((food) => {
              if (food.id === params.foodItemId) {
                return {
                  ...food,
                  ...params.updates,
                  isEdited: true,
                  confidence: 100,
                };
              }
              return food;
            });
            const totalProtein = updatedFoods.reduce((sum, food) => sum + food.proteinGrams, 0);
            return {
              ...meal,
              analysis: {
                ...meal.analysis,
                foods: updatedFoods,
                totalProtein,
              },
            };
          }
          return meal;
        });
      });

      return { previousMeal };
    },

    // Rollback on error
    onError: (err, params, context) => {
      if (context?.previousMeal) {
        queryClient.setQueryData(queryKeys.meals.detail(params.mealId), context.previousMeal);
      }
      console.error('Failed to edit food item:', err);
    },

    // Refetch on success to ensure consistency
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.detail(params.mealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.all });
    },
  });
};
