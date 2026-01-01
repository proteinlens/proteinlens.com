// Share ID generator utility using nanoid
// Feature 017: Shareable Meal Scans & Diet Style Profiles
// T002: Create shareId generator utility

import { customAlphabet } from 'nanoid';

// URL-safe alphabet: alphanumeric only (no special chars that need encoding)
const SHARE_ID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SHARE_ID_LENGTH = 10;

// Create custom nanoid generator
const generateNanoid = customAlphabet(SHARE_ID_ALPHABET, SHARE_ID_LENGTH);

/**
 * Generate a unique share ID for meal URLs
 * 
 * @returns 10-character alphanumeric string (62^10 = 839 quadrillion combinations)
 * @example "abc12XYZ90"
 */
export function generateShareId(): string {
  return generateNanoid();
}

/**
 * Validate a share ID format
 * 
 * @param shareId - The share ID to validate
 * @returns true if valid format, false otherwise
 */
export function isValidShareId(shareId: string): boolean {
  if (!shareId || typeof shareId !== 'string') return false;
  if (shareId.length !== SHARE_ID_LENGTH) return false;
  
  // Check all characters are in allowed alphabet
  const validChars = new Set(SHARE_ID_ALPHABET.split(''));
  return shareId.split('').every(char => validChars.has(char));
}

/**
 * Get the frontend URL for a shareable meal
 * 
 * @param shareId - The share ID
 * @returns Full URL like "https://www.proteinlens.com/meal/abc12XYZ90"
 */
export function getShareUrl(shareId: string): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://www.proteinlens.com';
  return `${baseUrl}/meal/${shareId}`;
}
