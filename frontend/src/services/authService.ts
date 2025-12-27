/**
 * Auth Service
 * Handles API calls for self-managed authentication
 */

import { API_ENDPOINTS } from '../config';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: 'FREE' | 'PRO';
  emailVerified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  requirements: {
    minLength: boolean;
    maxLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  isBreached: boolean;
}

export interface OAuthProvider {
  id: string;
  name: string;
  loginUrl: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Storage
// ─────────────────────────────────────────────────────────────────────────────

// SECURITY: Access tokens should be stored in memory only (not localStorage)
// to protect against XSS attacks. The refresh token is stored in an HttpOnly
// cookie that can't be accessed by JavaScript.

// Legacy storage keys (for backward compatibility during migration)
const ACCESS_TOKEN_KEY = 'proteinlens_access_token';
const REFRESH_TOKEN_KEY = 'proteinlens_refresh_token';
const TOKEN_EXPIRY_KEY = 'proteinlens_token_expiry';

// CSRF token from last authentication response
let csrfToken: string | null = null;

// In-memory access token storage (XSS protection per Constitution XI)
let inMemoryAccessToken: string | null = null;
let inMemoryTokenExpiry: number | null = null;

/**
 * Store tokens - access token in memory, refresh token handled via HttpOnly cookie
 */
export function storeTokens(tokens: TokenPair & { csrfToken?: string }): void {
  // Store access token in memory only (per Constitution XI - XSS protection)
  inMemoryAccessToken = tokens.accessToken;
  inMemoryTokenExpiry = Date.now() + tokens.expiresIn * 1000;
  
  // Store CSRF token for protected requests
  if (tokens.csrfToken) {
    csrfToken = tokens.csrfToken;
  }
  
  // Legacy: Also store in localStorage for backward compatibility during migration
  // TODO: Remove localStorage storage once fully migrated to cookie-based auth
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + tokens.expiresIn * 1000));
}

export function getStoredAccessToken(): string | null {
  // Prefer in-memory token if available
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }
  // Fall back to localStorage for backward compatibility
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  // Legacy: refresh tokens are now stored in HttpOnly cookies
  // This function is for backward compatibility
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getTokenExpiry(): number | null {
  // Prefer in-memory expiry if available
  if (inMemoryTokenExpiry) {
    return inMemoryTokenExpiry;
  }
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  // Consider expired if within 30 seconds of expiry
  return Date.now() > expiry - 30000;
}

