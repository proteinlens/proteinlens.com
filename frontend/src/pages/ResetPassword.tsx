import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { trackAuthEvent } from '../utils/telemetry';
import { forgotPassword, resetPassword as resetPasswordApi, AuthError } from '../services/authService';
import { API_ENDPOINTS } from '../config';

type PageMode = 'request' | 'reset';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  // Determine mode: request reset or set new password
  const [mode] = React.useState<PageMode>(token ? 'reset' : 'request');
  
  // Request mode state
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = React.useState(false);
  
  // Reset mode state
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    trackAuthEvent('password_reset_requested');
    
    try {
      await forgotPassword(email);
      setRequestSuccess(true);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
      }
      trackAuthEvent('password_reset_failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (password.length < 12) {
      setError('Password must be at least 12 characters long.');
      return;
    }
    
    setIsSubmitting(true);
    trackAuthEvent('password_reset_submit');
    
    try {
      await resetPasswordApi(token!, password);
      setResetSuccess(true);
      trackAuthEvent('password_reset_success');
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
      }
      trackAuthEvent('password_reset_failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request mode - ask for email
  if (mode === 'request') {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4" aria-labelledby="reset-heading">
        <div className="w-full max-w-md">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg" aria-hidden="true">
              <span className="text-3xl">🔑</span>
            </div>
            <h1 id="reset-heading" className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-muted-foreground">We'll send you a link to reset your password</p>
          </header>

          {/* Success Message */}
          {requestSuccess && (
            <div role="status" className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-start gap-2">
              <span aria-hidden="true">✅</span>
              <div>
                <p>If an account exists with this email, you'll receive password reset instructions shortly.</p>
                <p className="mt-2 text-muted-foreground">Check your spam folder if you don't see the email.</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div role="alert" className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-start gap-2">
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Reset Request Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={requestSuccess}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || requestSuccess}
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
            </form>

            <nav className="mt-6 text-center space-y-2" aria-label="Authentication navigation">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
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

  // Reset mode - enter new password
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4" aria-labelledby="reset-heading">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg" aria-hidden="true">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 id="reset-heading" className="text-2xl font-bold text-foreground mb-2">Set New Password</h1>
          <p className="text-muted-foreground">Choose a strong password for your account</p>
        </header>

        {/* Success Message */}
        {resetSuccess && (
          <div role="status" className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm">
            <div className="flex items-start gap-2">
              <span aria-hidden="true">✅</span>
              <div>
                <p className="font-medium">Password reset successful!</p>
                <p className="mt-1">You can now sign in with your new password.</p>
              </div>
            </div>
            <Link
              to="/login"
              className="mt-4 block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-center hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Error Alert */}
        {error && !resetSuccess && (
          <div role="alert" className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-start gap-2">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Reset Form Card */}
        {!resetSuccess && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={12}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••••••"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  At least 12 characters with uppercase, lowercase, number, and symbol
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" aria-hidden="true"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">🔐</span>
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

export default ResetPassword;
