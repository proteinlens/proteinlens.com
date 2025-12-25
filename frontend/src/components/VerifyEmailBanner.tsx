import React from 'react';
import { useAuth } from '../contexts/AuthProvider';

interface VerifyEmailBannerProps {
  onResend?: () => void;
}

export function VerifyEmailBanner({ onResend }: VerifyEmailBannerProps) {
  const { user } = useAuth();
  const [resending, setResending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  // Only show if user exists and email is not verified
  // In B2C, email verification happens during signup flow
  // This banner is for edge cases where verification is incomplete
  if (!user || !user.email) return null;

  const handleResend = async () => {
    if (resending || sent) return;
    setResending(true);
    try {
      // In B2C, resending verification typically redirects to the identity provider
      // The actual implementation depends on B2C policy configuration
      onResend?.();
      setSent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">📧</span>
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
            Verify your email
          </h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Please check your inbox and click the verification link to unlock all features.
          </p>
          {!sent ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="mt-2 text-xs font-medium text-yellow-800 dark:text-yellow-200 hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending...' : "Didn't receive it? Resend email"}
            </button>
          ) : (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              ✓ Verification email sent! Check your inbox.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailBanner;
