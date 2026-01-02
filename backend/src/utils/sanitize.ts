/**
 * T086: Input sanitization utilities for user-entered data
 * Prevents XSS, injection attacks, and ensures data integrity
 */

/**
 * Remove HTML tags from a string
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Remove control characters that could cause issues
 */
export function removeControlChars(input: string): string {
  // Remove ASCII control characters (0x00-0x1F) except newlines and tabs
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Trim and collapse multiple whitespace to single spaces
 */
export function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize a food name for database storage
 * - Removes HTML
 * - Limits length
 * - Normalizes whitespace
 * - Removes control characters
 */
export function sanitizeFoodName(input: string, maxLength: number = 100): string {
  let sanitized = stripHtml(input);
  sanitized = removeControlChars(sanitized);
  sanitized = normalizeWhitespace(sanitized);
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }
  
  return sanitized;
}

/**
 * Sanitize a portion description
 */
export function sanitizePortion(input: string, maxLength: number = 50): string {
  let sanitized = stripHtml(input);
  sanitized = removeControlChars(sanitized);
  sanitized = normalizeWhitespace(sanitized);
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }
  
  return sanitized;
}

/**
 * Sanitize and validate a protein value
 * Returns the value clamped to valid range, or null if invalid
 */
export function sanitizeProteinValue(input: unknown): number | null {
  // Handle string input
  let value: number;
  if (typeof input === 'string') {
    value = parseFloat(input);
  } else if (typeof input === 'number') {
    value = input;
  } else {
    return null;
  }

  // Check for valid number
  if (!Number.isFinite(value)) {
    return null;
  }

  // Clamp to reasonable range (0-500g protein per item)
  const MIN_PROTEIN = 0;
  const MAX_PROTEIN = 500;
  
  return Math.max(MIN_PROTEIN, Math.min(MAX_PROTEIN, Math.round(value * 10) / 10));
}

/**
 * Sanitize and validate a carbohydrate value
 * Returns the value clamped to valid range, or null if invalid
 * NEW - macro ingredients analysis
 */
export function sanitizeCarbsValue(input: unknown): number | null {
  // Handle string input
  let value: number;
  if (typeof input === 'string') {
    value = parseFloat(input);
  } else if (typeof input === 'number') {
    value = input;
  } else {
    return null;
  }

  // Check for valid number
  if (!Number.isFinite(value)) {
    return null;
  }

  // Clamp to reasonable range (0-500g carbs per item)
  const MIN_CARBS = 0;
  const MAX_CARBS = 500;
  
  return Math.max(MIN_CARBS, Math.min(MAX_CARBS, Math.round(value * 10) / 10));
}

/**
 * Sanitize and validate a fat value
 * Returns the value clamped to valid range, or null if invalid
 * NEW - macro ingredients analysis
 */
export function sanitizeFatValue(input: unknown): number | null {
  // Handle string input
  let value: number;
  if (typeof input === 'string') {
    value = parseFloat(input);
  } else if (typeof input === 'number') {
    value = input;
  } else {
    return null;
  }

  // Check for valid number
  if (!Number.isFinite(value)) {
    return null;
  }

  // Clamp to reasonable range (0-300g fat per item)
  const MIN_FAT = 0;
  const MAX_FAT = 300;
  
  return Math.max(MIN_FAT, Math.min(MAX_FAT, Math.round(value * 10) / 10));
}

/**
 * Sanitize user notes/comments
 */
export function sanitizeNotes(input: string, maxLength: number = 500): string {
  let sanitized = stripHtml(input);
  sanitized = removeControlChars(sanitized);
  // Keep newlines in notes but normalize other whitespace
  sanitized = sanitized.replace(/[^\S\n]+/g, ' ').trim();
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }
  
  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string): string {
  // Lowercase and trim
  let sanitized = input.toLowerCase().trim();
  
  // Remove any characters that aren't valid in email
  sanitized = sanitized.replace(/[^\w.@+-]/g, '');
  
  return sanitized;
}

/**
 * Sanitize a meal corrections object
 */
export interface MealCorrectionInput {
  foods: Array<{
    name: string;
    portion: string;
    protein: number | string;
  }>;
  totalProtein?: number | string;
}

export interface SanitizedMealCorrection {
  foods: Array<{
    name: string;
    portion: string;
    protein: number;
  }>;
  totalProtein: number;
}

export function sanitizeMealCorrections(input: MealCorrectionInput): SanitizedMealCorrection | null {
  if (!input || !Array.isArray(input.foods)) {
    return null;
  }

  const sanitizedFoods = input.foods
    .map(food => {
      const name = sanitizeFoodName(food.name || '');
      const portion = sanitizePortion(food.portion || '');
      const protein = sanitizeProteinValue(food.protein);

      // Skip invalid entries
      if (!name || protein === null) {
        return null;
      }

      return { name, portion, protein };
    })
    .filter((f): f is { name: string; portion: string; protein: number } => f !== null);

  if (sanitizedFoods.length === 0) {
    return null;
  }

  // Calculate or sanitize total protein
  let totalProtein: number;
  if (input.totalProtein !== undefined) {
    const sanitizedTotal = sanitizeProteinValue(input.totalProtein);
    totalProtein = sanitizedTotal !== null ? sanitizedTotal : 
      sanitizedFoods.reduce((sum, f) => sum + f.protein, 0);
  } else {
    totalProtein = sanitizedFoods.reduce((sum, f) => sum + f.protein, 0);
  }

  return {
    foods: sanitizedFoods,
    totalProtein: Math.round(totalProtein * 10) / 10,
  };
}

/**
 * Validate and sanitize a UUID
 */
export function sanitizeUuid(input: string): string | null {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const trimmed = input.trim().toLowerCase();
  
  if (uuidRegex.test(trimmed)) {
    return trimmed;
  }
  
  return null;
}

/**
 * Sanitize SQL LIKE pattern to prevent injection
 */
export function escapeLikePattern(input: string): string {
  // Escape special LIKE characters: % _ \ 
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}
