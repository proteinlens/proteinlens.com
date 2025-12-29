/**
 * SignupForm Component
 * Feature 010 - User Signup Process
 * 
 * Main signup form with email, password, name fields, and consent checkboxes.
 * Supports real-time validation and social login options.
 */

import { FC, FormEvent, useState } from 'react';
import { SocialLoginButtons } from './SocialLoginButtons';
import { ConsentCheckboxes } from './ConsentCheckboxes';
import { PasswordStrength } from './PasswordStrength';
import { PasswordRequirements } from './PasswordRequirements';
import { FormField } from './FormField';
import { DuplicateEmailMessage } from './DuplicateEmailMessage';
import { useSignupForm, type SignupFormState } from '../../hooks/useSignupForm';

interface SignupFormProps {
  /** Called when signup is successful, receives email */
  onSuccess?: (email: string) => void;
  /** Called when social login is initiated */
  onSocialLogin: (provider: 'google' | 'microsoft') => void;
  /** Additional class names */
  className?: string;
}

/**
 * Complete signup form with email/password and social login options.
 */
export const SignupForm: FC<SignupFormProps> = ({
  onSuccess,
  onSocialLogin,
  className = '',
}) => {
  const {
    formState,
    errors,
    isSubmitting,
    isCheckingEmail,
    isDuplicateEmail,
    duplicateEmail,
    passwordStrength,
    emailTypoSuggestion,
    handleChange,
    handleBlur,
    handleSubmit,
    acceptEmailSuggestion,
  } = useSignupForm({ onSuccess });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={onFormSubmit} className={`space-y-6 ${className}`} noValidate>
      {/* Email field */}
      <FormField
        id="email"
        name="email"
        type="email"
        label="Email address"
        value={formState.email}
        onChange={(value) => handleChange('email', value)}
        onBlur={() => handleBlur('email')}
        error={errors.email}
        required
        autoComplete="email"
        placeholder="you@example.com"
        disabled={isSubmitting}
        endAdornment={
          isCheckingEmail ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 animate-spin text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : undefined
        }
      />

      {/* Duplicate email message */}
      {isDuplicateEmail && duplicateEmail && (
        <DuplicateEmailMessage 
          email={duplicateEmail}
          signInUrl="/login"
          resetPasswordUrl="/forgot-password"
          supportUrl="/support"
        />
      )}

      {/* Email typo suggestion */}
      {emailTypoSuggestion && (
        <div className="rounded-md bg-yellow-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Did you mean{' '}
                <button
                  type="button"
                  onClick={acceptEmailSuggestion}
                  className="font-medium text-yellow-700 underline hover:text-yellow-600"
                >
                  {emailTypoSuggestion}
                </button>
                ?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Name fields (side by side on larger screens) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="firstName"
          name="firstName"
          type="text"
          label="First name"
          value={formState.firstName}
          onChange={(value) => handleChange('firstName', value)}
          onBlur={() => handleBlur('firstName')}
          error={errors.firstName}
          required
          autoComplete="given-name"
          placeholder="John"
          disabled={isSubmitting}
        />

        <FormField
          id="lastName"
          name="lastName"
          type="text"
          label="Last name"
          value={formState.lastName}
          onChange={(value) => handleChange('lastName', value)}
          onBlur={() => handleBlur('lastName')}
          error={errors.lastName}
          required
          autoComplete="family-name"
          placeholder="Doe"
          disabled={isSubmitting}
        />
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <FormField
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={formState.password}
          onChange={(value) => handleChange('password', value)}
          onBlur={() => handleBlur('password')}
          error={errors.password}
          required
          autoComplete="new-password"
          placeholder="••••••••••••"
          disabled={isSubmitting}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />

        {/* Password strength indicator */}
        {formState.password && passwordStrength && (
          <>
            <PasswordStrength level={passwordStrength.level} />
            <PasswordRequirements strength={passwordStrength.strength} />
          </>
        )}
      </div>

      {/* Confirm password field */}
      <FormField
        id="confirmPassword"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        label="Confirm password"
        value={formState.confirmPassword}
        onChange={(value) => handleChange('confirmPassword', value)}
        onBlur={() => handleBlur('confirmPassword')}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
        placeholder="••••••••••••"
        disabled={isSubmitting}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        }
      />

      {/* Consent checkboxes */}
      <ConsentCheckboxes
        acceptedTerms={formState.acceptedTerms}
        acceptedPrivacy={formState.acceptedPrivacy}
        acceptedMarketing={formState.acceptedMarketing}
        onTermsChange={(checked) => handleChange('acceptedTerms', checked)}
        onPrivacyChange={(checked) => handleChange('acceptedPrivacy', checked)}
        onMarketingChange={(checked) => handleChange('acceptedMarketing', checked)}
        termsError={errors.acceptedTerms}
        privacyError={errors.acceptedPrivacy}
        disabled={isSubmitting}
      />

      {/* General error message */}
      {errors.general && (
        <div className="rounded-md bg-red-50 p-4" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <svg
              className="mr-2 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </button>

      {/* Social login options */}
      <SocialLoginButtons onSocialLogin={onSocialLogin} disabled={isSubmitting} />

      {/* Sign in link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </a>
      </p>
    </form>
  );
};

export default SignupForm;
