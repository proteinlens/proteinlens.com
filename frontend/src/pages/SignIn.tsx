import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { trackLoginAttempt, trackLoginSuccess } from '../utils/telemetry';
import { API_ENDPOINTS } from '../config';
import { AuthError, RateLimitError } from '../services/authService';

export function SignIn() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = searchParams.get('returnTo') || '/';
  const oauthError = searchParams.get('error');
  const prefilledEmail = searchParams.get('email') || '';
  
  const [email, setEmail] = React.useState(prefilledEmail);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(oauthError ? getOAuthErrorMessage(oauthError) : null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [needsVerification, setNeedsVerification] = React.useState(false);
  const [isRateLimited, setIsRateLimited] = React.useState(false);

  // If already signed in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      trackLoginSuccess();
      navigate(decodeURIComponent(returnTo), { replace: true });
    }
  }, [isAuthenticated, returnTo, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setIsRateLimited(false);
    setIsSubmitting(true);
    trackLoginAttempt();
    
    try {
      await login({ email, password });
    } catch (err) {
      if (err instanceof RateLimitError) {
        setIsRateLimited(true);
        setError(err.message);
      } else if (err instanceof AuthError) {
        if (err.code === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true);
        }
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'microsoft') => {
    const returnUrl = encodeURIComponent(returnTo);
    if (provider === 'google') {
      window.location.href = `${API_ENDPOINTS.AUTH_LOGIN_GOOGLE}?returnUrl=${returnUrl}`;
    } else {
      window.location.href = `${API_ENDPOINTS.AUTH_LOGIN_MICROSOFT}?returnUrl=${returnUrl}`;
    }
  };

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading authentication">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4" aria-labelledby="signin-heading">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 shadow-lg shadow-primary/25" aria-hidden="true">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 id="signin-heading" className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your meal history and more</p>
        </header>

        {/* Error Alert */}
        {error && (
          <div 
            role="alert" 
            className={`mb-4 p-4 border rounded-xl text-sm flex items-start gap-2 ${
              isRateLimited 
                ? 'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900/30 dark:border-orange-800/50 dark:text-orange-200' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            <span aria-hidden="true">{isRateLimited ? '🔒' : '⚠️'}</span>
            <div>
              <span>{error}</span>
              {needsVerification && (
                <div className="mt-2">
                  <Link 
                    to={`/resend-verification?email=${encodeURIComponent(email)}`}
                    className="text-primary font-medium hover:underline"
                  >
                    Resend verification email
                  </Link>
                </div>
              )}
              {isRateLimited && (
                <p className="mt-2 text-xs opacity-80">
                  This is a security measure to protect your account. Please wait and try again.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sign In Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email field */}
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
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••••••"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" aria-hidden="true"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">🔐</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-6 hidden">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social login buttons - Not implemented yet */}
          <div className="flex gap-3 hidden">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('microsoft')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 21 21" aria-hidden="true">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <span className="text-sm font-medium">Microsoft</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link 
              to="/reset-password" 
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-2 gap-3" aria-label="Account benefits">
          <div className="flex items-center gap-2 rounded-lg bg-card p-3 shadow-sm ring-1 ring-border">
            <span className="text-xl" aria-hidden="true">📸</span>
            <span className="text-sm font-medium text-foreground">Unlimited meal scans</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card p-3 shadow-sm ring-1 ring-border">
            <span className="text-xl" aria-hidden="true">📊</span>
            <span className="text-sm font-medium text-foreground">Full meal history</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card p-3 shadow-sm ring-1 ring-border">
            <span className="text-xl" aria-hidden="true">☁️</span>
            <span className="text-sm font-medium text-foreground">Sync across devices</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card p-3 shadow-sm ring-1 ring-border">
            <span className="text-xl" aria-hidden="true">🎯</span>
            <span className="text-sm font-medium text-foreground">Track your goals</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function getOAuthErrorMessage(error: string): string {
  switch (error) {
    case 'oauth_denied':
      return 'Authentication was cancelled or denied.';
    case 'invalid_state':
      return 'Session expired. Please try again.';
    case 'account_exists':
      return 'An account with this email already exists. Please sign in with your original method.';
    case 'token_exchange_failed':
    case 'user_info_failed':
      return 'Authentication failed. Please try again.';
    default:
      return 'An error occurred during sign in. Please try again.';
  }
}

export default SignIn;
