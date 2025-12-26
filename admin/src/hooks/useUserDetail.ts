// User Detail hook
// Feature: 012-admin-dashboard
// T029: Hook for fetching user details

import { useQuery } from '@tanstack/react-query';
import { fetchUserDetail, type UserDetail } from '../services/adminApi';

export function useUserDetail(userId: string | undefined) {
  return useQuery<UserDetail, Error>({
    queryKey: ['admin-user', userId],
    queryFn: () => fetchUserDetail(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}
