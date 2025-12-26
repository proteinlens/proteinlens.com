// Plan Override mutation hook
// Feature: 012-admin-dashboard
// T058: Hook for plan override mutation

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { overrideUserPlan, type PlanOverrideParams, type PlanOverrideResponse } from '../services/adminApi';

export function usePlanOverride(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<PlanOverrideResponse, Error, PlanOverrideParams>({
    mutationFn: (data) => overrideUserPlan(userId, data),
    onSuccess: () => {
      // Invalidate user queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
}
