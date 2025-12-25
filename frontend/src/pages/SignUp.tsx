import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { trackAuthEvent } from '../utils/telemetry';

export function SignUp() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // If already signed in, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const handleSignUp = async () => {
    setError(null);
    setIsSubmitting(true);
    trackAuthEvent('signup_started');
    try {
      // B2C signup uses the same MSAL redirect but to sign-up-sign-in policy
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
      trackAuthEvent('signup_failed');
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
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4" aria-labelledby="signup-heading">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 shadow-lg shadow-primary/25" aria-hidden="true">
            <span className="text-3xl">✨</span>
          </div>
          <h1 id="signup-heading" className="text-2xl font-bold text-foreground mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Start tracking your protein intake today</p>
        </header>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-start gap-2">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sign Up Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          {/* Benefits */}
          <ul className="mb-6 space-y-3" role="list" aria-label="Account benefits">
            {[
              { icon: '📸', text: 'Unlimited meal scans' },
              { icon: '📊', text: 'Full meal history' },
              { icon: '☁️', text: 'Sync across devices' },
              { icon: '🎯', text: 'Track your goals' },
            ].map((benefit) => (
              <li key={benefit.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-lg" aria-hidden="true">{benefit.icon}</span>
                <span>{benefit.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSignUp}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" aria-hidden="true"></div>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">🚀</span>
                <span>Get Started Free</span>
              </>
            )}
          </button>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            Free forever • No credit card required
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <aside className="mt-8 text-center" aria-label="Security information">
          <ul className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground" role="list">
            <li className="flex items-center gap-1">
              <span aria-hidden="true">🔒</span> Secure
            </li>
            <li className="flex items-center gap-1">
              <span aria-hidden="true">🛡️</span> Private
            </li>
            <li className="flex items-center gap-1">
              <span aria-hidden="true">⚡</span> Fast
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
}

export default SignUp;
