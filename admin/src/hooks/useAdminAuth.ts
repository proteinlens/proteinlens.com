// Admin auth hook
// Feature: 012-admin-dashboard
// T026: Admin auth check hook

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  adminEmail: string | null;
  needsLogin: boolean;
}

export function useAdminAuth(): AdminAuthState & { recheckAuth: (token?: string) => void } {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null,
    adminEmail: null,
    needsLogin: false,
  });
  
  const [checkTrigger, setCheckTrigger] = useState(0);
  // Store token passed from login for immediate use
  const pendingTokenRef = useRef<string | null>(null);

  const recheckAuth = useCallback((token?: string) => {
    // If token is passed directly, store it for immediate use
    if (token) {
      pendingTokenRef.current = token;
    }
    setCheckTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Small delay to ensure localStorage is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // Use pending token if available, otherwise get from localStorage
        let accessToken = pendingTokenRef.current;
        if (!accessToken) {
          accessToken = localStorage.getItem('proteinlens_access_token');
        }
        // Clear the pending token after use
        pendingTokenRef.current = null;
        
        if (!accessToken) {
          setState({
            isAdmin: false,
            isLoading: false,
            error: null,
            adminEmail: null,
            needsLogin: true,
          });
          return;
        }
        
        // Call /api/me to get user profile
        // Build auth header explicitly - must be a string concatenation, not template literal issue
        const authHeader = 'Bearer ' + accessToken;
        
        const meResponse = await fetch(`${API_BASE}/api/me`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('[useAdminAuth] /api/me response:', meResponse.status);
        
        if (!meResponse.ok) {
          // Token might be expired, clear and ask for login
          localStorage.removeItem('proteinlens_access_token');
          localStorage.removeItem('proteinlens_refresh_token');
          localStorage.removeItem('proteinlens_token_expiry');
          setState({
            isAdmin: false,
            isLoading: false,
            error: null,
            adminEmail: null,
            needsLogin: true,
          });
          return;
        }
        
        const user = await meResponse.json();
        const userEmail = user.email;
        
        if (!userEmail) {
          setState({
            isAdmin: false,
            isLoading: false,
            error: new Error('No email found in user profile'),
            adminEmail: null,
            needsLogin: false,
          });
          return;
        }
        
        // Store admin email for API calls
        localStorage.setItem('adminEmail', userEmail);
        
        // Try to call an admin endpoint to verify admin access
        const adminAuthHeader = 'Bearer ' + accessToken;
        
        const adminCheckResponse = await fetch(`${API_BASE}/api/dashboard/users?limit=1`, {
          method: 'GET',
          headers: {
            'Authorization': adminAuthHeader,
            'Content-Type': 'application/json',
            'x-admin-email': userEmail,
          },
        });
        
        if (adminCheckResponse.ok) {
          setState({
            isAdmin: true,
            isLoading: false,
            error: null,
            adminEmail: userEmail,
            needsLogin: false,
          });
        } else if (adminCheckResponse.status === 403) {
          setState({
            isAdmin: false,
            isLoading: false,
            error: null,
            adminEmail: null,
            needsLogin: false,
          });
        } else {
          const errorData = await adminCheckResponse.json().catch(() => ({}));
          setState({
            isAdmin: false,
            isLoading: false,
            error: new Error(errorData.message || 'Failed to verify admin access'),
            adminEmail: null,
            needsLogin: false,
          });
        }
      } catch (error) {
        setState({
          isAdmin: false,
          isLoading: false,
          error: error as Error,
          adminEmail: null,
          needsLogin: false,
        });
      }
    }

    checkAuth();
  }, [checkTrigger]);

  return { ...state, recheckAuth };
}

export function setAdminEmail(email: string): void {
  localStorage.setItem('adminEmail', email);
}

export function clearAdminEmail(): void {
  localStorage.removeItem('adminEmail');
}
