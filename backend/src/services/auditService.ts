// Audit service for security-relevant auth events
import { trackEvent } from '../utils/telemetry.js';

export type AuthEventType =
  | 'signup'
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'reset_requested'
  | 'reset_completed'
  | 'verify_sent'
  | 'verify_completed';

export function auditAuthEvent(event: AuthEventType, props: Record<string, string | undefined> = {}): void {
  // Only non-PII properties
  const safeProps: Record<string, string> = Object.fromEntries(
    Object.entries(props)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  );

  trackEvent(`auth.${event}`, safeProps);
}

/**
 * Emit telemetry for signup event
 */
export function emitSignup(userId: string, requestId?: string): void {
  auditAuthEvent('signup', { userId, requestId });
}

/**
 * Emit telemetry for login event
 */
export function emitLogin(userId: string, requestId?: string): void {
  auditAuthEvent('login', { userId, requestId });
}

/**
 * Emit telemetry for logout event
 */
export function emitLogout(userId: string, requestId?: string): void {
  auditAuthEvent('logout', { userId, requestId });
}

/**
 * Emit telemetry for password reset requested
 */
export function emitResetRequested(userId?: string, requestId?: string): void {
  auditAuthEvent('reset_requested', { userId, requestId });
}

/**
 * Emit telemetry for password reset completed
 */
export function emitResetCompleted(userId: string, requestId?: string): void {
  auditAuthEvent('reset_completed', { userId, requestId });
}

/**
 * Emit telemetry for verification email sent
 */
export function emitVerifySent(userId: string, requestId?: string): void {
  auditAuthEvent('verify_sent', { userId, requestId });
}

/**
 * Emit telemetry for verification completed
 */
export function emitVerifyCompleted(userId: string, requestId?: string): void {
  auditAuthEvent('verify_completed', { userId, requestId });
}
