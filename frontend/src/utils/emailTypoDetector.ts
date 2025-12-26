/**
 * Email Typo Detection Utility
 * Feature 010 - User Signup Process
 * 
 * Detects common typos in email domains and suggests corrections.
 * Uses Levenshtein distance to find similar known domains.
 */

// Common email domains for typo detection
const KNOWN_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'live.com',
  'msn.com',
  'me.com',
  'mac.com',
  // Business domains
  'company.com',
  'work.com',
  'office.com',
  // Regional
  'yahoo.co.uk',
  'hotmail.co.uk',
  'googlemail.com',
];

// Common typo patterns: typo -> correction
const TYPO_PATTERNS: Record<string, string> = {
  // Gmail typos
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmailc.om': 'gmail.com',
  'gmailcom': 'gmail.com',
  
  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'tahoo.com': 'yahoo.com',
  'uahoo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.cm': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  
  // Hotmail typos
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotnail.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.cm': 'hotmail.com',
  
  // Outlook typos
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlool.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.cm': 'outlook.com',
  'outook.com': 'outlook.com',
  
  // iCloud typos
  'iclod.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'icloude.com': 'icloud.com',
  'iclould.com': 'icloud.com',
};

/**
 * Calculate Levenshtein distance between two strings.
 * Used for fuzzy matching of email domains.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find the closest known domain using Levenshtein distance.
 * Returns null if no close match is found.
 */
function findClosestDomain(domain: string, maxDistance = 2): string | null {
  let closestDomain: string | null = null;
  let minDistance = Infinity;

  for (const knownDomain of KNOWN_DOMAINS) {
    const distance = levenshteinDistance(domain.toLowerCase(), knownDomain);
    if (distance < minDistance && distance <= maxDistance && distance > 0) {
      minDistance = distance;
      closestDomain = knownDomain;
    }
  }

  return closestDomain;
}

export interface EmailTypoResult {
  /** Original email entered by user */
  email: string;
  /** Whether a typo was detected */
  hasTypo: boolean;
  /** Suggested correction (if typo detected) */
  suggestion: string | null;
  /** Full corrected email (if typo detected) */
  correctedEmail: string | null;
  /** Domain that was checked */
  domain: string;
}

/**
 * Check an email address for common domain typos.
 * Returns suggestion if a likely typo is detected.
 * 
 * @param email - The email address to check
 * @returns Object with typo detection result
 */
export function detectEmailTypo(email: string): EmailTypoResult {
  const normalized = email.toLowerCase().trim();
  
  // Extract domain
  const atIndex = normalized.lastIndexOf('@');
  if (atIndex === -1) {
    return {
      email: normalized,
      hasTypo: false,
      suggestion: null,
      correctedEmail: null,
      domain: '',
    };
  }

  const localPart = normalized.substring(0, atIndex);
  const domain = normalized.substring(atIndex + 1);

  // Check for exact typo pattern match first
  const patternMatch = TYPO_PATTERNS[domain];
  if (patternMatch) {
    return {
      email: normalized,
      hasTypo: true,
      suggestion: patternMatch,
      correctedEmail: `${localPart}@${patternMatch}`,
      domain,
    };
  }

  // Check if already a known domain (no typo)
  if (KNOWN_DOMAINS.includes(domain)) {
    return {
      email: normalized,
      hasTypo: false,
      suggestion: null,
      correctedEmail: null,
      domain,
    };
  }

  // Use Levenshtein distance for fuzzy matching
  const closestDomain = findClosestDomain(domain);
  if (closestDomain) {
    return {
      email: normalized,
      hasTypo: true,
      suggestion: closestDomain,
      correctedEmail: `${localPart}@${closestDomain}`,
      domain,
    };
  }

  // No typo detected
  return {
    email: normalized,
    hasTypo: false,
    suggestion: null,
    correctedEmail: null,
    domain,
  };
}

/**
 * Validate email format using a regex.
 * This is a basic check; full validation should happen server-side.
 */
export function isValidEmailFormat(email: string): boolean {
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Get a user-friendly message for an email typo suggestion.
 * 
 * @param result - EmailTypoResult from detectEmailTypo
 * @returns User-friendly message or null if no suggestion
 */
export function getTypoSuggestionMessage(result: EmailTypoResult): string | null {
  if (!result.hasTypo || !result.suggestion) {
    return null;
  }
  return `Did you mean ${result.suggestion}?`;
}
