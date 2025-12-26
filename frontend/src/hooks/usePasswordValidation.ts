/**
 * usePasswordValidation Hook
 * Feature 010 - User Signup Process
 * 
 * Provides real-time password validation with strength calculation
 * and breach checking via HIBP k-Anonymity API.
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  notBreached?: boolean;
}

export interface PasswordValidationResult {
  strength: PasswordStrength;
  level: 'weak' | 'medium' | 'strong';
  isValid: boolean;
  isChecking: boolean;
}

// SHA-1 hash function using Web Crypto API
async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Check password against HIBP using k-Anonymity
async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true',
      },
    });

    if (!response.ok) {
      // On API error, assume not breached
      return false;
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix && hashSuffix.trim() === suffix) {
        return true; // Password is breached
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking password breach:', error);
    return false; // On error, assume not breached
  }
}

// Calculate password strength without breach check
function calculateStrength(password: string): Omit<PasswordStrength, 'notBreached'> {
  return {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

// Calculate strength level
function getStrengthLevel(
  strength: Omit<PasswordStrength, 'notBreached'>
): 'weak' | 'medium' | 'strong' {
  const passed = Object.values(strength).filter(Boolean).length;
  if (passed <= 2) return 'weak';
  if (passed <= 4) return 'medium';
  return 'strong';
}

export interface UsePasswordValidationOptions {
  /** Whether to check for breaches (default true) */
  checkBreaches?: boolean;
  /** Debounce delay for breach checking (default 500ms) */
  breachCheckDelay?: number;
}

/**
 * Hook for validating password strength and checking breaches.
 * 
 * @param password - The password to validate
 * @param options - Validation options
 * @returns Validation result with strength and breach status
 */
export function usePasswordValidation(
  password: string,
  options: UsePasswordValidationOptions = {}
): PasswordValidationResult {
  const { checkBreaches = true, breachCheckDelay = 500 } = options;

  const [strength, setStrength] = useState<PasswordStrength>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [isChecking, setIsChecking] = useState(false);

  // Debounce password for breach checking
  const debouncedPassword = useDebounce(password, breachCheckDelay);

  // Calculate basic strength immediately (no debounce)
  useEffect(() => {
    const basicStrength = calculateStrength(password);
    setStrength(prev => ({
      ...basicStrength,
      notBreached: prev.notBreached, // Preserve previous breach status
    }));
  }, [password]);

  // Check for breaches with debounce
  useEffect(() => {
    if (!checkBreaches || !debouncedPassword || debouncedPassword.length < 8) {
      // Don't check short passwords or if disabled
      setStrength(prev => ({ ...prev, notBreached: undefined }));
      return;
    }

    let cancelled = false;

    const checkBreach = async () => {
      setIsChecking(true);
      try {
        const isBreached = await checkPasswordBreach(debouncedPassword);
        if (!cancelled) {
          setStrength(prev => ({ ...prev, notBreached: !isBreached }));
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    checkBreach();

    return () => {
      cancelled = true;
    };
  }, [debouncedPassword, checkBreaches]);

  // Calculate level
  const level = getStrengthLevel(strength);

  // Check if valid (all requirements met)
  const isValid =
    strength.minLength &&
    strength.hasUppercase &&
    strength.hasLowercase &&
    strength.hasNumber &&
    strength.hasSpecial &&
    (strength.notBreached === undefined || strength.notBreached);

  return {
    strength,
    level,
    isValid,
    isChecking,
  };
}

export default usePasswordValidation;
