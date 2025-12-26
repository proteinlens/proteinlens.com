/**
 * useSignupForm Hook
 * Feature 010 - User Signup Process
 * 
 * Manages signup form state, validation, and submission.
 * Handles real-time validation, email typo detection, and password strength.
 */

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { usePasswordValidation, type PasswordValidationResult } from './usePasswordValidation';
import { detectEmailTypo, isValidEmailFormat } from '../utils/emailTypoDetector';
import { checkEmail as checkEmailApi } from '../services/signupService';

export interface SignupFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  phone: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedMarketing: boolean;
}

export interface SignupFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  phone?: string;
  acceptedTerms?: string;
  acceptedPrivacy?: string;
  general?: string;
}

export interface UseSignupFormOptions {
  /** Called when signup is successful */
  onSuccess?: () => void;
  /** Initial form values */
  initialValues?: Partial<SignupFormState>;
}

export interface UseSignupFormReturn {
  formState: SignupFormState;
  errors: SignupFormErrors;
  isSubmitting: boolean;
  isCheckingEmail: boolean;
  isDuplicateEmail: boolean;
  duplicateEmail: string | null;
  passwordStrength: PasswordValidationResult | null;
  emailTypoSuggestion: string | null;
  handleChange: <K extends keyof SignupFormState>(
    field: K,
    value: SignupFormState[K]
  ) => void;
  handleBlur: (field: keyof SignupFormState) => void;
  handleSubmit: () => Promise<void>;
  acceptEmailSuggestion: () => void;
  resetForm: () => void;
  clearDuplicateEmail: () => void;
}

const initialFormState: SignupFormState = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  organizationName: '',
  phone: '',
  acceptedTerms: false,
  acceptedPrivacy: false,
  acceptedMarketing: false,
};

// Session storage key for form persistence
const FORM_STORAGE_KEY = 'signup-form-draft';

/**
 * Hook for managing signup form state and validation.
 */
