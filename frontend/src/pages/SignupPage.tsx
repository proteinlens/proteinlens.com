/**
 * SignupPage Component
 * Feature 010 - User Signup Process
 * 
 * Main signup page with comprehensive form, social login, and consent.
 * Replaces the basic SignUp page with full validation and UX improvements.
 */

import { FC, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuth } from '../contexts/AuthProvider';

/**
 * Full-featured signup page.
 */
export const SignupPage: FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle successful form validation (before B2C redirect)
  const handleSignupSuccess = useCallback(() => {
    // Form validation passed - trigger B2C signup flow
    // The actual redirect happens via MSAL
    login();
  }, [login]);

  // Handle social login
  const handleSocialLogin = useCallback(
    (provider: 'google' | 'microsoft') => {
      // B2C handles social provider federation
      // We use the same login() but with extraQueryParameters
      // to hint the provider preference
      login({
        extraQueryParameters: {
          domain_hint: provider === 'google' ? 'google.com' : 'live.com',
        },
      });
    },
    [login]
  );

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        role="status"
        aria-label="Loading"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"
      aria-labelledby="signup-heading"
    >
      {/* Skip to main content link */}
      <a
        href="#signup-form"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-blue-600 focus:shadow-lg"
      >
        Skip to signup form
      </a>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* Logo */}
          <div
            className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
            aria-hidden="true"
          >
            <span className="text-3xl">🧬</span>
          </div>

          <h1
            id="signup-heading"
            className="mt-6 text-3xl font-bold tracking-tight text-gray-900"
          >
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Start tracking your protein intake today
          </p>
        </div>

        {/* Signup form */}
        <div
          id="signup-form"
          className="rounded-xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5"
        >
          <SignupForm
            onSuccess={handleSignupSuccess}
            onSocialLogin={handleSocialLogin}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <a
            href={import.meta.env.VITE_TOS_URL || '/terms'}
            className="text-blue-600 hover:underline"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href={import.meta.env.VITE_PRIVACY_URL || '/privacy'}
            className="text-blue-600 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
};

export default SignupPage;
