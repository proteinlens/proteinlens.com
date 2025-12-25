/**
 * Frontend telemetry helpers for auth events
 * T025: Track session expiration and redirect events
 */

// Simple console-based telemetry (replace with App Insights SDK in production)
export function trackAuthEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  const event = {
    name: eventName,
    timestamp: new Date().toISOString(),
    ...properties,
  };

  // In production, this would send to Application Insights
  if (import.meta.env.DEV) {
    console.log('[Telemetry]', event);
  }

  // Track via global analytics if available
  const analytics = (window as any).appInsights;
  if (analytics?.trackEvent) {
    analytics.trackEvent({ name: eventName, properties });
  }
}

/**
 * Track session expiration
 */
export function trackSessionExpired(reason: 'inactivity' | 'absolute'): void {
  trackAuthEvent('auth.session_expired', { reason });
}

/**
 * Track protected route redirect
 */
export function trackProtectedRouteRedirect(path: string): void {
  trackAuthEvent('auth.protected_redirect', { path });
}

/**
 * Track login attempt
 */
export function trackLoginAttempt(): void {
  trackAuthEvent('auth.login_attempt');
}

/**
 * Track login success
 */
export function trackLoginSuccess(): void {
  trackAuthEvent('auth.login_success');
}

/**
 * Track logout
 */
export function trackLogout(): void {
  trackAuthEvent('auth.logout');
}

/**
 * Track token refresh
 */
export function trackTokenRefresh(success: boolean): void {
  trackAuthEvent('auth.token_refresh', { success });
}