export function clearTokens(): void {
  // Clear in-memory tokens
  inMemoryAccessToken = null;
  inMemoryTokenExpiry = null;
  csrfToken = null;
  
  // Clear legacy localStorage tokens
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Get the CSRF token for protected requests
 */
export function getCsrfToken(): string | null {
  return csrfToken;
}

/**
 * Get headers for authenticated requests, including CSRF protection
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rate limiting error with retry information
 */
export class RateLimitError extends AuthError {
  constructor(
    message: string,
    public readonly retryAfter: number | null,
    public readonly lockedUntil: Date | null
  ) {
    super(message, 'RATE_LIMITED', 429);
    this.name = 'RateLimitError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  // Handle rate limiting (429 Too Many Requests)
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : null;
    const lockedUntil = retrySeconds 
      ? new Date(Date.now() + retrySeconds * 1000)
      : null;
    
    let message = 'Too many requests. Please try again later.';
    try {
      const data = await response.json();
      if (data.error) {
        message = data.error;
      }
      if (data.lockedUntil) {
        const lockTime = new Date(data.lockedUntil);
        const minutes = Math.ceil((lockTime.getTime() - Date.now()) / 60000);
        message = `Account temporarily locked. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
      }
    } catch {
      // Use default message if response body isn't JSON
    }
    
    throw new RateLimitError(message, retrySeconds, lockedUntil);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new AuthError(
      data.error || 'An error occurred',
      data.code || 'UNKNOWN_ERROR',
      response.status,
      data.details
    );
  }
  
  return data;
}

/**
 * Sign up with email and password
 */
export async function signup(data: SignupData): Promise<{ message: string; userId: string; email: string }> {
  const response = await fetch(API_ENDPOINTS.AUTH_SIGNUP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
}

/**
 * Sign in with email and password
 */
export async function signin(data: SigninData): Promise<AuthResponse> {
  const response = await fetch(API_ENDPOINTS.AUTH_SIGNIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include', // Include cookies for HttpOnly refresh token
  });
  
  const result = await handleResponse<AuthResponse & { csrfToken?: string }>(response);
  
  // Store tokens (access token in memory, CSRF token for future requests)
  storeTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresIn: result.expiresIn,
    csrfToken: result.csrfToken,
  });
  
  return result;
}

/**
 * Refresh access token using HttpOnly cookie
 * If no cookie is available, falls back to stored refresh token for backward compatibility
 */
export async function refreshTokens(): Promise<TokenPair> {
  // Try cookie-based refresh first (modern approach)
  // The HttpOnly cookie will be sent automatically with credentials: 'include'
  const response = await fetch(API_ENDPOINTS.AUTH_REFRESH, {
    method: 'POST',
    headers: getAuthHeaders(), // Includes CSRF token
    body: JSON.stringify({}), // Empty body - refresh token comes from cookie
    credentials: 'include', // Include HttpOnly cookie
  });
  
  // If that fails with "No refresh token", try legacy localStorage approach
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // If it's specifically a "no token" error, try with stored token
    if (response.status === 400 || errorData.code === 'NO_REFRESH_TOKEN') {
      const storedToken = getStoredRefreshToken();
      if (storedToken) {
        const legacyResponse = await fetch(API_ENDPOINTS.AUTH_REFRESH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedToken }),
          credentials: 'include',
        });
        
        const legacyResult = await handleResponse<TokenPair & { csrfToken?: string }>(legacyResponse);
        storeTokens(legacyResult);
        return legacyResult;
      }
    }
    
    throw new AuthError(
      errorData.error || 'Failed to refresh tokens',
      errorData.code || 'REFRESH_FAILED',
      response.status
    );
  }
  
  const result = await handleResponse<TokenPair & { csrfToken?: string }>(response);
  
  // Store new tokens
  storeTokens(result);
  
  return result;
}

/**
 * Sign out and revoke refresh token
 * Uses HttpOnly cookie (sent automatically) or falls back to stored token
 */
export async function signout(): Promise<void> {
  try {
    // Send logout request - HttpOnly cookie will be sent automatically
    // Also send stored token for backward compatibility
    const refreshToken = getStoredRefreshToken();
    
    await fetch(API_ENDPOINTS.AUTH_LOGOUT, {
      method: 'POST',
      headers: getAuthHeaders(), // Includes CSRF token
      body: JSON.stringify({ refreshToken }), // For backward compatibility
      credentials: 'include', // Include HttpOnly cookie
    });
  } catch {
    // Ignore errors on logout - still clear local state
  }
  
  clearTokens();
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ message: string; email: string }> {
  const response = await fetch(API_ENDPOINTS.AUTH_VERIFY_EMAIL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  
  return handleResponse(response);
}

/**
 * Request a new verification email
 */
export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const response = await fetch(API_ENDPOINTS.AUTH_RESEND_VERIFICATION, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  return handleResponse(response);
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  return handleResponse(response);
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const response = await fetch(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  
  return handleResponse(response);
}

/**
 * Check if email is available for signup
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  const response = await fetch(`${API_ENDPOINTS.AUTH_CHECK_EMAIL}?email=${encodeURIComponent(email)}`);
  const data = await handleResponse<{ available: boolean }>(response);
  return data.available;
}

/**
 * Validate password strength and breach status
 */
export async function validatePassword(password: string): Promise<PasswordValidation> {
  const response = await fetch(API_ENDPOINTS.AUTH_VALIDATE_PASSWORD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  
  return handleResponse(response);
}

/**
 * Get available OAuth providers
 */
export async function getOAuthProviders(): Promise<OAuthProvider[]> {
  const response = await fetch(API_ENDPOINTS.AUTH_PROVIDERS);
  const data = await handleResponse<{ providers: OAuthProvider[] }>(response);
  return data.providers;
}

/**
 * Get a valid access token, refreshing if needed
 */
export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = getStoredAccessToken();
  
  if (!accessToken) {
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired()) {
    try {
      const newTokens = await refreshTokens();
      return newTokens.accessToken;
    } catch {
      clearTokens();
      return null;
    }
  }
  
  return accessToken;
}

/**
 * Get user profile from /me endpoint
 */
export async function fetchUserProfile(): Promise<AuthUser | null> {
  const token = await getValidAccessToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch(API_ENDPOINTS.ME, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        clearTokens();
      }
      return null;
    }
    
    return response.json();
  } catch {
    return null;
  }
}
