/**
 * Password Validator Utility
 * Feature 010 - User Signup Process
 * 
 * Validates password strength and checks against known data breaches
 * using the Have I Been Pwned (HIBP) k-Anonymity API.
 * 
 * Privacy: Only the first 5 characters of the SHA-1 hash are sent to HIBP.
 * The full hash is compared locally against the returned list.
 */

import { createHash } from 'crypto';
import { validatePasswordRequirements, getStrengthLevel, type PasswordStrength } from '../models/signupSchema.js';
import { Logger } from './logger.js';

const HIBP_API_URL = 'https://api.pwnedpasswords.com/range';
const HIBP_TIMEOUT_MS = 5000;

/**
 * Hash a password using SHA-1 (required by HIBP API).
 * @param password - The password to hash
 * @returns Uppercase SHA-1 hash
 */
function sha1Hash(password: string): string {
  return createHash('sha1').update(password).digest('hex').toUpperCase();
}

/**
 * Check if a password appears in known data breaches using HIBP k-Anonymity.
 * 
 * How it works:
 * 1. Hash the password with SHA-1
 * 2. Send only the first 5 characters to HIBP API
 * 3. HIBP returns all hash suffixes that match that prefix
 * 4. Check locally if the full hash appears in the response
 * 
 * @param password - The password to check
 * @returns Object with breached (boolean) and count (number of breaches)
 */
export async function checkPasswordBreach(password: string): Promise<{ breached: boolean; count: number }> {
  try {
    const hash = sha1Hash(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HIBP_TIMEOUT_MS);

    try {
      const response = await fetch(`${HIBP_API_URL}/${prefix}`, {
        headers: {
          'User-Agent': 'ProteinLens-Signup/1.0',
          'Add-Padding': 'true', // Adds random padding to prevent response analysis
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        Logger.warn('HIBP API returned non-OK status', { status: response.status });
        // On API error, assume password is not breached (fail open for UX)
        return { breached: false, count: 0 };
      }

      const text = await response.text();
      
      // HIBP returns lines in format: HASH_SUFFIX:COUNT
      // e.g., "0018A45C4D1DEF81644B54AB7F969B88D65:1"
      const lines = text.split('\n');
      
      for (const line of lines) {
        const [hashSuffix, countStr] = line.split(':');
        if (hashSuffix && hashSuffix.trim() === suffix) {
          const count = parseInt(countStr.trim(), 10) || 0;
          Logger.info('Password found in breach database', { count });
          return { breached: true, count };
        }
      }

      return { breached: false, count: 0 };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      Logger.warn('HIBP API request timed out');
    } else {
      Logger.error('Error checking password breach', error as Error);
    }
    // On error, assume password is not breached (fail open for UX)
    return { breached: false, count: 0 };
  }
}

/**
 * Validate password strength and check for breaches.
 * Combines local validation with HIBP breach checking.
 * 
 * @param password - The password to validate
 * @returns Full validation result including strength and breach status
 */
export async function validatePassword(password: string): Promise<{
  strength: PasswordStrength;
  level: 'weak' | 'medium' | 'strong';
  breached: boolean;
  breachCount: number;
  valid: boolean;
}> {
  // First, check local requirements
  const strength = validatePasswordRequirements(password);
  
  // Check if password is in breach database
  const { breached, count: breachCount } = await checkPasswordBreach(password);
  strength.notBreached = !breached;
  
  // Calculate strength level
  const level = getStrengthLevel(strength);
  
  // Password is valid if all requirements are met (including not breached)
  const valid = Object.values(strength).every(Boolean);
  
  return {
    strength,
    level,
    breached,
    breachCount,
    valid,
  };
}

/**
 * Quick validation without breach check (for real-time frontend feedback).
 * Use validatePassword for final validation before submission.
 * 
 * @param password - The password to validate
 * @returns Strength object and level (without breach check)
 */
export function validatePasswordSync(password: string): {
  strength: Omit<PasswordStrength, 'notBreached'>;
  level: 'weak' | 'medium' | 'strong';
} {
  const strength = validatePasswordRequirements(password);
  // Exclude breach check from sync validation
  const { notBreached: _, ...strengthWithoutBreach } = strength;
  
  // Calculate level without breach status
  const passed = Object.values(strengthWithoutBreach).filter(Boolean).length;
  let level: 'weak' | 'medium' | 'strong';
  if (passed <= 2) level = 'weak';
  else if (passed <= 4) level = 'medium';
  else level = 'strong';
  
  return { strength: strengthWithoutBreach, level };
}
