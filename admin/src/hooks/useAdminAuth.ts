// Admin auth hook
// Feature: 012-admin-dashboard
// T026: Admin auth check hook

import { useState, useEffect } from 'react';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  adminEmail: string | null;
}

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null,
    adminEmail: null,
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        // In production, this would verify with Azure AD or similar
        // For now, check if admin email is set
        const adminEmail = localStorage.getItem('adminEmail') || 
                          import.meta.env.VITE_ADMIN_EMAIL;
        
        if (adminEmail) {
          setState({
            isAdmin: true,
            isLoading: false,
            error: null,
            adminEmail,
          });
        } else {
          setState({
            isAdmin: false,
            isLoading: false,
            error: null,
            adminEmail: null,
          });
        }
      } catch (error) {
        setState({
          isAdmin: false,
          isLoading: false,
          error: error as Error,
          adminEmail: null,
        });
      }
    }

    checkAuth();
  }, []);

  return state;
}

export function setAdminEmail(email: string): void {
  localStorage.setItem('adminEmail', email);
}

export function clearAdminEmail(): void {
  localStorage.removeItem('adminEmail');
}
