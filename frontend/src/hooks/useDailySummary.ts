// useDailySummary Hook
// Feature: 001-macro-ingredients-analysis, User Story 2
// Task: T029 - Daily summary API integration

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface DailySummaryData {
  date: string;
  meals: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  percentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
  totalCalories: number;
  carbWarning: boolean;
  carbLimit: number | null;
}

export function useDailySummary(date?: string) {
  const { user } = useAuth();

  return useQuery<DailySummaryData, Error>({
    queryKey: ['daily-summary', date || 'today'],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const params = new URLSearchParams({
        userId: user.id,
        ...(date && { date }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/meals/daily-summary?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch daily summary');
      }

      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}
