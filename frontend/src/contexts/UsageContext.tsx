// Context to provide refresh capability for usage data
// Allows components to trigger a refresh after quota-affecting actions (like meal analysis)

import React, { createContext, useContext, useCallback } from 'react';
import { useUsage } from '../hooks/useUsage';
import { getUserId } from '../utils/userId';

interface UsageContextType {
  refresh: () => Promise<void>;
}

const UsageContext = createContext<UsageContextType | null>(null);

/**
 * Provider component that wraps the app and provides usage refresh capability
 */
export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userId = getUserId();
  const { refresh } = useUsage(userId, true);

  return (
    <UsageContext.Provider value={{ refresh }}>
      {children}
    </UsageContext.Provider>
  );
};

/**
 * Hook to access usage refresh capability
 * Use this to refresh usage data after quota-affecting actions
 */
export function useRefreshUsage() {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error('useRefreshUsage must be used within UsageProvider');
  }
  return context;
}
