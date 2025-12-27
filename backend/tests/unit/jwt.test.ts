/**
 * Unit tests for JWT token generation and validation utilities
 * Tests access tokens, refresh tokens, and token verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyAccessToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
  resetSecretKey,
  hasPreviousKey,
  TokenError,
} from '../../src/utils/jwt';

// Test JWT secret (minimum 32 characters required)
const TEST_JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long-for-testing';
const TEST_JWT_SECRET_PREVIOUS = 'previous-jwt-secret-at-least-32-characters-long-testing';

describe('JWT Utilities', () => {
  beforeEach(() => {
    // Reset secret key cache before each test
    resetSecretKey();
    // Set test JWT secret
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetSecretKey();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };

      const token = await generateAccessToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // JWT format: header.payload.signature
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include user data in token payload', async () => {
      const user = { userId: 'user-456', email: 'john@example.com' };

      const token = await generateAccessToken(user);
      const payload = await verifyToken(token, 'access');

      expect(payload.userId).toBe('user-456');
      expect(payload.email).toBe('john@example.com');
      expect(payload.type).toBe('access');
    });

    it('should throw error when JWT_SECRET is not set', async () => {
      delete process.env.JWT_SECRET;
      resetSecretKey();

      const user = { userId: 'user-123', email: 'test@example.com' };

      await expect(generateAccessToken(user)).rejects.toThrow(TokenError);
      await expect(generateAccessToken(user)).rejects.toThrow('JWT_SECRET environment variable is not configured');
    });

    it('should throw error when JWT_SECRET is too short', async () => {
      process.env.JWT_SECRET = 'short-secret';
      resetSecretKey();

      const user = { userId: 'user-123', email: 'test@example.com' };

      await expect(generateAccessToken(user)).rejects.toThrow(TokenError);
      await expect(generateAccessToken(user)).rejects.toThrow('JWT_SECRET must be at least 32 characters');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };

      const token = await generateRefreshToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include user data and refresh type in payload', async () => {
      const user = { userId: 'user-789', email: 'jane@example.com' };

      const token = await generateRefreshToken(user);
      const payload = await verifyToken(token, 'refresh');

      expect(payload.userId).toBe('user-789');
      expect(payload.email).toBe('jane@example.com');
      expect(payload.type).toBe('refresh');
    });

    it('should include a unique JTI claim', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };

      const token1 = await generateRefreshToken(user);
      const token2 = await generateRefreshToken(user);

      const payload1 = await verifyToken(token1, 'refresh');
      const payload2 = await verifyToken(token2, 'refresh');

      expect(payload1.jti).toBeDefined();
      expect(payload2.jti).toBeDefined();
      expect(payload1.jti).not.toBe(payload2.jti); // Unique per token
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };

      const pair = await generateTokenPair(user);

      expect(pair.accessToken).toBeDefined();
      expect(pair.refreshToken).toBeDefined();
      expect(pair.accessToken).not.toBe(pair.refreshToken);
    });

    it('should include expiration information', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };

      const pair = await generateTokenPair(user);

      expect(pair.expiresIn).toBe(15 * 60); // 15 minutes in seconds
      expect(pair.refreshExpiresAt).toBeInstanceOf(Date);
      expect(pair.refreshExpiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should set refresh token expiry to ~7 days from now', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const beforeGeneration = Date.now();

      const pair = await generateTokenPair(user);

      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const tolerance = 5000; // 5 second tolerance

      const expectedExpiry = beforeGeneration + sevenDaysMs;
      expect(pair.refreshExpiresAt.getTime()).toBeGreaterThan(expectedExpiry - tolerance);
      expect(pair.refreshExpiresAt.getTime()).toBeLessThan(expectedExpiry + tolerance);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid access token', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const token = await generateAccessToken(user);

      const payload = await verifyToken(token, 'access');

      expect(payload.userId).toBe('user-123');
      expect(payload.email).toBe('test@example.com');
      expect(payload.type).toBe('access');
    });

    it('should verify a valid refresh token', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const token = await generateRefreshToken(user);

      const payload = await verifyToken(token, 'refresh');

      expect(payload.userId).toBe('user-123');
      expect(payload.type).toBe('refresh');
    });

    it('should reject access token when expecting refresh token', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const accessToken = await generateAccessToken(user);

      await expect(verifyToken(accessToken, 'refresh')).rejects.toThrow(TokenError);
      await expect(verifyToken(accessToken, 'refresh')).rejects.toThrow('Expected refresh token but got access');
    });

    it('should reject refresh token when expecting access token', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const refreshToken = await generateRefreshToken(user);

      await expect(verifyToken(refreshToken, 'access')).rejects.toThrow(TokenError);
      await expect(verifyToken(refreshToken, 'access')).rejects.toThrow('Expected access token but got refresh');
    });

    it('should reject invalid token format', async () => {
      await expect(verifyToken('invalid-token', 'access')).rejects.toThrow(TokenError);
      await expect(verifyToken('invalid-token', 'access')).rejects.toThrow('Invalid token');
    });

    it('should reject tampered token', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const token = await generateAccessToken(user);
      const tamperedToken = token.slice(0, -5) + 'XXXXX'; // Modify signature

      await expect(verifyToken(tamperedToken, 'access')).rejects.toThrow(TokenError);
    });

    it('should reject token with wrong secret', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const token = await generateAccessToken(user);

      // Change secret
      process.env.JWT_SECRET = 'different-secret-that-is-at-least-32-characters-long';
      resetSecretKey();

      await expect(verifyToken(token, 'access')).rejects.toThrow(TokenError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Dual-Key Rotation Tests (Constitution XI: Zero-Downtime Key Rotation)
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Dual-Key Rotation', () => {
    afterEach(() => {
      delete process.env.JWT_SECRET_PREVIOUS;
    });

    describe('hasPreviousKey', () => {
      it('should return false when JWT_SECRET_PREVIOUS is not set', () => {
        delete process.env.JWT_SECRET_PREVIOUS;
        resetSecretKey();
        expect(hasPreviousKey()).toBe(false);
      });

      it('should return false when JWT_SECRET_PREVIOUS is too short', () => {
        process.env.JWT_SECRET_PREVIOUS = 'short';
        resetSecretKey();
        expect(hasPreviousKey()).toBe(false);
      });

      it('should return true when JWT_SECRET_PREVIOUS is valid', () => {
        process.env.JWT_SECRET_PREVIOUS = TEST_JWT_SECRET_PREVIOUS;
        resetSecretKey();
        expect(hasPreviousKey()).toBe(true);
      });
    });

    describe('verifyToken with key rotation', () => {
      it('should verify token signed with current key', async () => {
        process.env.JWT_SECRET = TEST_JWT_SECRET;
        process.env.JWT_SECRET_PREVIOUS = TEST_JWT_SECRET_PREVIOUS;
        resetSecretKey();

        const user = { userId: 'user-123', email: 'test@example.com' };
        const token = await generateAccessToken(user);

        const payload = await verifyToken(token, 'access');
        expect(payload.userId).toBe('user-123');
      });

      it('should verify token signed with previous key (rotation scenario)', async () => {
        // Step 1: Generate token with "old" key
        process.env.JWT_SECRET = TEST_JWT_SECRET_PREVIOUS;
        delete process.env.JWT_SECRET_PREVIOUS;
        resetSecretKey();

        const user = { userId: 'user-456', email: 'rotated@example.com' };
        const tokenSignedWithOldKey = await generateAccessToken(user);

        // Step 2: Rotate keys - old key becomes previous, new key becomes current
        process.env.JWT_SECRET = TEST_JWT_SECRET;
        process.env.JWT_SECRET_PREVIOUS = TEST_JWT_SECRET_PREVIOUS;
        resetSecretKey();

        // Step 3: Token signed with old key should still verify via fallback
        const payload = await verifyToken(tokenSignedWithOldKey, 'access');
        expect(payload.userId).toBe('user-456');
        expect(payload.email).toBe('rotated@example.com');
      });

      it('should fail if token signed with unknown key', async () => {
        const unknownSecret = 'unknown-secret-key-that-is-at-least-32-chars-long!!';
        
        // Generate token with unknown key
        process.env.JWT_SECRET = unknownSecret;
        delete process.env.JWT_SECRET_PREVIOUS;
        resetSecretKey();

        const user = { userId: 'user-789', email: 'unknown@example.com' };
        const tokenSignedWithUnknownKey = await generateAccessToken(user);

        // Set up current and previous keys (neither matches unknown)
        process.env.JWT_SECRET = TEST_JWT_SECRET;
        process.env.JWT_SECRET_PREVIOUS = TEST_JWT_SECRET_PREVIOUS;
        resetSecretKey();

        await expect(verifyToken(tokenSignedWithUnknownKey, 'access')).rejects.toThrow(TokenError);
      });

      it('should not fallback on WRONG_TYPE error', async () => {
        process.env.JWT_SECRET = TEST_JWT_SECRET;
        process.env.JWT_SECRET_PREVIOUS = TEST_JWT_SECRET_PREVIOUS;
        resetSecretKey();

        const user = { userId: 'user-123', email: 'test@example.com' };
        const refreshToken = await generateRefreshToken(user);

        // Try to verify refresh token as access token - should fail without fallback
        await expect(verifyToken(refreshToken, 'access')).rejects.toThrow('Expected access token but got refresh');
      });

      it('should verify refresh tokens with previous key', async () => {
        // Generate refresh token with old key
        process.env.JWT_SECRET = TEST_JWT_SECRET_PREVIOUS;
        delete process.env.JWT_SECRET_PREVIOUS;
        resetSecretKey();

        const user = { userId: 'refresh-user', email: 'refresh@example.com' };
        const refreshToken = await generateRefreshToken(user);

        // Rotate keys
        process.env.JWT_SECRET = TEST_JWT_SECRET;
        process.env.JWT_SECRET_PREVIOUS = TEST_JWT_SECRET_PREVIOUS;
        resetSecretKey();

        // Should still verify
        const payload = await verifyToken(refreshToken, 'refresh');
        expect(payload.userId).toBe('refresh-user');
        expect(payload.type).toBe('refresh');
      });

      it('new tokens should be signed with current key only', async () => {
        process.env.JWT_SECRET = TEST_JWT_SECRET;
        process.env.JWT_SECRET_PREVIOUS = TEST_JWT_SECRET_PREVIOUS;
        resetSecretKey();

        const user = { userId: 'new-user', email: 'new@example.com' };
        const token = await generateAccessToken(user);

        // Remove previous key - token should still verify (signed with current)
        delete process.env.JWT_SECRET_PREVIOUS;
        resetSecretKey();

        const payload = await verifyToken(token, 'access');
        expect(payload.userId).toBe('new-user');
      });
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify token from valid Bearer header', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const token = await generateAccessToken(user);

      const payload = await verifyAccessToken(`Bearer ${token}`);

      expect(payload.userId).toBe('user-123');
      expect(payload.email).toBe('test@example.com');
    });

    it('should reject missing authorization header', async () => {
      await expect(verifyAccessToken(undefined)).rejects.toThrow(TokenError);
      await expect(verifyAccessToken(undefined)).rejects.toThrow('Authorization header is required');
    });

    it('should reject empty authorization header', async () => {
      await expect(verifyAccessToken('')).rejects.toThrow(TokenError);
    });

    it('should reject non-Bearer scheme', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const token = await generateAccessToken(user);

      await expect(verifyAccessToken(`Basic ${token}`)).rejects.toThrow(TokenError);
      await expect(verifyAccessToken(`Basic ${token}`)).rejects.toThrow('Invalid authorization header format');
    });

    it('should reject Bearer without token', async () => {
      await expect(verifyAccessToken('Bearer ')).rejects.toThrow(TokenError);
    });

    it('should reject Bearer with refresh token', async () => {
      const user = { userId: 'user-123', email: 'test@example.com' };
      const refreshToken = await generateRefreshToken(user);

      await expect(verifyAccessToken(`Bearer ${refreshToken}`)).rejects.toThrow(TokenError);
    });
  });

  describe('hashRefreshToken', () => {
    it('should hash refresh token with SHA-256', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';

      const hash = hashRefreshToken(token);

      expect(hash).toHaveLength(64); // SHA-256 = 64 hex chars
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('should produce consistent hashes', () => {
      const token = 'test-refresh-token';

      const hash1 = hashRefreshToken(token);
      const hash2 = hashRefreshToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = hashRefreshToken('token-1');
      const hash2 = hashRefreshToken('token-2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getRefreshTokenExpiry', () => {
    it('should return date ~7 days from now', () => {
      const before = Date.now();
      const expiry = getRefreshTokenExpiry();
      const after = Date.now();

      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      expect(expiry.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs);
      expect(expiry.getTime()).toBeLessThanOrEqual(after + sevenDaysMs);
    });

    it('should return a Date object', () => {
      const expiry = getRefreshTokenExpiry();

      expect(expiry).toBeInstanceOf(Date);
    });
  });

  describe('TokenError', () => {
    it('should create error with correct properties', () => {
      const error = new TokenError('Token expired', 'EXPIRED', 401);

      expect(error.message).toBe('Token expired');
      expect(error.code).toBe('EXPIRED');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('TokenError');
    });

    it('should default to 401 status code', () => {
      const error = new TokenError('Invalid token', 'INVALID');

      expect(error.statusCode).toBe(401);
    });

    it('should allow custom status codes', () => {
      const error = new TokenError('Server error', 'MISSING_SECRET', 500);

      expect(error.statusCode).toBe(500);
    });
  });
});
