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
  externalId: string | null;
  email: string | null;
  plan: 'FREE' | 'PRO';
  suspended: boolean;
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
          email: user.email || undefined,
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
      suspended: dbUser.suspended ?? false,
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

// ─────────────────────────────────────────────────────────────────────────────
// Profile completion (Feature 010 - User Signup)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileCompletionInput {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  phone?: string;
}

export interface ExtendedUserProfile extends LocalUserProfile {
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phone: string | null;
  emailVerified: boolean;
  profileCompleted: boolean;
}

/**
 * Complete a user's profile after signup.
 * Used for both email/password and social login users.
 * 
 * @param user - Verified user from token validation
 * @param profileData - Profile fields to update
 * @returns Updated user profile
 * @throws {AuthError} If database operation fails
 */
export async function completeSignupProfile(
  user: VerifiedUser,
  profileData: ProfileCompletionInput
): Promise<ExtendedUserProfile> {
  try {
    // First, ensure user exists
    let dbUser = await prisma.user.findUnique({
      where: { externalId: user.externalId },
    });

    if (!dbUser) {
      // Create new user with profile data
      dbUser = await prisma.user.create({
        data: {
          externalId: user.externalId,
          email: user.email || undefined,
          firstName: profileData.firstName ?? null,
          lastName: profileData.lastName ?? null,
          organizationName: profileData.organizationName ?? null,
          phone: profileData.phone ?? null,
          emailVerified: false, // Will be updated when B2C verification completes
          profileCompleted: !!(profileData.firstName && profileData.lastName),
          plan: 'FREE',
        },
      });
    } else {
      // Update existing user with profile data
      const updateData: Record<string, unknown> = {};
      
      if (profileData.firstName !== undefined) {
        updateData.firstName = profileData.firstName;
      }
      if (profileData.lastName !== undefined) {
        updateData.lastName = profileData.lastName;
      }
      if (profileData.organizationName !== undefined) {
        updateData.organizationName = profileData.organizationName;
      }
      if (profileData.phone !== undefined) {
        updateData.phone = profileData.phone;
      }
      
      // Keep email in sync from token
      if (user.email && dbUser.email !== user.email) {
        updateData.email = user.email;
      }

      // Calculate profileCompleted status
      const newFirstName = profileData.firstName ?? dbUser.firstName;
      const newLastName = profileData.lastName ?? dbUser.lastName;
      updateData.profileCompleted = !!(newFirstName && newLastName);

      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: updateData,
      });
    }

    return {
      id: dbUser.id,
      externalId: dbUser.externalId,
      email: dbUser.email,
      plan: dbUser.plan as 'FREE' | 'PRO',
      suspended: dbUser.suspended ?? false,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      organizationName: dbUser.organizationName,
      phone: dbUser.phone,
      emailVerified: dbUser.emailVerified,
      profileCompleted: dbUser.profileCompleted,
    };
  } catch (err) {
    throw new AuthError(
      'Failed to complete user profile',
      'USER_CREATE_FAILED',
      500,
      err instanceof Error ? err : undefined
    );
  }
}

/**
 * Get extended user profile with all signup fields.
 * 
 * @param externalId - B2C external ID
 * @returns Extended user profile or null if not found
 */
export async function getExtendedUserProfile(
  externalId: string
): Promise<ExtendedUserProfile | null> {
  const dbUser = await prisma.user.findUnique({
    where: { externalId },
  });

  if (!dbUser) {
    return null;
  }

  return {
    id: dbUser.id,
    externalId: dbUser.externalId,
    email: dbUser.email,
    plan: dbUser.plan as 'FREE' | 'PRO',
    suspended: dbUser.suspended ?? false,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    organizationName: dbUser.organizationName,
    phone: dbUser.phone,
    emailVerified: dbUser.emailVerified,
    profileCompleted: dbUser.profileCompleted,
  };
}

/**
 * Update email verification status from B2C callback.
 * 
 * @param externalId - B2C external ID
 * @param verified - Whether email is verified
 */
export async function updateEmailVerificationStatus(
  externalId: string,
  verified: boolean
): Promise<void> {
  await prisma.user.update({
    where: { externalId },
    data: { emailVerified: verified },
  });
}

/**
 * Check if an email already exists in the system.
 * Used to detect duplicate signups.
 * 
 * @param email - Email to check
 * @returns True if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim() },
  });
  return user !== null;
}
