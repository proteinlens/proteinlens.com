import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { API_ENDPOINTS, AUTH } from '../config';
import { isMsalConfigured, loginRequest } from '../auth/msalConfig';

// Minimal MSAL wrapper. Real config supplied via env in config.ts
export interface AuthUser {
  id?: string;
  externalId?: string;
  email?: string;
  plan?: 'FREE' | 'PRO';
  emailVerified?: boolean;
}

interface LoginOptions {
  extraQueryParameters?: Record<string, string>;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  getAccessToken: () => Promise<string | null>;
  login: (options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Session policy constants (30m inactivity, 7d absolute)
const SESSION_INACTIVITY_MS = 30 * 60 * 1000;
const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;

// Helper to get MSAL instance from window
function getMsalInstance(): any | null {
  return (window as any).msalInstance || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [sessionStart] = useState<number>(Date.now());
  
  // Track if initial auth check has been performed
  const authCheckRef = useRef(false);

  // Track user activity for inactivity timeout
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, updateActivity));
  }, []);

  // Check session expiration
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const inactivityExpired = now - lastActivity > SESSION_INACTIVITY_MS;
      const absoluteExpired = now - sessionStart > SESSION_ABSOLUTE_MS;
      if (inactivityExpired || absoluteExpired) {
        console.log('[Auth] Session expired', { inactivityExpired, absoluteExpired });
        logout();
      }
    }, 60_000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, sessionStart]);

  const getAccessToken = useCallback(async () => {
    const msal = getMsalInstance();
    try {
      if (msal) {
        const accounts = msal.getAllAccounts?.() || [];
        if (accounts.length === 0) return null;
        const result = await msal.acquireTokenSilent?.({
          account: accounts[0],
          scopes: ['openid', 'profile', 'email'],
        });
        return result?.accessToken || result?.idToken || null;
      }
      return null;
    } catch (e) {
      // Token refresh failed - attempt interactive
      try {
        if (msal) {
          await msal.acquireTokenRedirect?.({
            scopes: ['openid', 'profile', 'email'],
          });
        }
      } catch {
        // Redirect will happen, return null for now
      }
      return null;
    }
  }, []);

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ 
          id: data.id, 
          externalId: data.externalId, 
          email: data.email, 
          plan: data.plan,
          emailVerified: data.emailVerified ?? true, // Default to true if not provided
        });
      } else if (res.status === 401) {
        // Token invalid, clear auth state
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      // ignore – user remains null
    }
  }, []);

  const login = useCallback(async (options?: LoginOptions) => {
    const msal = getMsalInstance();
    if (!msal) {
      // Check if config is missing vs MSAL failed to initialize
      if (!isMsalConfigured()) {
        throw new Error('Authentication requires Azure B2C configuration. Please set VITE_AUTH_CLIENT_ID and VITE_AUTH_AUTHORITY environment variables.');
      }
      throw new Error('Authentication service is starting. Please try again in a moment.');
    }
    const request = options?.extraQueryParameters 
      ? { ...loginRequest, extraQueryParameters: options.extraQueryParameters }
      : loginRequest;
    await msal.loginRedirect(request);
  }, []);

  const logout = useCallback(async () => {
    const msal = getMsalInstance();
    if (msal) {
      await msal.logoutRedirect?.();
    }
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    const msal = getMsalInstance();
    // B2C handles email verification during signup
    // For resend, redirect to the verification policy
    if (msal && AUTH.authority) {
      // This would redirect to a B2C policy for email verification
      console.log('[Auth] Resend verification email requested');
    }
  }, []);

  // Initial auth check - runs only once on mount
  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckRef.current) return;
    authCheckRef.current = true;
    
    const checkAuth = async () => {
      setIsLoading(true);
      
      // If MSAL is not configured, skip auth check entirely
      if (!isMsalConfigured()) {
        console.log('[Auth] MSAL not configured, skipping auth check');
        setIsLoading(false);
        return;
      }
      
      // Wait a short time for MSAL to initialize (it's async in main.tsx)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const msal = getMsalInstance();
      
      // Handle redirect callback if present
      if (msal) {
        try {
          await msal.handleRedirectPromise?.();
        } catch (e) {
          console.error('[Auth] Redirect handling failed', e);
        }
      }
      
      const token = await getAccessToken();
      const authed = !!token;
      setIsAuthenticated(authed);
      if (authed && token) {
        await fetchUserProfile(token);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []); // Empty dependency array - run only once on mount

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, isLoading, user, getAccessToken, login, logout, resendVerificationEmail }),
    [isAuthenticated, isLoading, user, getAccessToken, login, logout, resendVerificationEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
