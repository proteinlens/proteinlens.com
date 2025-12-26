/**
 * DuplicateEmailMessage Component
 * Feature 010 - User Signup Process
 * 
 * Displays a user-friendly message when email is already registered,
 * providing options to sign in, reset password, or contact support.
 */

import { FC } from 'react';

interface DuplicateEmailMessageProps {
  /** The email that was found to be duplicated */
  email: string;
  /** URL for the sign in page */
  signInUrl?: string;
  /** URL for the password reset page */
  resetPasswordUrl?: string;
  /** URL for support contact */
  supportUrl?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Displays options when a user attempts to sign up with an existing email.
 * Provides clear CTAs for sign-in, password reset, and support.
 */
export const DuplicateEmailMessage: FC<DuplicateEmailMessageProps> = ({
  email,
  signInUrl = '/login',
  resetPasswordUrl = '/forgot-password',
  supportUrl = '/support',
  className = '',
}) => {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Account already exists
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              An account with <strong className="font-semibold">{email}</strong>{' '}
              is already registered. Here are your options:
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex flex-wrap gap-2">
              {/* Sign In button - Primary action */}
              <a
                href={signInUrl}
                className="inline-flex items-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-50"
              >
                <svg
                  className="-ml-0.5 mr-1.5 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign in instead
              </a>

              {/* Reset Password button - Secondary action */}
              <a
                href={`${resetPasswordUrl}?email=${encodeURIComponent(email)}`}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-amber-700 shadow-sm ring-1 ring-inset ring-amber-300 transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-50"
              >
                <svg
                  className="-ml-0.5 mr-1.5 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Reset password
              </a>
            </div>
          </div>

          {/* Support link */}
          <p className="mt-3 text-xs text-amber-600">
            Not your account?{' '}
            <a
              href={supportUrl}
              className="font-medium underline hover:text-amber-700"
            >
              Contact support
            </a>{' '}
            for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DuplicateEmailMessage;
