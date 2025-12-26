/**
 * PII Sanitizer - Redacts sensitive data from telemetry
 * Feature 011: Observability
 * 
 * Implements blocklist-based sanitization per research.md
 * All telemetry data passes through this before being sent to Application Insights
 */

// Patterns for field names that contain PII
const PII_FIELD_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /email|mail|e-mail/i, replacement: '[REDACTED_EMAIL]' },
  { pattern: /password|pwd|passwd|secret|token|apikey|api_key/i, replacement: '[REDACTED]' },
  { pattern: /firstName|first_name|lastName|last_name|fullName|full_name/i, replacement: '[REDACTED_NAME]' },
  { pattern: /^name$/i, replacement: '[REDACTED_NAME]' }, // Exact match for 'name' field
  { pattern: /phone|mobile|tel|telephone/i, replacement: '[REDACTED_PHONE]' },
  { pattern: /address|street|city|zip|postal/i, replacement: '[REDACTED_ADDRESS]' },
  { pattern: /ssn|social_security|socialSecurity|national_id/i, replacement: '[REDACTED_SSN]' },
  { pattern: /credit_card|creditCard|card_number|cardNumber|cvv|cvc/i, replacement: '[REDACTED_CC]' },
  { pattern: /authorization|bearer/i, replacement: '[REDACTED]' },
];

// Regex to detect email addresses in string values
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;

// Regex to detect potential JWT tokens (3 base64 sections separated by dots)
const JWT_REGEX = /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g;

// Regex to detect credit card numbers (13-19 digits, optionally with spaces/dashes)
const CC_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;

/**
 * Check if a field name matches any PII pattern
 */
function getReplacementForField(fieldName: string): string | null {
  for (const { pattern, replacement } of PII_FIELD_PATTERNS) {
    if (pattern.test(fieldName)) {
      return replacement;
    }
  }
  return null;
}

/**
 * Sanitize a string value by redacting embedded PII patterns
 */
function sanitizeStringValue(value: string): string {
  let sanitized = value;
  
  // Redact email addresses
  sanitized = sanitized.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
  
  // Redact JWT tokens
  sanitized = sanitized.replace(JWT_REGEX, '[REDACTED_TOKEN]');
  
  // Redact credit card numbers
  sanitized = sanitized.replace(CC_REGEX, '[REDACTED_CC]');
  
  return sanitized;
}

/**
 * Deep clone and sanitize an object, redacting PII fields and values
 */
export function sanitize<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        return sanitize(item as Record<string, unknown>);
      }
      if (typeof item === 'string') {
        return sanitizeStringValue(item);
      }
      return item;
    }) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Check if field name indicates PII
    const replacement = getReplacementForField(key);
    
    if (replacement !== null && value !== undefined && value !== null) {
      // Field name matches PII pattern - redact the value
      sanitized[key] = replacement;
    } else if (typeof value === 'string') {
      // Sanitize string values for embedded PII
      sanitized[key] = sanitizeStringValue(value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitize(value as Record<string, unknown>);
    } else {
      // Pass through numbers, booleans, null, undefined
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize error messages and stack traces
 */
export function sanitizeError(error: Error): { message: string; stack?: string } {
  return {
    message: sanitizeStringValue(error.message),
    stack: error.stack ? sanitizeStringValue(error.stack) : undefined,
  };
}

/**
 * Check if a value contains potential PII (for validation/testing)
 */
export function containsPII(value: unknown): boolean {
  if (typeof value === 'string') {
    if (EMAIL_REGEX.test(value)) return true;
    if (JWT_REGEX.test(value)) return true;
    if (CC_REGEX.test(value)) return true;
  }
  
  if (typeof value === 'object' && value !== null) {
    for (const [key, val] of Object.entries(value)) {
      if (getReplacementForField(key) !== null) return true;
      if (containsPII(val)) return true;
    }
  }
  
  return false;
}

/**
 * Create a telemetry-safe copy of request properties
 */
export function sanitizeRequestContext(request: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  if (request.url) {
    // Remove query params that might contain PII
    const url = new URL(request.url, 'http://localhost');
    sanitized.path = url.pathname;
    sanitized.method = request.method;
  }
  
  if (request.headers) {
    // Only include safe headers
    const safeHeaders: Record<string, string> = {};
    const allowedHeaders = ['content-type', 'accept', 'user-agent', 'x-correlation-id', 'traceparent'];
    
    for (const [key, value] of Object.entries(request.headers)) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        safeHeaders[key] = value;
      }
    }
    sanitized.headers = safeHeaders;
  }
  
  // Never log request body - too risky for PII
  // If needed, body should be explicitly sanitized by the caller
  
  return sanitized;
}
