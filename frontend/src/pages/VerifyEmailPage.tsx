/**
 * VerifyEmailPage Component
 * Feature 010 - User Signup Process
 * 
 * Landing page shown after user clicks email verification link.
 * Confirms verification and prompts user to continue.
 */

import { FC, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

type VerificationStatus = 'verifying' | 'success' | 'already-verified' | 'error';

/**
 * Email verification landing page.
 */
export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [error, setError] = useState<string | null>(null);

  // Check verification status on mount
  useEffect(() => {
    // B2C handles the actual verification; this page is the callback
    const verificationResult = searchParams.get('result');
    const errorCode = searchParams.get('error');

    if (errorCode) {
      setStatus('error');
      setError(getErrorMessage(errorCode));
      return;
    }

    if (verificationResult === 'success') {
      setStatus('success');
      return;
    }

    // If user is already verified, show already verified message
    if (isAuthenticated && user?.emailVerified) {
      setStatus('already-verified');
      return;
    }

    // Default to success (B2C would have shown error already)
    setStatus('success');
  }, [searchParams, isAuthenticated, user]);

  // Helper to get human-readable error messages
  function getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      expired: 'This verification link has expired. Please request a new one.',
      invalid: 'This verification link is invalid. Please request a new one.',
      already_used: 'This verification link has already been used.',
      default: 'Something went wrong with verification. Please try again.',
    };
    return errorMessages[code] || errorMessages.default;
  }

  // Handle continue button click
  const handleContinue = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  // Handle resend click
  const handleResend = () => {
    navigate('/login', { state: { showResendVerification: true } });
  };

  // Show loading state
  if (isLoading || status === 'verifying') {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        role="status"
        aria-label="Verifying email"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Success state */}
        {status === 'success' && (
          <>
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
              aria-hidden="true"
            >
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Email verified!
            </h1>
            <p className="mt-2 text-gray-600">
              Your email address has been successfully verified. You can now access
              all features of ProteinLens.
            </p>
            <button
              onClick={handleContinue}
              className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
            </button>
          </>
        )}

        {/* Already verified state */}
        {status === 'already-verified' && (
          <>
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
              aria-hidden="true"
            >
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Already verified
            </h1>
            <p className="mt-2 text-gray-600">
              Your email address is already verified. You're all set!
            </p>
            <button
              onClick={handleContinue}
              className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
              aria-hidden="true"
            >
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Verification failed
            </h1>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleResend}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Request new verification email
              </button>
              <button
                onClick={() => navigate('/support')}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Contact Support
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default VerifyEmailPage;
