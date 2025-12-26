/**
 * ResendVerificationBanner Component
 * Feature 010 - User Signup Process
 * 
 * Shown when user attempts to login with an unverified email.
 * Provides option to resend verification email with rate limiting display.
 */

import { FC, useState, useEffect, useCallback } from 'react';
import { resendVerification } from '../../services/signupService';

interface ResendVerificationBannerProps {
  /** User's email address */
  email: string;
  /** Initial remaining attempts (from login response) */
  initialAttemptsRemaining?: number;
  /** Callback when verification is successfully sent */
  onSent?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Banner displayed when user's email is not verified.
 * Includes countdown timer for rate limiting and resend button.
 */
export const ResendVerificationBanner: FC<ResendVerificationBannerProps> = ({
  email,
  initialAttemptsRemaining = 10,
  onSent,
  className = '',
}) => {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(initialAttemptsRemaining);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown period in seconds (1 minute between resends)
  const COOLDOWN_PERIOD = 60;

  // Countdown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownSeconds]);

  // Handle resend verification click
  const handleResend = useCallback(async () => {
    if (isSending || cooldownSeconds > 0 || attemptsRemaining <= 0) {
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await resendVerification();
      
      setLastSent(new Date());
      setCooldownSeconds(COOLDOWN_PERIOD);
      setAttemptsRemaining(response.attemptsRemaining);
      setSuccessMessage('Verification email sent! Check your inbox.');
      onSent?.();
    } catch (err) {
      console.error('Failed to resend verification:', err);
      
      if (err instanceof Error) {
        // Handle specific error cases
        if (err.message.includes('rate limit')) {
          setError('Too many requests. Please wait before trying again.');
          setCooldownSeconds(COOLDOWN_PERIOD);
        } else if (err.message.includes('already verified')) {
          setError('Your email is already verified. Please refresh the page.');
        } else {
          setError('Failed to send verification email. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  }, [isSending, cooldownSeconds, attemptsRemaining, onSent]);

  // Format cooldown time
  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  const canResend = !isSending && cooldownSeconds === 0 && attemptsRemaining > 0;

  return (
    <div
      className={`rounded-lg border border-blue-200 bg-blue-50 p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Verify your email address
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              We sent a verification email to{' '}
              <strong className="font-semibold">{email}</strong>. Please check
              your inbox and click the verification link to complete signup.
            </p>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mt-2 flex items-center text-sm text-green-700">
              <svg
                className="mr-1.5 h-4 w-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-2 flex items-center text-sm text-red-700">
              <svg
                className="mr-1.5 h-4 w-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Resend button and countdown */}
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <svg
                      className="mr-1.5 h-4 w-4 animate-spin"
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
                    Sending...
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    <svg
                      className="mr-1.5 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Wait {formatCooldown(cooldownSeconds)}
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-1.5 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Resend verification email
                  </>
                )}
              </button>

              {/* Attempts remaining indicator */}
              {attemptsRemaining < 10 && attemptsRemaining > 0 && (
                <span className="text-xs text-blue-600">
                  {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining today
                </span>
              )}

              {attemptsRemaining === 0 && (
                <span className="text-xs text-red-600">
                  Daily limit reached. Try again tomorrow.
                </span>
              )}
            </div>
          </div>

          {/* Help text */}
          <p className="mt-3 text-xs text-blue-600">
            Didn't receive the email? Check your spam folder or{' '}
            <a
              href="/support"
              className="font-medium underline hover:text-blue-700"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationBanner;
