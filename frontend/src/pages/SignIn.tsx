import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { trackLoginAttempt, trackLoginSuccess } from '../utils/telemetry';

export function SignIn() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // If already signed in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      trackLoginSuccess();
      window.location.href = decodeURIComponent(returnTo);
    }
  }, [isAuthenticated, returnTo]);

  const handleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    trackLoginAttempt();
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <div role="alert" className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-start gap-2">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <button
            onClick={handleSignIn}
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
                <span>Sign In with Email</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Sign up free
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link 
              to="/reset-password" 
              className="text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Features reminder */}
        <aside className="mt-8 text-center" aria-label="Account benefits">
          <p className="text-xs text-muted-foreground mb-3">Unlock with an account:</p>
          <ul className="flex flex-wrap justify-center gap-2" role="list">
            {['📊 Full History', '☁️ Cloud Sync', '📈 Progress Tracking'].map((feature) => (
              <li
                key={feature}
                className="inline-flex items-center px-3 py-1 bg-secondary/50 text-muted-foreground text-xs rounded-full"
              >
                {feature}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}

export default SignIn;
