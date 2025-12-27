/**
 * InviteSignupPage Component
 * Feature 010 - User Signup Process
 * 
 * Modified signup page for users joining via organization invite.
 * Pre-fills organization name and email from invite.
 */

import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuth } from '../contexts/AuthProvider';

interface InviteDetails {
  valid: boolean;
  email: string;
  organizationId: string;
  organizationName: string;
  invitedByName: string | null;
  expiresAt: string;
}

interface InviteError {
  error: string;
  message: string;
}

/**
 * Signup page for organization invite flow.
 */
export const InviteSignupPage: FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [inviteError, setInviteError] = useState<InviteError | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // Validate invite token on mount
  useEffect(() => {
    async function validateInvite() {
      if (!token) {
        setInviteError({
          error: 'MISSING_TOKEN',
          message: 'No invite token provided.',
        });
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/org/invite/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setInviteError(data as InviteError);
        } else {
          setInviteDetails(data as InviteDetails);
        }
      } catch (error) {
        console.error('Error validating invite:', error);
        setInviteError({
          error: 'NETWORK_ERROR',
          message: 'Failed to validate invite. Please try again.',
        });
      } finally {
        setIsValidating(false);
      }
    }

    validateInvite();
  }, [token]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && inviteDetails) {
      // If authenticated, they may need to accept the invite
      // Redirect to a page that handles invite acceptance
      navigate(`/invite/${token}/complete`, { replace: true });
    }
  }, [isAuthenticated, inviteDetails, navigate, token]);

  // Handle successful form validation (before B2C redirect)
  const handleSignupSuccess = useCallback(async () => {
    // Store invite token in session storage to process after B2C redirect
    if (token) {
      sessionStorage.setItem('pending-invite-token', token);
    }
    try {
      setAuthError(null);
      await login();
    } catch (error) {
      console.error('[InviteSignup] Auth error:', error);
      const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
      setAuthError(message);
    }
  }, [login, token]);

  // Handle social login
  const handleSocialLogin = useCallback(
    async (provider: 'google' | 'microsoft') => {
      // Store invite token in session storage
      if (token) {
        sessionStorage.setItem('pending-invite-token', token);
      }
      try {
        setAuthError(null);
        await login({
          extraQueryParameters: {
            domain_hint: provider === 'google' ? 'google.com' : 'live.com',
          },
        });
      } catch (error) {
        console.error('[InviteSignup] Social login error:', error);
        const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
        setAuthError(message);
      }
    },
    [login, token]
  );

  // Show loading state
  if (isValidating || authLoading) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center"
        role="status"
        aria-label="Validating invite"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="mt-4 text-sm text-gray-600">Validating your invite...</span>
      </div>
    );
  }

  // Show error state
  if (inviteError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
            {/* Error icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Invalid Invite Link
            </h1>
            <p className="mt-2 text-sm text-gray-600">{inviteError.message}</p>

            <div className="mt-6 space-y-3">
              <Link
                to="/signup"
                className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Sign up without invite
              </Link>
              <Link
                to="/login"
                className="block w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Sign in to existing account
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Need a new invite? Contact your organization administrator.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Show invite signup form
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"
      aria-labelledby="invite-signup-heading"
    >
      {/* Skip to main content link */}
      <a
        href="#invite-signup-form"
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
            id="invite-signup-heading"
            className="mt-6 text-3xl font-bold tracking-tight text-gray-900"
          >
            Join {inviteDetails?.organizationName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {inviteDetails?.invitedByName
              ? `${inviteDetails.invitedByName} has invited you to join their organization`
              : "You've been invited to join this organization"}
          </p>
        </div>

        {/* Invite banner */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                This invite is for{' '}
                <strong className="font-semibold">{inviteDetails?.email}</strong>
              </p>
              <p className="mt-1 text-xs text-blue-600">
                Expires{' '}
                {inviteDetails?.expiresAt
                  ? new Date(inviteDetails.expiresAt).toLocaleDateString()
                  : 'soon'}
              </p>
            </div>
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
              </div>
            </div>
          </div>
        )}

        {/* Signup form */}
        <div
          id="invite-signup-form"
          className="rounded-xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5"
        >
          <SignupForm
            onSuccess={handleSignupSuccess}
            onSocialLogin={handleSocialLogin}
            // Note: The form would need to be modified to accept initialValues
            // for pre-filling email. For now, the email is shown in the banner above.
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>{' '}
          and we'll link you to this organization.
        </p>
      </div>
    </main>
  );
};

export default InviteSignupPage;
