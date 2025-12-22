import { useMemo } from 'react';
import { useMeals } from './useMeal';
import type { Meal } from '@/types/meal';
import type { ProteinGap } from '@/types/goal';

interface UseProteinGapParams {
  userId: string;
  dailyGoalGrams: number;
}

/**
 * Calculate protein gap for today
 * Returns gap between daily goal and consumed protein
 */
export const useProteinGap = ({ userId, dailyGoalGrams }: UseProteinGapParams): ProteinGap => {
  const { data: meals = [], isLoading } = useMeals(userId);

  const gap = useMemo(() => {
    if (isLoading) {
      return {
        goalGrams: dailyGoalGrams,
        consumedGrams: 0,
        gapGrams: dailyGoalGrams,
        percentComplete: 0,
        isMet: false,
      };
    }

    // Filter meals from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysMeals = meals.filter((meal: any) => {
      const mealDate = new Date(meal.uploadedAt);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === today.getTime();
    });

    // Sum protein from today's meals
    const consumedGrams = todaysMeals.reduce((sum: number, meal: any) => {
      return sum + (meal.analysis?.totalProtein || 0);
    }, 0);

    const gapGrams = Math.max(0, dailyGoalGrams - consumedGrams);
    const percentComplete = Math.min(100, Math.round((consumedGrams / dailyGoalGrams) * 100));
    const isMet = consumedGrams >= dailyGoalGrams;

    return {
      goalGrams: dailyGoalGrams,
      consumedGrams,
      gapGrams,
      percentComplete,
      isMet,
    };
  }, [meals, dailyGoalGrams, isLoading]);

  return gap;
};