export function useSignupForm(
  options: UseSignupFormOptions = {}
): UseSignupFormReturn {
  const { onSuccess, initialValues } = options;

  // Initialize form state (from session storage or initial values)
  const [formState, setFormState] = useState<SignupFormState>(() => {
    try {
      const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<SignupFormState>;
        // Don't restore password for security
        return {
          ...initialFormState,
          ...initialValues,
          ...parsed,
          password: '',
          confirmPassword: '',
        };
      }
    } catch {
      // Ignore storage errors
    }
    return { ...initialFormState, ...initialValues };
  });

  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null);
  const [touched, setTouched] = useState<Set<keyof SignupFormState>>(new Set());
  const [emailTypoSuggestion, setEmailTypoSuggestion] = useState<string | null>(null);
  const [lastCheckedEmail, setLastCheckedEmail] = useState<string | null>(null);

  // Debounce email for typo detection
  const debouncedEmail = useDebounce(formState.email, 300);

  // Password validation
  const passwordValidation = usePasswordValidation(formState.password);

  // Save form to session storage (excluding passwords)
  useEffect(() => {
    try {
      const toSave = {
        email: formState.email,
        firstName: formState.firstName,
        lastName: formState.lastName,
        organizationName: formState.organizationName,
        phone: formState.phone,
        acceptedTerms: formState.acceptedTerms,
        acceptedPrivacy: formState.acceptedPrivacy,
        acceptedMarketing: formState.acceptedMarketing,
      };
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore storage errors
    }
  }, [formState]);

  // Email typo detection
  useEffect(() => {
    if (debouncedEmail && isValidEmailFormat(debouncedEmail)) {
      const result = detectEmailTypo(debouncedEmail);
      setEmailTypoSuggestion(result.correctedEmail);
    } else {
      setEmailTypoSuggestion(null);
    }
  }, [debouncedEmail]);

  // Handle field change
  const handleChange = useCallback(
    <K extends keyof SignupFormState>(field: K, value: SignupFormState[K]) => {
      setFormState(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (field in errors && errors[field as keyof SignupFormErrors]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
      // Clear duplicate email state when email changes
      if (field === 'email' && isDuplicateEmail) {
        setIsDuplicateEmail(false);
        setDuplicateEmail(null);
      }
    },
    [errors, isDuplicateEmail]
  );

  // Validate a single field
  const validateField = useCallback(
    (field: keyof SignupFormState): string | undefined => {
      const value = formState[field];
      let error: string | undefined;

      switch (field) {
        case 'email':
          if (!value) {
            error = 'Email is required';
          } else if (!isValidEmailFormat(value as string)) {
            error = 'Please enter a valid email address';
          }
          break;

        case 'password':
          if (!value) {
            error = 'Password is required';
          } else if ((value as string).length < 12) {
            error = 'Password must be at least 12 characters';
          } else if (!passwordValidation.isValid && !passwordValidation.isChecking) {
            error = 'Password does not meet all requirements';
          }
          break;

        case 'confirmPassword':
          if (!value) {
            error = 'Please confirm your password';
          } else if (value !== formState.password) {
            error = 'Passwords do not match';
          }
          break;

        case 'firstName':
          if (!value) {
            error = 'First name is required';
          } else if ((value as string).length > 50) {
            error = 'First name is too long';
          } else if (!/^[a-zA-Z\s\-']+$/.test(value as string)) {
            error = 'First name contains invalid characters';
          }
          break;

        case 'lastName':
          if (!value) {
            error = 'Last name is required';
          } else if ((value as string).length > 50) {
            error = 'Last name is too long';
          } else if (!/^[a-zA-Z\s\-']+$/.test(value as string)) {
            error = 'Last name contains invalid characters';
          }
          break;

        case 'phone':
          if (value && !/^\+?[1-9]\d{1,14}$/.test(value as string)) {
            error = 'Please enter a valid phone number';
          }
          break;

        case 'acceptedTerms':
          if (!value) {
            error = 'You must accept the Terms of Service';
          }
          break;

        case 'acceptedPrivacy':
          if (!value) {
            error = 'You must accept the Privacy Policy';
          }
          break;
      }

      setErrors(prev => ({ ...prev, [field]: error }));
      return error;
    },
    [formState, passwordValidation]
  );

  // Handle field blur (mark as touched)
  const handleBlur = useCallback(async (field: keyof SignupFormState) => {
    setTouched(prev => new Set(prev).add(field));
    // Validate on blur
    validateField(field);

    // Check email availability on blur
    if (field === 'email' && formState.email && isValidEmailFormat(formState.email)) {
      // Skip if we already checked this email
      if (lastCheckedEmail === formState.email) {
        return;
      }

      setIsCheckingEmail(true);
      try {
        const result = await checkEmailApi(formState.email);
        setLastCheckedEmail(formState.email);
        
        if (!result.available) {
          setIsDuplicateEmail(true);
          setDuplicateEmail(formState.email);
          setErrors(prev => ({ 
            ...prev, 
            email: 'This email is already registered' 
          }));
        } else {
          setIsDuplicateEmail(false);
          setDuplicateEmail(null);
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
        // Don't block signup on check failure
      } finally {
        setIsCheckingEmail(false);
      }
    }
  }, [formState.email, lastCheckedEmail, validateField]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    // Fields that need validation (present in both SignupFormState and SignupFormErrors)
    const fields: (keyof SignupFormState & keyof SignupFormErrors)[] = [
      'email',
      'password',
      'confirmPassword',
      'firstName',
      'lastName',
      'acceptedTerms',
      'acceptedPrivacy',
    ];

    let hasErrors = false;
    const newErrors: SignupFormErrors = {};

    for (const field of fields) {
      const error = validateField(field);
      if (error) {
        hasErrors = true;
        newErrors[field] = error;
      }
    }

    setErrors(newErrors);
    return !hasErrors;
  }, [validateField]);

  // Accept email suggestion
  const acceptEmailSuggestion = useCallback(() => {
    if (emailTypoSuggestion) {
      setFormState(prev => ({ ...prev, email: emailTypoSuggestion }));
      setEmailTypoSuggestion(null);
    }
  }, [emailTypoSuggestion]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Validate all fields
    if (!validateAll()) {
      // Focus first error field
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField instanceof HTMLElement) {
        firstErrorField.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Check if email is available
      const emailCheck = await checkEmailApi(formState.email);
      
      if (!emailCheck.available) {
        setErrors({ email: 'This email is already registered. Please sign in instead.' });
        return;
      }

      // If all validation passes, we redirect to B2C for signup
      // The actual redirect is handled by the parent component
      // Clear form storage on success
      sessionStorage.removeItem(FORM_STORAGE_KEY);
      
      onSuccess?.();
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        general: 'An error occurred during signup. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, validateAll, onSuccess]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState(initialFormState);
    setErrors({});
    setTouched(new Set());
    setIsDuplicateEmail(false);
    setDuplicateEmail(null);
    setLastCheckedEmail(null);
    sessionStorage.removeItem(FORM_STORAGE_KEY);
  }, []);

  // Clear duplicate email state (when user changes email)
  const clearDuplicateEmail = useCallback(() => {
    setIsDuplicateEmail(false);
    setDuplicateEmail(null);
  }, []);

  return {
    formState,
    errors,
    isSubmitting,
    isCheckingEmail,
    isDuplicateEmail,
    duplicateEmail,
    passwordStrength: formState.password ? passwordValidation : null,
    emailTypoSuggestion,
    handleChange,
    handleBlur,
    handleSubmit,
    acceptEmailSuggestion,
    resetForm,
    clearDuplicateEmail,
  };
}

export default useSignupForm;
