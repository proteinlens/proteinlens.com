// Admin Meals hook
// Feature: 012-admin-dashboard
// Hook for fetching and filtering analyzed meals

import { useQuery } from '@tanstack/react-query';
import { fetchMeals, fetchMealDetail, type MealListParams, type MealsListResponse, type MealDetailResponse } from '../services/adminApi';

export function useAdminMeals(params: MealListParams = {}) {
  return useQuery<MealsListResponse, Error>({
    queryKey: ['admin-meals', params],
    queryFn: () => fetchMeals(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAdminMealDetail(mealId: string | undefined) {
  return useQuery<MealDetailResponse, Error>({
    queryKey: ['admin-meal', mealId],
    queryFn: () => fetchMealDetail(mealId!),
    enabled: !!mealId,
    staleTime: 30 * 1000,
  });
}
