/**
 * ResendVerificationPage Component
 * Feature 010 - User Signup Process
 * 
 * Page for resending email verification.
 */

import { FC, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resendVerificationEmail, AuthError } from '../services/authService';

export const ResendVerificationPage: FC = () => {
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(prefilledEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await resendVerificationEmail(email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to send verification email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4" aria-labelledby="resend-heading">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4 shadow-lg" aria-hidden="true">
            <span className="text-3xl">📧</span>
          </div>
          <h1 id="resend-heading" className="text-2xl font-bold text-foreground mb-2">Resend Verification</h1>
          <p className="text-muted-foreground">We'll send you a new verification link</p>
        </header>

        {/* Success Message */}
        {success && (
          <div role="status" className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm">
            <div className="flex items-start gap-2">
              <span aria-hidden="true">✅</span>
              <div>
                <p className="font-medium">Verification email sent!</p>
                <p className="mt-1">Please check your inbox and spam folder for the verification link.</p>
              </div>
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

        {/* Resend Form Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={success}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              aria-busy={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" aria-hidden="true"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">📬</span>
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </form>

          <nav className="mt-6 text-center space-y-2" aria-label="Authentication navigation">
            <p className="text-sm text-muted-foreground">
              Already verified?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Need a new account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Sign up
              </Link>
            </p>
          </nav>
        </div>
      </div>
    </main>
  );
};

export default ResendVerificationPage;
