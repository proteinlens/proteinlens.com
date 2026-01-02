// useExportMeals Hook
// Feature: 001-macro-ingredients-analysis, User Story 3
// Task: T035 - Export data API integration

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthProvider';

interface ExportMealsRequest {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export function useExportMeals() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (options?: ExportMealsRequest) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const params = new URLSearchParams({
        userId: user.id,
        ...(options?.startDate && { startDate: options.startDate }),
        ...(options?.endDate && { endDate: options.endDate }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/meals/export?${params}`,
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
        throw new Error(errorData.message || 'Failed to export meals');
      }

      return response.json();
    },
  });
}

/**
 * Utility to download exported data as JSON file
 */
export function downloadExportedData(data: any, filename?: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename || `meals-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
