/**
 * Signup Validation Schemas
 * Feature 010 - User Signup Process
 * 
 * Zod schemas for validating signup form data and password strength.
 * Used by both frontend (client-side validation) and backend (server-side validation).
 */

import { z } from 'zod';

// ===========================================
// Password Strength Schema
// ===========================================

export const passwordStrengthSchema = z.object({
  minLength: z.boolean(),      // >= 12 chars
  hasUppercase: z.boolean(),   // [A-Z]
  hasLowercase: z.boolean(),   // [a-z]
  hasNumber: z.boolean(),      // [0-9]
  hasSpecial: z.boolean(),     // Special chars
  notBreached: z.boolean(),    // Not in breach list
});

export type PasswordStrength = z.infer<typeof passwordStrengthSchema>;

/**
 * Calculate password strength level based on requirements met.
 * @param strength - Password strength object with boolean flags
 * @returns 'weak' | 'medium' | 'strong'
 */
export function getStrengthLevel(strength: PasswordStrength): 'weak' | 'medium' | 'strong' {
  const passed = Object.values(strength).filter(Boolean).length;
  if (passed <= 3) return 'weak';
  if (passed <= 5) return 'medium';
  return 'strong';
}

/**
 * Validate password requirements and return strength object.
 * Does NOT include breach check (that's async).
 * @param password - The password to validate
 * @returns Password strength object (notBreached defaults to true)
 */
export function validatePasswordRequirements(password: string): PasswordStrength {
  return {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notBreached: true, // Default; set by async breach check
  };
}

// ===========================================
// Signup Form Schema
// ===========================================

/**
 * Full signup form validation schema.
 * Validates all fields for new user registration.
 */
export const signupFormSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(320, 'Email address is too long')
    .transform(val => val.toLowerCase().trim()),
  
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
  
  confirmPassword: z.string(),
  
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters')
    .transform(val => val.trim()),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters')
    .transform(val => val.trim()),
  
  organizationName: z.string()
    .max(100, 'Organization name is too long')
    .optional()
    .transform(val => val?.trim() || undefined),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service' })
  }),
  
  acceptedPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Privacy Policy' })
  }),
  
  acceptedMarketing: z.boolean().optional().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupFormSchema>;

// ===========================================
// Profile Update Schema (for social login users)
// ===========================================

/**
 * Schema for completing profile after social login.
 * B2C may not provide all fields, so user must complete them.
 */
export const profileCompletionSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters')
    .transform(val => val.trim()),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters')
    .transform(val => val.trim()),
  
  organizationName: z.string()
    .max(100, 'Organization name is too long')
    .optional()
    .transform(val => val?.trim() || undefined),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

export type ProfileCompletionData = z.infer<typeof profileCompletionSchema>;

// ===========================================
// API Request/Response Schemas
// ===========================================

/**
 * Schema for check-email endpoint request.
 */
export const checkEmailRequestSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(320)
    .transform(val => val.toLowerCase().trim()),
});

export type CheckEmailRequest = z.infer<typeof checkEmailRequestSchema>;

/**
 * Schema for check-email endpoint response.
 */
export const checkEmailResponseSchema = z.object({
  available: z.boolean(),
  suggestion: z.string().optional(), // "Did you mean gmail.com?"
});

export type CheckEmailResponse = z.infer<typeof checkEmailResponseSchema>;

/**
 * Schema for validate-password endpoint request.
 */
export const validatePasswordRequestSchema = z.object({
  password: z.string().min(1).max(128),
});

export type ValidatePasswordRequest = z.infer<typeof validatePasswordRequestSchema>;

/**
 * Schema for validate-password endpoint response.
 */
export const validatePasswordResponseSchema = z.object({
  strength: passwordStrengthSchema,
  level: z.enum(['weak', 'medium', 'strong']),
  breached: z.boolean(),
});

export type ValidatePasswordResponse = z.infer<typeof validatePasswordResponseSchema>;

/**
 * Schema for consent record request.
 */
export const consentRequestSchema = z.object({
  consentType: z.enum(['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING_EMAILS']),
  documentVersion: z.string().max(20),
});

export type ConsentRequest = z.infer<typeof consentRequestSchema>;

/**
 * Schema for profile creation request (after B2C signup).
 */
export const createProfileRequestSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  organizationName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  consents: z.array(consentRequestSchema).min(2), // ToS + Privacy required
});

export type CreateProfileRequest = z.infer<typeof createProfileRequestSchema>;
