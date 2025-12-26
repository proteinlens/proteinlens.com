// Audit Log hook
// Feature: 012-admin-dashboard
// T072: Hook for fetching audit log

import { useQuery } from '@tanstack/react-query';
import { fetchAuditLog, type AuditLogParams, type AuditLogResponse } from '../services/adminApi';

export function useAuditLog(params: AuditLogParams = {}) {
  return useQuery<AuditLogResponse, Error>({
    queryKey: ['admin-audit-log', params],
    queryFn: () => fetchAuditLog(params),
    staleTime: 30 * 1000,
  });
}
