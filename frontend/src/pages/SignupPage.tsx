/**
 * SignupPage Component
 * Feature 010 - User Signup Process
 * 
 * Main signup page with comprehensive form, social login, and consent.
 * Uses self-managed PostgreSQL auth (not B2C).
 */

import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuth } from '../contexts/AuthProvider';
import { API_ENDPOINTS } from '../config';

/**
 * Full-featured signup page.
 */
export const SignupPage: FC = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading } = useAuth();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle successful signup (redirect to verification page)
  const handleSignupSuccess = useCallback(() => {
    setSignupSuccess(true);
    navigate('/verify-email', { 
      state: { email: signupEmail },
      replace: true 
    });
  }, [navigate, signupEmail]);

  // Handle social login via OAuth redirect
  const handleSocialLogin = useCallback(
    (provider: 'google' | 'microsoft') => {
      const returnUrl = encodeURIComponent('/dashboard');
      if (provider === 'google') {
        window.location.href = `${API_ENDPOINTS.AUTH_LOGIN_GOOGLE}?returnUrl=${returnUrl}`;
      } else {
        window.location.href = `${API_ENDPOINTS.AUTH_LOGIN_MICROSOFT}?returnUrl=${returnUrl}`;
      }
    },
    []
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

  // Show success message if signup completed
  if (signupSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-600">
            We've sent a verification link to <strong>{signupEmail}</strong>.
            Please check your inbox and click the link to activate your account.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <a href="/resend-verification" className="text-blue-600 hover:underline">
              resend verification email
            </a>
          </p>
        </div>
      </main>
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

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-900/5">
            <span className="text-xl" aria-hidden="true">📸</span>
            <span className="text-sm font-medium text-gray-700">Unlimited meal scans</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-900/5">
            <span className="text-xl" aria-hidden="true">📊</span>
            <span className="text-sm font-medium text-gray-700">Full meal history</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-900/5">
            <span className="text-xl" aria-hidden="true">☁️</span>
            <span className="text-sm font-medium text-gray-700">Sync across devices</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-900/5">
            <span className="text-xl" aria-hidden="true">🎯</span>
            <span className="text-sm font-medium text-gray-700">Track your goals</span>
          </div>
        </div>

        {/* Auth error message */}
        {authError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4" role="alert">
            <div className="flex">
              <svg className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-amber-800">Authentication Setup Required</h3>
                <p className="mt-1 text-sm text-amber-700">{authError}</p>
                <p className="mt-2 text-sm text-amber-600">
                  Please contact support or try again later while we complete the setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Signup form */}
        <div
          id="signup-form"
          className="rounded-xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5"
        >
          <SignupForm
            onSuccess={handleSignupSuccess}
            onSocialLogin={handleSocialLogin}
          />

          {/* Forgot password */}
          <div className="mt-6 text-center">
            <a
              href="/reset-password"
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              Forgot password?
            </a>
          </div>
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
