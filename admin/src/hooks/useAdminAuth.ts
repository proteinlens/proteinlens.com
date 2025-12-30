// Admin auth hook
// Feature: 012-admin-dashboard
// T026: Admin auth check hook

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
        // Get access token from localStorage (shared with main frontend)
        const accessToken = localStorage.getItem('proteinlens_access_token');
        
        if (!accessToken) {
          setState({
            isAdmin: false,
            isLoading: false,
            error: new Error('Not authenticated. Please login at proteinlens.com first.'),
            adminEmail: null,
          });
          return;
        }
        
        // Call /api/me to get user profile
        const meResponse = await fetch(`${API_BASE}/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (!meResponse.ok) {
          setState({
            isAdmin: false,
            isLoading: false,
            error: new Error('Authentication failed. Please login at proteinlens.com'),
            adminEmail: null,
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
          });
          return;
        }
        
        // Store admin email for API calls
        localStorage.setItem('adminEmail', userEmail);
        
        // Try to call an admin endpoint to verify admin access
        const adminCheckResponse = await fetch(`${API_BASE}/admin/users?limit=1`, {
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
          });
        } else if (adminCheckResponse.status === 403) {
          setState({
            isAdmin: false,
            isLoading: false,
            error: null,
            adminEmail: null,
          });
        } else {
          const errorData = await adminCheckResponse.json().catch(() => ({}));
          setState({
            isAdmin: false,
            isLoading: false,
            error: new Error(errorData.message || 'Failed to verify admin access'),
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
