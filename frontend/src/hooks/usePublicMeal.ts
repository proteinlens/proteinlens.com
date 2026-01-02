/**
 * Hook for prefetching and fetching public meal data
 * Speeds up page load when user navigates to a shared meal URL
 */

import { useQueryClient, useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_PATH = `${API_BASE_URL}/api`;

/**
 * Prefetch a public meal's data
 * Call this before navigating to the meal page for instant load
 */
export function usePrefetchMeal() {
  const queryClient = useQueryClient();

  return (shareId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['publicMeal', shareId],
      queryFn: async () => {
        const response = await fetch(`${API_PATH}/meals/${shareId}/public`, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch meal');
        return response.json();
      },
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  };
}

/**
 * Hook to fetch public meal data with React Query
 */
export function usePublicMeal(shareId: string | undefined) {
  return useQuery({
    queryKey: ['publicMeal', shareId],
    queryFn: async () => {
      if (!shareId) throw new Error('No shareId');
      
      const response = await fetch(`${API_PATH}/meals/${shareId}/public`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch meal');
      return response.json();
    },
    enabled: !!shareId,
    staleTime: 1000 * 60 * 60, // 1 hour - meals don't change
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
}
