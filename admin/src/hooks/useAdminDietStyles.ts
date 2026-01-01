// Admin Diet Styles hooks
// Feature: 017-shareable-meals-diets
// T043: Hooks for managing diet style configurations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDietStyles,
  createDietStyle,
  updateDietStyle,
  deleteDietStyle,
  type DietStyleListResponse,
  type DietStyleCreateParams,
  type DietStyleUpdateParams,
  type DietStyleResponse,
} from '../services/adminApi';

export function useAdminDietStyles() {
  return useQuery<DietStyleListResponse, Error>({
    queryKey: ['admin-diet-styles'],
    queryFn: fetchDietStyles,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateDietStyle() {
  const queryClient = useQueryClient();

  return useMutation<DietStyleResponse, Error, DietStyleCreateParams>({
    mutationFn: createDietStyle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-diet-styles'] });
    },
  });
}

export function useUpdateDietStyle() {
  const queryClient = useQueryClient();

  return useMutation<DietStyleResponse, Error, { id: string; params: DietStyleUpdateParams }>({
    mutationFn: ({ id, params }) => updateDietStyle(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-diet-styles'] });
    },
  });
}

export function useDeleteDietStyle() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: deleteDietStyle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-diet-styles'] });
    },
  });
}
