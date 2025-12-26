// Suspend/Reactivate User mutation hooks
// Feature: 012-admin-dashboard
// T066: Hooks for suspend and reactivate mutations

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  suspendUser, 
  reactivateUser, 
  type SuspendUserParams, 
  type SuspendUserResponse,
  type ReactivateUserResponse 
} from '../services/adminApi';

export function useSuspendUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<SuspendUserResponse, Error, SuspendUserParams>({
    mutationFn: (data) => suspendUser(userId, data),
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
}

export function useReactivateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<ReactivateUserResponse, Error, void>({
    mutationFn: () => reactivateUser(userId),
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
}
