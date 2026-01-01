/**
 * Feature 017: Diet Styles Hook
 * T033: React Query hooks for diet style operations
 * T048: Daily summary hook for macro display
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dietApi, DietStyle, DailySummary } from '@/services/dietApi';

/**
 * Get all active diet styles
 * Cached for 5 minutes since diet styles rarely change
 */
export function useDietStyles() {
  return useQuery({
    queryKey: ['dietStyles'],
    queryFn: async () => {
      return dietApi.getDietStyles();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Update user's selected diet style
 */
export function useUpdateDietStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dietStyleId: string | null) => {
      return dietApi.updateUserDietStyle(dietStyleId);
    },
    onSuccess: (data) => {
      // Invalidate user profile to reflect new diet style
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/**
 * Get diet style by ID from cached list
 */
export function useDietStyleById(id: string | null | undefined) {
  const { data: dietStyles } = useDietStyles();
  
  if (!id || !dietStyles) {
    return null;
  }
  
  return dietStyles.find(style => style.id === id) || null;
}

/**
 * Get diet style by slug from cached list
 */
export function useDietStyleBySlug(slug: string | null | undefined) {
  const { data: dietStyles } = useDietStyles();
  
  if (!slug || !dietStyles) {
    return null;
  }
  
  return dietStyles.find(style => style.slug === slug) || null;
}

export type { DietStyle };
export type { DailySummary };

/**
 * Get daily macro summary
 * Feature 017, US5: Macro Split Display
 * Refetches every minute to keep data fresh
 */
export function useDailySummary(date?: string) {
  return useQuery({
    queryKey: ['dailySummary', date || 'today'],
    queryFn: async () => {
      return dietApi.getDailySummary(date);
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}
