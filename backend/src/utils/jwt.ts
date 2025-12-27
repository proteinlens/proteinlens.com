/**
 * JWT Token Service for self-managed authentication
 * Handles access token and refresh token generation/validation
 */

import { SignJWT, jwtVerify, JWTPayload, errors as joseErrors } from 'jose';
import { createHash, randomBytes } from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';     // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d';     // Long-lived refresh token
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// Algorithm for JWT signing
const JWT_ALGORITHM = 'HS256';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;       // Access token expiry in seconds
  refreshExpiresAt: Date;  // Refresh token expiry date
}

export interface UserTokenData {
  userId: string;
  email: string;
}

export class TokenError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID' | 'EXPIRED' | 'MISSING_SECRET' | 'WRONG_TYPE',
    public readonly statusCode: number = 401
  ) {
    super(message);
    this.name = 'TokenError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Secret Key Management
// ─────────────────────────────────────────────────────────────────────────────

let secretKey: Uint8Array | null = null;

/**
 * Get the JWT secret key from environment
 * @throws {TokenError} If JWT_SECRET is not configured
 */
function getSecretKey(): Uint8Array {
  if (!secretKey) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new TokenError(
        'JWT_SECRET environment variable is not configured',
        'MISSING_SECRET',
        500
      );
    }
    // Ensure minimum key length for HS256 (256 bits = 32 bytes)
    if (secret.length < 32) {
      throw new TokenError(
        'JWT_SECRET must be at least 32 characters',
        'MISSING_SECRET',
        500
      );
    }
    secretKey = new TextEncoder().encode(secret);
  }
  return secretKey;
}

/**
 * Reset secret key cache (for testing)
 */
export function resetSecretKey(): void {
  secretKey = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate an access token
 * @param user - User data to encode in token
 * @returns Signed JWT access token
 */
export async function generateAccessToken(user: UserTokenData): Promise<string> {
  const key = getSecretKey();
  
  return new SignJWT({
    userId: user.userId,
    email: user.email,
    type: 'access',
  } as TokenPayload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setIssuer('proteinlens')
    .setAudience('proteinlens-api')
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(key);
}

/**
 * Generate a refresh token
 * @param user - User data to encode in token
 * @returns Signed JWT refresh token
 */
export async function generateRefreshToken(user: UserTokenData): Promise<string> {
  const key = getSecretKey();
  
  return new SignJWT({
    userId: user.userId,
    email: user.email,
    type: 'refresh',
  } as TokenPayload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setIssuer('proteinlens')
    .setAudience('proteinlens-api')
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setJti(randomBytes(16).toString('hex')) // Unique token ID for revocation
    .sign(key);
}

/**
 * Generate both access and refresh tokens
 * @param user - User data to encode in tokens
 * @returns Token pair with expiry information
 */
export async function generateTokenPair(user: UserTokenData): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user),
    generateRefreshToken(user),
  ]);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
    refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @param expectedType - Expected token type ('access' or 'refresh')
 * @returns Decoded token payload
 * @throws {TokenError} If validation fails
 */
export async function verifyToken(
  token: string,
  expectedType: 'access' | 'refresh' = 'access'
): Promise<TokenPayload> {
  const key = getSecretKey();
  
  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: 'proteinlens',
      audience: 'proteinlens-api',
    });
    
    const tokenPayload = payload as TokenPayload;
    
    // Verify token type
    if (tokenPayload.type !== expectedType) {
      throw new TokenError(
        `Expected ${expectedType} token but got ${tokenPayload.type}`,
        'WRONG_TYPE',
        401
      );
    }
    
    // Validate required claims
    if (!tokenPayload.userId || !tokenPayload.email) {
      throw new TokenError('Token missing required claims', 'INVALID', 401);
    }
    
    return tokenPayload;
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }
    
    if (error instanceof joseErrors.JWTExpired) {
      throw new TokenError('Token has expired', 'EXPIRED', 401);
    }
    
    if (error instanceof joseErrors.JWTClaimValidationFailed) {
      throw new TokenError('Token claim validation failed', 'INVALID', 401);
    }
    
    throw new TokenError('Invalid token', 'INVALID', 401);
  }
}

/**
 * Verify an access token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns Decoded token payload
 * @throws {TokenError} If validation fails
 */
export async function verifyAccessToken(authHeader: string | undefined): Promise<TokenPayload> {
  if (!authHeader) {
    throw new TokenError('Authorization header is required', 'INVALID', 401);
  }
  
  const [scheme, token] = authHeader.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    throw new TokenError('Invalid authorization header format', 'INVALID', 401);
  }
  
  return verifyToken(token, 'access');
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Hashing (for storage)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hash a refresh token for secure storage
 * @param token - Raw refresh token
 * @returns SHA-256 hash of the token
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Calculate refresh token expiration date
 * @returns Date when refresh token expires
 */
export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
}
