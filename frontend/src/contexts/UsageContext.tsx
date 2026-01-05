// Context to provide shared usage state and refresh capability
// Ensures all components use the same useUsage instance

import React, { createContext, useContext } from 'react';
import { useUsage } from '../hooks/useUsage';
import { getUserId } from '../utils/userId';
import { UsageStats } from '../services/billingApi';

interface UsageContextType {
  usage: UsageStats | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const UsageContext = createContext<UsageContextType | null>(null);

/**
 * Provider component that wraps the app and provides shared usage state
 */
export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userId = getUserId();
  const { usage, loading, refresh } = useUsage(userId, true);

  return (
    <UsageContext.Provider value={{ usage, loading, refresh }}>
      {children}
    </UsageContext.Provider>
  );
};

/**
 * Hook to access shared usage state and refresh capability
 * All components should use this instead of calling useUsage directly
 */
export function useSharedUsage() {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error('useSharedUsage must be used within UsageProvider');
  }
  return context;
}
