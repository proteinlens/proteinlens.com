/**
 * Signup Service
 * Feature 010 - User Signup Process
 * 
 * API calls for signup-related operations:
 * - Check email availability
 * - Validate password
 * - Complete profile
 * - Manage consent
 * - Resend verification
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface CheckEmailResponse {
  available: boolean;
  requireCaptcha?: boolean;
}

export interface PasswordValidationResponse {
  strength: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    notBreached: boolean;
  };
  level: 'weak' | 'medium' | 'strong';
  breached: boolean;
  valid: boolean;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  phone?: string;
  consents: Array<{
    consentType: 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'MARKETING_EMAILS';
    documentVersion: string;
  }>;
}

export interface ProfileResponse {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  profileCompleted: boolean;
  emailVerified: boolean;
}

export interface ConsentRecord {
  type: string;
  version: string;
  grantedAt: string;
}

export interface ConsentResponse {
  consents: ConsentRecord[];
}

export interface ResendVerificationResponse {
  message: string;
  attemptsRemaining: number;
}

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  // This will be provided by MSAL context
  // For now, return null and let the API handle unauthenticated requests
  return null;
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add auth token if available
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new SignupApiError(
      errorData.error || 'An error occurred',
      response.status,
      errorData
    );
  }

  return response.json();
}

export class SignupApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SignupApiError';
  }
}

/**
 * Check if an email address is available for registration.
 * 
 * @param email - Email address to check
 * @returns Whether the email is available
 */
export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  return apiRequest<CheckEmailResponse>('/signup/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Validate password strength and check for breaches.
 * 
 * @param password - Password to validate
 * @returns Validation result with strength and breach status
 */
export async function validatePassword(
  password: string
): Promise<PasswordValidationResponse> {
  return apiRequest<PasswordValidationResponse>('/signup/validate-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

/**
 * Create or update user profile after B2C signup.
 * Requires authentication.
 * 
 * @param data - Profile data and consent records
 * @returns Created/updated profile
 */
export async function createProfile(data: ProfileData): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/signup/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get user's consent records.
 * Requires authentication.
 * 
 * @returns List of consent records
 */
export async function getConsents(): Promise<ConsentResponse> {
  return apiRequest<ConsentResponse>('/signup/consent', {
    method: 'GET',
  });
}

/**
 * Record a new consent (e.g., for updated ToS).
 * Requires authentication.
 * 
 * @param consentType - Type of consent
 * @param documentVersion - Version of the document being accepted
 * @returns Created consent record
 */
export async function recordConsent(
  consentType: 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'MARKETING_EMAILS',
  documentVersion: string
): Promise<ConsentRecord> {
  return apiRequest<ConsentRecord>('/signup/consent', {
    method: 'POST',
    body: JSON.stringify({ consentType, documentVersion }),
  });
}

/**
 * Request resend of verification email.
 * Requires authentication. Limited to 10 per day.
 * 
 * @returns Confirmation and remaining attempts
 */
export async function resendVerification(): Promise<ResendVerificationResponse> {
  return apiRequest<ResendVerificationResponse>('/signup/resend-verification', {
    method: 'POST',
  });
}
