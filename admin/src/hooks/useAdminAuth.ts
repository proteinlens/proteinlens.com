// Admin auth hook
// Feature: 012-admin-dashboard
// T026: Admin auth check hook

import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  adminEmail: string | null;
  needsLogin: boolean;
}

export function useAdminAuth(): AdminAuthState & { recheckAuth: () => void } {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null,
    adminEmail: null,
    needsLogin: false,
  });
  
  const [checkTrigger, setCheckTrigger] = useState(0);

  const recheckAuth = useCallback(() => {
    setCheckTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Get access token from localStorage
        const accessToken = localStorage.getItem('proteinlens_access_token');
        console.log('[useAdminAuth] Checking token:', accessToken ? 'present' : 'missing');
        
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
        console.log('[useAdminAuth] Calling /api/me with token');
        const meResponse = await fetch(`${API_BASE}/api/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
        const adminCheckResponse = await fetch(`${API_BASE}/api/admin/users?limit=1`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
