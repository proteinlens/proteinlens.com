import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthUser,
  getValidAccessToken,
  fetchUserProfile,
  signin as apiSignin,
  signout as apiSignout,
  signup as apiSignup,
  resendVerificationEmail,
  clearTokens,
  getStoredAccessToken,
  storeTokens,
  SigninData,
  SignupData,
  AuthError,
} from '../services/authService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
  getAccessToken: () => Promise<string | null>;
  login: (credentials: SigninData) => Promise<void>;
  signup: (data: SignupData) => Promise<{ message: string; userId: string; email: string }>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Session policy constants (30m inactivity, 7d absolute)
const SESSION_INACTIVITY_MS = 30 * 60 * 1000;
const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [sessionStart] = useState<number>(Date.now());

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

  // Get access token with automatic refresh
  const getAccessToken = useCallback(async () => {
    try {
      return await getValidAccessToken();
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      return null;
    }
  }, []);

  // Refresh user profile
  const refreshUser = useCallback(async () => {
    const profile = await fetchUserProfile();
    if (profile) {
      setUser(profile);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Login with email/password
  const login = useCallback(async (credentials: SigninData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await apiSignin(credentials);
      setUser(result.user);
      setIsAuthenticated(true);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
        throw err;
      }
      setError('An unexpected error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign up
  const signup = useCallback(async (data: SignupData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      return await apiSignup(data);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
        throw err;
      }
      setError('An unexpected error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiSignout();
    } catch {
      // Ignore errors on logout
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Resend verification
  const handleResendVerification = useCallback(async (email: string) => {
    try {
      await resendVerificationEmail(email);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      }
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check auth state on mount and handle OAuth callback
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      
      // Check for OAuth callback parameters
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');
      const expiresIn = params.get('expiresIn');
      
      if (accessToken && refreshToken && expiresIn) {
        // Store tokens from OAuth callback
        storeTokens({
          accessToken,
          refreshToken,
          expiresIn: parseInt(expiresIn, 10),
        });
        
        // Clean URL
        const returnUrl = params.get('returnUrl') || '/dashboard';
        window.history.replaceState({}, '', returnUrl);
      }
      
      // Check if we have a stored token
      const hasToken = !!getStoredAccessToken();
      
      if (hasToken) {
        const profile = await fetchUserProfile();
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        } else {
          clearTokens();
        }
      }
      
      setIsLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      error,
      getAccessToken,
      login,
      signup,
      logout,
      resendVerificationEmail: handleResendVerification,
      clearError,
      refreshUser,
    }),
    [isAuthenticated, isLoading, user, error, getAccessToken, login, signup, logout, handleResendVerification, clearError, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
