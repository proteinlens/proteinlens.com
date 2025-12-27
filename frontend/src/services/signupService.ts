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
 * 
 * Note: Main signup/signin are now in authService.ts
 */

import { API_ENDPOINTS } from '../config';
import { getValidAccessToken } from './authService';

export interface CheckEmailResponse {
  available: boolean;
  requireCaptcha?: boolean;
}

export interface PasswordValidationResponse {
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
  isBreached: boolean;
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
 * Helper to make authenticated API requests
 */
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidAccessToken();
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new SignupApiError(
      errorData.error || 'Request failed',
      response.status,
      errorData
    );
  }
  
  return response.json();
}

/**
 * Check if an email address is available for registration.
 * 
 * @param email - Email address to check
 * @returns Whether the email is available
 */
export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  const response = await fetch(`${API_ENDPOINTS.AUTH_CHECK_EMAIL}?email=${encodeURIComponent(email)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new SignupApiError(
      errorData.error || 'Failed to check email',
      response.status,
      errorData
    );
  }
  
  return response.json();
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
  const response = await fetch(API_ENDPOINTS.AUTH_VALIDATE_PASSWORD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new SignupApiError(
      errorData.error || 'Failed to validate password',
      response.status,
      errorData
    );
  }
  
  return response.json();
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
