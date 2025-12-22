// Hook for managing usage state
// Feature: 002-saas-billing, User Story 3

import { useState, useEffect, useCallback } from 'react';
import { getUsage, UsageStats } from '../services/billingApi';

interface UseUsageResult {
  usage: UsageStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isUnlimited: boolean;
  canScan: boolean;
}

/**
 * Hook for fetching and managing user usage state
 * @param userId - User identifier (required for API calls)
 * @param autoRefresh - Whether to auto-refresh on mount
 */
export function useUsage(userId: string | null, autoRefresh = true): UseUsageResult {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setUsage(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getUsage();
      setUsage(data);
    } catch (err) {
      setError('Failed to fetch usage data');
      console.error('Usage fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoRefresh && userId) {
      refresh();
    }
  }, [userId, autoRefresh, refresh]);

  const isUnlimited = usage?.scansRemaining === -1;
  const canScan = isUnlimited || (usage?.scansRemaining ?? 0) > 0;

  return {
    usage,
    loading,
    error,
    refresh,
    isUnlimited,
    canScan,
  };
}

export default useUsage;
