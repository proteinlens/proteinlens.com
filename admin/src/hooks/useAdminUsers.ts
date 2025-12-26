// Admin Users hook
// Feature: 012-admin-dashboard
// T022, T048: Hook for fetching and filtering users

import { useQuery } from '@tanstack/react-query';
import { fetchUsers, type UserListParams, type UserListResponse } from '../services/adminApi';

export function useAdminUsers(params: UserListParams = {}) {
  return useQuery<UserListResponse, Error>({
    queryKey: ['admin-users', params],
    queryFn: () => fetchUsers(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}
