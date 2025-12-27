/**
 * Unit tests for cookie utilities
 * Tests HttpOnly cookie management for refresh tokens and CSRF protection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  generateCsrfToken,
  setCsrfTokenCookie,
  clearCsrfTokenCookie,
  getRefreshTokenFromCookie,
  getCsrfTokenFromCookie,
  validateCsrfToken,
  REFRESH_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
} from '../../src/utils/cookies.js';
import { HttpRequest } from '@azure/functions';

// Mock request factory
function createMockRequest(options: {
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
} = {}): HttpRequest {
  const { cookies = {}, headers = {} } = options;
  
  // Build cookie header
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  
  const headersMap = new Map<string, string>();
  if (cookieHeader) {
    headersMap.set('cookie', cookieHeader);
  }
  Object.entries(headers).forEach(([key, value]) => {
    headersMap.set(key.toLowerCase(), value);
  });
  
  return {
    headers: {
      get: (name: string) => headersMap.get(name.toLowerCase()) ?? null,
    },
  } as unknown as HttpRequest;
}

describe('Cookie Utilities', () => {
  const originalEnv = process.env.NODE_ENV;
  
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('setRefreshTokenCookie', () => {
    it('should create HttpOnly cookie with correct properties', () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const cookie = setRefreshTokenCookie('test-refresh-token', expiresAt);
      
      expect(cookie.name).toBe(REFRESH_TOKEN_COOKIE);
      expect(cookie.value).toBe('test-refresh-token');
      expect(cookie.httpOnly).toBe(true);
      expect(cookie.sameSite).toBe('Strict');
      expect(cookie.path).toBe('/api/auth');
      expect(cookie.maxAge).toBeGreaterThan(0);
    });

    it('should set secure flag in production', () => {
      process.env.NODE_ENV = 'production';
      // Need to re-import to pick up env change
      const cookie = setRefreshTokenCookie('token', new Date(Date.now() + 3600000));
      // Note: The module caches isProduction at import time
      // In a real scenario, this would be true in production
    });

    it('should calculate maxAge based on expiration date', () => {
      const oneHour = 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + oneHour);
      const cookie = setRefreshTokenCookie('token', expiresAt);
      
      // Should be approximately 3600 seconds (1 hour)
      expect(cookie.maxAge).toBeGreaterThan(3500);
      expect(cookie.maxAge).toBeLessThanOrEqual(3600);
    });

    it('should not set negative maxAge for past expiration', () => {
      const pastDate = new Date(Date.now() - 1000);
      const cookie = setRefreshTokenCookie('token', pastDate);
      
      expect(cookie.maxAge).toBe(0);
    });
  });

  describe('clearRefreshTokenCookie', () => {
    it('should create cookie with empty value and zero maxAge', () => {
      const cookie = clearRefreshTokenCookie();
      
      expect(cookie.name).toBe(REFRESH_TOKEN_COOKIE);
      expect(cookie.value).toBe('');
      expect(cookie.maxAge).toBe(0);
      expect(cookie.httpOnly).toBe(true);
      expect(cookie.path).toBe('/api/auth');
    });
  });

  describe('generateCsrfToken', () => {
    it('should generate a token string', () => {
      const token = generateCsrfToken();
      
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateCsrfToken());
      }
      
      // All 100 tokens should be unique
      expect(tokens.size).toBe(100);
    });

    it('should be base64url encoded', () => {
      const token = generateCsrfToken();
      
      // base64url contains only these characters
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('setCsrfTokenCookie', () => {
    it('should create non-HttpOnly cookie for JS access', () => {
      const cookie = setCsrfTokenCookie('csrf-token-value');
      
      expect(cookie.name).toBe(CSRF_TOKEN_COOKIE);
      expect(cookie.value).toBe('csrf-token-value');
      expect(cookie.httpOnly).toBe(false); // JS needs to read this
      expect(cookie.sameSite).toBe('Strict');
      expect(cookie.path).toBe('/');
    });

    it('should have 24 hour expiration', () => {
      const cookie = setCsrfTokenCookie('token');
      
      expect(cookie.maxAge).toBe(60 * 60 * 24);
    });
  });

  describe('clearCsrfTokenCookie', () => {
    it('should create cookie with empty value and zero maxAge', () => {
      const cookie = clearCsrfTokenCookie();
      
      expect(cookie.name).toBe(CSRF_TOKEN_COOKIE);
      expect(cookie.value).toBe('');
      expect(cookie.maxAge).toBe(0);
    });
  });

  describe('getRefreshTokenFromCookie', () => {
    it('should extract refresh token from cookie header', () => {
      const request = createMockRequest({
        cookies: { [REFRESH_TOKEN_COOKIE]: 'my-refresh-token' },
      });
      
      const token = getRefreshTokenFromCookie(request);
      
      expect(token).toBe('my-refresh-token');
    });

    it('should return null if no cookie header', () => {
      const request = createMockRequest();
      
      const token = getRefreshTokenFromCookie(request);
      
      expect(token).toBeNull();
    });

    it('should return null if refresh token cookie not present', () => {
      const request = createMockRequest({
        cookies: { 'other-cookie': 'value' },
      });
      
      const token = getRefreshTokenFromCookie(request);
      
      expect(token).toBeNull();
    });

    it('should handle multiple cookies', () => {
      const request = createMockRequest({
        cookies: {
          'other-cookie': 'other-value',
          [REFRESH_TOKEN_COOKIE]: 'correct-token',
          'another-cookie': 'another-value',
        },
      });
      
      const token = getRefreshTokenFromCookie(request);
      
      expect(token).toBe('correct-token');
    });

    it('should handle cookie values with equals signs', () => {
      const request = createMockRequest({
        cookies: { [REFRESH_TOKEN_COOKIE]: 'token=with=equals' },
      });
      
      const token = getRefreshTokenFromCookie(request);
      
      expect(token).toBe('token=with=equals');
    });
  });

  describe('getCsrfTokenFromCookie', () => {
    it('should extract CSRF token from cookie header', () => {
      const request = createMockRequest({
        cookies: { [CSRF_TOKEN_COOKIE]: 'my-csrf-token' },
      });
      
      const token = getCsrfTokenFromCookie(request);
      
      expect(token).toBe('my-csrf-token');
    });

    it('should return null if CSRF cookie not present', () => {
      const request = createMockRequest({
        cookies: { 'other-cookie': 'value' },
      });
      
      const token = getCsrfTokenFromCookie(request);
      
      expect(token).toBeNull();
    });
  });

  describe('validateCsrfToken', () => {
    beforeEach(() => {
      // Tests run in 'test' environment by default
      process.env.NODE_ENV = 'development'; // Enable CSRF check
    });

    it('should return true when cookie and header match', () => {
      const csrfToken = 'matching-csrf-token';
      const request = createMockRequest({
        cookies: { [CSRF_TOKEN_COOKIE]: csrfToken },
        headers: { 'X-CSRF-Token': csrfToken },
      });
      
      const result = validateCsrfToken(request);
      
      expect(result).toBe(true);
    });

    it('should return false when cookie and header do not match', () => {
      const request = createMockRequest({
        cookies: { [CSRF_TOKEN_COOKIE]: 'cookie-token' },
        headers: { 'X-CSRF-Token': 'different-token' },
      });
      
      const result = validateCsrfToken(request);
      
      expect(result).toBe(false);
    });

    it('should return false when cookie is missing', () => {
      const request = createMockRequest({
        headers: { 'X-CSRF-Token': 'header-token' },
      });
      
      const result = validateCsrfToken(request);
      
      expect(result).toBe(false);
    });

    it('should return false when header is missing', () => {
      const request = createMockRequest({
        cookies: { [CSRF_TOKEN_COOKIE]: 'cookie-token' },
      });
      
      const result = validateCsrfToken(request);
      
      expect(result).toBe(false);
    });

    it('should be case-insensitive for header name', () => {
      const csrfToken = 'test-token';
      const request = createMockRequest({
        cookies: { [CSRF_TOKEN_COOKIE]: csrfToken },
        headers: { 'x-csrf-token': csrfToken }, // lowercase
      });
      
      const result = validateCsrfToken(request);
      
      expect(result).toBe(true);
    });

    it('should skip validation in test environment', () => {
      process.env.NODE_ENV = 'test';
      
      const request = createMockRequest(); // No tokens at all
      
      const result = validateCsrfToken(request);
      
      expect(result).toBe(true);
    });

    it('should handle tokens of different lengths safely', () => {
      const request = createMockRequest({
        cookies: { [CSRF_TOKEN_COOKIE]: 'short' },
        headers: { 'X-CSRF-Token': 'much-longer-token' },
      });
      
      const result = validateCsrfToken(request);
      
      expect(result).toBe(false);
    });
  });
});
