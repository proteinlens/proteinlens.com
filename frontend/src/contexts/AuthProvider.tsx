import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AuthUser,
  getValidAccessToken,
  fetchUserProfile,
  signin as apiSignin,
  signout as apiSignout,
  signup as apiSignup,
  resendVerificationEmail,
  refreshTokens,
  clearTokens,
  getStoredAccessToken,
  storeTokens,
  SigninData,
  SignupData,
  AuthError,
  migrateMeals,
} from '../services/authService';
import { API_ENDPOINTS, AUTH } from '../config';
import { isMsalConfigured, loginRequest } from '../auth/msalConfig';
import { setUserId, clearUserId, getUserId } from '../utils/userId';

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
// Helper to get MSAL instance from window
function getMsalInstance(): any | null {
  return (window as any).msalInstance || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  // Get access token with automatic refresh
  const getAccessToken = useCallback(async () => {
    const msal = getMsalInstance();
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
    
    // Capture old userId before login for potential migration
    const oldUserId = getUserId();
    
    try {
      const result = await apiSignin(credentials);
      setUser(result.user);
      setIsAuthenticated(true);
      
      // Sync localStorage userId with authenticated user ID
      if (result.user.id) {
        setUserId(result.user.id);
        
        // Auto-migrate meals from old anonymous ID to authenticated user
        if (oldUserId && oldUserId !== result.user.id) {
          // Don't await - let it run in background
          migrateMeals(oldUserId).then(({ migratedCount }) => {
            if (migratedCount > 0) {
              console.log(`[Auth] Auto-migrated ${migratedCount} meals to authenticated user`);
            }
          });
        }
      }
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
      const result = await apiSignup(data);
      // Sync localStorage userId with the server-assigned user ID immediately after signup
      // This ensures any subsequent API calls use the correct ID
      if (result.userId) {
        setUserId(result.userId);
      }
      return result;
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

  // Check auth state on mount and handle OAuth callback (T031: automatic token refresh on page load)
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
      
      // T031: Automatic token refresh on page load
      // Try to refresh using HttpOnly cookie first (modern approach)
      // This handles the case where access token is expired but refresh token cookie exists
      try {
        // Only attempt refresh if we have a stored token
        // (anonymous users won't have tokens and that's ok)
        const storedToken = getStoredAccessToken();
        if (storedToken) {
          // Attempt refresh - if HttpOnly cookie exists, we'll get new tokens
          await refreshTokens();
          
          // If refresh succeeded, fetch user profile
          const profile = await fetchUserProfile();
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
            // Sync localStorage userId with authenticated user ID
            if (profile.id) {
              setUserId(profile.id);
            }
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Refresh failed - might not have a valid session
        // Continue to check stored tokens for backward compatibility
      }
      
      // Fallback: Check if we have a stored token (backward compatibility)
      const hasToken = !!getStoredAccessToken();
      
      if (hasToken) {
        const profile = await fetchUserProfile();
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
          // Sync localStorage userId with authenticated user ID
          if (profile.id) {
            setUserId(profile.id);
          }
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
