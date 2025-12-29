/**
 * Password hashing and validation utilities
 * Uses bcrypt for secure password hashing with configurable work factor
 */

import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

// Work factor for bcrypt - higher = more secure but slower
// 12 is recommended for production (takes ~250ms on modern hardware)
const BCRYPT_ROUNDS = 12;

// Password requirements
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;

export interface PasswordValidationResult {
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
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Stored hash to compare against
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password against requirements
 * @param password - Password to validate
 * @returns Validation result with errors and strength
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  const requirements = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    maxLength: password.length <= PASSWORD_MAX_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  };

  if (!requirements.minLength) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!requirements.maxLength) {
    errors.push(`Password must be less than ${PASSWORD_MAX_LENGTH} characters`);
  }
  if (!requirements.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!requirements.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!requirements.hasNumber) {
    errors.push('Password must contain at least one number');
  }
  if (!requirements.hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  // Calculate strength based on met requirements
  const metCount = Object.values(requirements).filter(Boolean).length;
  let strength: 'weak' | 'medium' | 'strong';
  
  if (metCount <= 3) {
    strength = 'weak';
  } else if (metCount <= 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    requirements,
  };
}

/**
 * Check password against Have I Been Pwned database using k-Anonymity
 * Only sends first 5 chars of SHA-1 hash to protect privacy
 * @param password - Password to check
 * @returns True if password has been found in data breaches
 */
export async function checkPasswordBreached(password: string): Promise<boolean> {
  // Hash the password with SHA-1 (required by HIBP API)
  const sha1Hash = createHash('sha1').update(password).digest('hex').toUpperCase();
  
  // Send only first 5 characters (k-Anonymity)
  const prefix = sha1Hash.substring(0, 5);
  const suffix = sha1Hash.substring(5);
  
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'ProteinLens-Security-Check',
      },
    });
    
    if (!response.ok) {
      // If API fails, don't block signup but log it
      console.warn('[Password] HIBP API check failed:', response.status);
      return false;
    }
    
    const text = await response.text();
    
    // Response is in format: SUFFIX:COUNT\r\n
    // Check if our suffix appears in the response
    const lines = text.split('\r\n');
    for (const line of lines) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix === suffix) {
        return true; // Password found in breach database
      }
    }
    
    return false;
  } catch (error) {
    // Network error - don't block signup
    console.warn('[Password] HIBP API check error:', error);
    return false;
  }
}

/**
 * Generate a secure random token for email verification, password reset, etc.
 * @param length - Length of the token in bytes (default 32 = 64 hex chars)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash a token for storage (using SHA-256)
 * Tokens should be stored as hashes, with only the original sent to user
 * @param token - Plain token
 * @returns SHA-256 hash of the token
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
