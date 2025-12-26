// Metrics hook
// Feature: 012-admin-dashboard
// T039: Hook for fetching platform metrics

import { useQuery } from '@tanstack/react-query';
import { fetchMetrics, type MetricsResponse } from '../services/adminApi';

export function useMetrics() {
  return useQuery<MetricsResponse, Error>({
    queryKey: ['admin-metrics'],
    queryFn: fetchMetrics,
    staleTime: 60 * 1000, // 1 minute
  });
}
