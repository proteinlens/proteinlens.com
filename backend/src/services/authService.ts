import { createRemoteJWKSet, jwtVerify, JWTPayload, errors as joseErrors } from 'jose';
import { loadAuthConfig } from '../utils/authConfig.js';
import { getPrismaClient } from '../utils/prisma.js';

const prisma = getPrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Type definitions for B2C / Entra ID JWT claims
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extended JWT payload with Azure B2C / Entra ID specific claims.
 * These claims may or may not be present depending on the user flow configuration.
 */
interface EntraJWTPayload extends JWTPayload {
  /** Object ID - unique identifier for the user in Azure AD */
  oid?: string;
  /** Email addresses (B2C typically uses this array format) */
  emails?: string[];
  /** Single email claim (standard OIDC) */
  email?: string;
  /** User principal name */
  preferred_username?: string;
  /** Display name */
  name?: string;
  /** Given name */
  given_name?: string;
  /** Family name */
  family_name?: string;
  /** Token version */
  ver?: string;
  /** Tenant ID */
  tid?: string;
}

export interface VerifiedUser {
  externalId: string;
  email?: string;
  name?: string;
}

export interface LocalUserProfile {
  id: string;
  externalId: string;
  email: string | null;
  plan: 'FREE' | 'PRO';
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom error classes for better error handling
// ─────────────────────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
    public readonly statusCode: number = 401,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export type AuthErrorCode =
  | 'TOKEN_MISSING'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_CLAIM_INVALID'
  | 'JWKS_FETCH_FAILED'
  | 'USER_CREATE_FAILED'
  | 'CONFIG_INVALID';

// ─────────────────────────────────────────────────────────────────────────────
// JWKS management
// ─────────────────────────────────────────────────────────────────────────────

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks) {
    const { jwksUri } = loadAuthConfig();
    jwks = createRemoteJWKSet(new URL(jwksUri));
  }
  return jwks;
}

/** Reset JWKS cache - useful for testing or key rotation scenarios */
export function resetJwksCache(): void {
  jwks = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Token validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a Bearer token and extracts user information.
 * 
 * @param token - The JWT token (without "Bearer " prefix)
 * @returns Verified user information from the token
 * @throws {AuthError} If validation fails
 */
export async function validateBearerToken(token: string): Promise<VerifiedUser> {
  if (!token || typeof token !== 'string') {
    throw new AuthError('Token is required', 'TOKEN_MISSING', 401);
  }

  const { issuer, audience } = loadAuthConfig();
  
  let payload: EntraJWTPayload;
  try {
    const result = await jwtVerify(token, getJwks(), {
      issuer,
      audience,
    });
    payload = result.payload as EntraJWTPayload;
  } catch (err) {
    // Handle specific jose errors with appropriate error codes
    if (err instanceof joseErrors.JWTExpired) {
      throw new AuthError('Token has expired', 'TOKEN_EXPIRED', 401, err);
    }
    if (err instanceof joseErrors.JWTClaimValidationFailed) {
      throw new AuthError(`Token claim validation failed: ${err.claim}`, 'TOKEN_CLAIM_INVALID', 401, err);
    }
    if (err instanceof joseErrors.JWKSNoMatchingKey) {
      throw new AuthError('No matching key found for token signature', 'TOKEN_INVALID', 401, err);
    }
    if (err instanceof joseErrors.JOSEError) {
      throw new AuthError(`Token verification failed: ${err.message}`, 'TOKEN_INVALID', 401, err);
    }
    // Unknown error
    throw new AuthError('Token verification failed', 'TOKEN_INVALID', 401, err instanceof Error ? err : undefined);
  }

  // Extract user identifier (prefer oid for Azure AD, fallback to sub)
  const externalId = payload.oid ?? payload.sub;
  if (!externalId) {
    throw new AuthError('Token missing required user identifier (oid/sub)', 'TOKEN_CLAIM_INVALID', 401);
  }

  // Extract email from various possible claims
  const email = payload.emails?.[0] ?? payload.email ?? payload.preferred_username;
  
  // Extract display name if available
  const name = payload.name ?? 
    (payload.given_name && payload.family_name 
      ? `${payload.given_name} ${payload.family_name}` 
      : undefined);

  return { externalId, email, name };
}

// ─────────────────────────────────────────────────────────────────────────────
// User management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gets or creates a local user record based on the verified external identity.
 * 
 * @param user - Verified user from token validation
 * @returns Local user profile with subscription plan
 * @throws {AuthError} If database operation fails
 */
export async function getOrCreateLocalUser(user: VerifiedUser): Promise<LocalUserProfile> {
  try {
    let dbUser = await prisma.user.findUnique({ 
      where: { externalId: user.externalId } 
    });

    if (!dbUser) {
      // Create new user with default FREE plan
      dbUser = await prisma.user.create({
        data: {
          externalId: user.externalId,
          email: user.email ?? null,
          plan: 'FREE',
        },
      });
    } else if (user.email && dbUser.email !== user.email) {
      // Keep email in sync if changed in IdP
      dbUser = await prisma.user.update({ 
        where: { id: dbUser.id }, 
        data: { email: user.email } 
      });
    }

    return {
      id: dbUser.id,
      externalId: dbUser.externalId,
      email: dbUser.email,
      plan: dbUser.plan as 'FREE' | 'PRO',
    };
  } catch (err) {
    throw new AuthError(
      'Failed to create or update user record', 
      'USER_CREATE_FAILED', 
      500, 
      err instanceof Error ? err : undefined
    );
  }
}
