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

const ACCESS_TOKEN_KEY = 'proteinlens_access_token';
const REFRESH_TOKEN_KEY = 'proteinlens_refresh_token';
const TOKEN_EXPIRY_KEY = 'proteinlens_token_expiry';

export function storeTokens(tokens: TokenPair): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + tokens.expiresIn * 1000));
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getTokenExpiry(): number | null {
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
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
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
  });
  
  const result = await handleResponse<AuthResponse>(response);
  
  // Store tokens
  storeTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresIn: result.expiresIn,
  });
  
  return result;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshTokens(): Promise<TokenPair> {
  const refreshToken = getStoredRefreshToken();
  
  if (!refreshToken) {
    throw new AuthError('No refresh token available', 'NO_REFRESH_TOKEN', 401);
  }
  
  const response = await fetch(API_ENDPOINTS.AUTH_REFRESH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  
  const result = await handleResponse<TokenPair>(response);
  
  // Store new tokens
  storeTokens(result);
  
  return result;
}

/**
 * Sign out and revoke refresh token
 */
export async function signout(): Promise<void> {
  const refreshToken = getStoredRefreshToken();
  
  try {
    await fetch(API_ENDPOINTS.AUTH_LOGOUT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Ignore errors on logout
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
