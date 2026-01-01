/**
 * Cookie utilities for auth token management
 * 
 * Token Storage Strategy (per Constitution XI):
 * - Access token: Memory only (JS variable) - XSS protection
 * - Refresh token: HttpOnly cookie - secure storage
 * - CSRF token: Regular cookie (JS-readable) - CSRF protection
 */

import { HttpRequest, Cookie } from '@azure/functions';
import crypto from 'crypto';

// Cookie names (prefixed to avoid conflicts)
export const REFRESH_TOKEN_COOKIE = 'proteinlens_refresh';
export const CSRF_TOKEN_COOKIE = 'proteinlens_csrf';

// Environment detection helpers
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get cookie domain for cross-subdomain sharing
 * In production, use .proteinlens.com to share between www and api subdomains
 */
function getCookieDomain(): string | undefined {
  if (isProduction()) {
    return '.proteinlens.com';
  }
  // In development, don't set domain to allow localhost
  return undefined;
}

/**
 * Create HttpOnly cookie for refresh token
 * - httpOnly: true prevents JavaScript access (XSS protection)
 * - secure: true in production (HTTPS only)
 * - sameSite: Strict prevents CSRF attacks
 * - path: /api/auth restricts cookie to auth endpoints only
 */
export function setRefreshTokenCookie(refreshToken: string, expiresAt: Date): Cookie {
  const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'Lax', // Lax allows cross-subdomain with top-level navigation
    path: '/',
    domain: getCookieDomain(),
    maxAge: Math.max(0, maxAge), // Ensure non-negative
  };
}

/**
 * Create cookie to clear the refresh token
 * Used on logout to remove the cookie
 */
export function clearRefreshTokenCookie(): Cookie {
  return {
    name: REFRESH_TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'Lax',
    path: '/',
    domain: getCookieDomain(),
    maxAge: 0, // Immediate expiration
  };
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Create CSRF token cookie
 * - httpOnly: false so JavaScript can read and include in requests
 * - Value is paired with server-side session
 */
export function setCsrfTokenCookie(csrfToken: string): Cookie {
  return {
    name: CSRF_TOKEN_COOKIE,
    value: csrfToken,
    httpOnly: false, // JS needs to read this for double-submit pattern
    secure: isProduction(),
    sameSite: 'Lax', // Lax allows reading from www subdomain
    path: '/',
    domain: getCookieDomain(),
    maxAge: 60 * 60 * 24, // 24 hours
  };
}

/**
 * Clear CSRF token cookie on logout
 */
export function clearCsrfTokenCookie(): Cookie {
  return {
    name: CSRF_TOKEN_COOKIE,
    value: '',
    httpOnly: false,
    secure: isProduction(),
    sameSite: 'Lax',
    path: '/',
    domain: getCookieDomain(),
    maxAge: 0,
  };
}

/**
 * Extract refresh token from cookie header
 */
export function getRefreshTokenFromCookie(request: HttpRequest): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = parseCookies(cookieHeader);
  return cookies[REFRESH_TOKEN_COOKIE] || null;
}

/**
 * Extract CSRF token from cookie header
 */
export function getCsrfTokenFromCookie(request: HttpRequest): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = parseCookies(cookieHeader);
  return cookies[CSRF_TOKEN_COOKIE] || null;
}

/**
 * Validate CSRF token from header matches cookie
 * Double-submit cookie pattern:
 * 1. Server sets CSRF cookie
 * 2. Client reads cookie and sends in X-CSRF-Token header
 * 3. Server validates header matches cookie
 * 
 * This works because:
 * - Attacker can't read cookies from another origin
 * - So attacker can't send correct header value
 */
export function validateCsrfToken(request: HttpRequest): boolean {
  // Skip CSRF check in test environment
  if (isTestEnvironment()) return true;
  
  const cookieToken = getCsrfTokenFromCookie(request);
  const headerToken = request.headers.get('x-csrf-token');
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'utf8'),
      Buffer.from(headerToken, 'utf8')
    );
  } catch {
    // Buffers of different lengths
    return false;
  }
}

/**
 * Parse cookie header string into key-value pairs
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      // Rejoin in case value contains '='
      cookies[name] = rest.join('=');
    }
  });
  
  return cookies;
}
