import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { trackAuthEvent } from '../utils/telemetry';

export function ResetPassword() {
  const { login, isLoading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleResetPassword = async () => {
    setError(null);
    setIsSubmitting(true);
    trackAuthEvent('password_reset_requested');
    try {
      // B2C password reset uses a different user flow policy
      // In production, this would call msal.loginRedirect with password reset authority
      await login();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed. Please try again.');
      trackAuthEvent('password_reset_failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4" aria-labelledby="reset-heading">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg" aria-hidden="true">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 id="reset-heading" className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground">We'll help you get back into your account</p>
        </header>

        {/* Success Message */}
        {success && (
          <div role="status" className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-start gap-2">
            <span aria-hidden="true">✅</span>
            <span>Check your email for password reset instructions.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div role="alert" className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-start gap-2">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Reset Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Click below to reset your password. You'll receive an email with instructions.
          </p>

          <button
            onClick={handleResetPassword}
            disabled={isSubmitting || success}
            aria-busy={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" aria-hidden="true"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">📧</span>
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <nav className="mt-6 text-center space-y-2" aria-label="Authentication navigation">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link to="/signin" className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Sign up
              </Link>
            </p>
          </nav>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
