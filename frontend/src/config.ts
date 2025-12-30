/**
 * Frontend Configuration
 * 
 * Loads environment variables for API endpoint and other config
 * Supports both development and production environments
 * 
 * Reference: Task T032 - Configure frontend environment variables
 */

/**
 * API Base URL for backend calls
 * 
 * Development: http://localhost:7071 (local Functions emulator)
 * Production: https://api.proteinlens.com (from VITE_API_URL env var)
 * Staging: https://proteinlens-api-staging.azurewebsites.net (from VITE_API_URL env var)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:7071' : 'https://api.proteinlens.com');

/**
 * Application Environment
 * - 'development': Local development with Functions emulator
 * - 'production': Production deployment
 * - 'staging': Staging deployment
 */
export const ENVIRONMENT = import.meta.env.MODE as 'development' | 'production';

/**
 * Feature Flags
 * These can be controlled via environment variables for gradual rollouts
 */
export const FEATURES = {
  // Enable/disable specific UI features
  BILLING_ENABLED: true,
  EXPORT_ENABLED: true,
  ADMIN_PANEL_ENABLED: true,

  // Enable/disable integrations
  STRIPE_ENABLED: true,
  AI_VISION_ENABLED: true,
};

/**
 * Configuration validation on startup
 */
export function validateConfig(): void {
  // Verify API URL is accessible
  if (!API_BASE_URL) {
    console.error('[CONFIG] API_BASE_URL is not configured');
  } else {
    console.log(`[CONFIG] API Base URL: ${API_BASE_URL}`);
  }

  // Verify required environment variables
  if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    console.warn('[CONFIG] Production environment but VITE_API_URL not set');
  }

  console.log(`[CONFIG] Environment: ${ENVIRONMENT}`);
}

/**
 * API Endpoints
 * Use these constants to make API calls
 */
export const API_ENDPOINTS = {
  // Health checks
  HEALTH: `${API_BASE_URL}/api/health`,
  LIVENESS: `${API_BASE_URL}/api/health/liveness`,
  READINESS: `${API_BASE_URL}/api/health/readiness`,

  // Meal management
  MEALS: `${API_BASE_URL}/api/meals`,
  MEAL_UPLOAD: `${API_BASE_URL}/api/upload-url`,
  MEAL_ANALYZE: `${API_BASE_URL}/api/analyze`,

  // Billing
  PLANS: `${API_BASE_URL}/api/plans`,
  CHECKOUT: `${API_BASE_URL}/api/checkout`,
  PORTAL: `${API_BASE_URL}/api/portal`,
  USAGE: `${API_BASE_URL}/api/usage`,
  WEBHOOK: `${API_BASE_URL}/api/webhook`,
  ME: `${API_BASE_URL}/api/me`,

  // Auth endpoints (self-managed auth)
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  AUTH_SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  AUTH_REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  AUTH_VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
  AUTH_RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`,
  AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  AUTH_RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  AUTH_CHECK_EMAIL: `${API_BASE_URL}/api/auth/check-email`,
  AUTH_VALIDATE_PASSWORD: `${API_BASE_URL}/api/auth/validate-password`,
  AUTH_PROVIDERS: `${API_BASE_URL}/api/auth/providers`,
  AUTH_LOGIN_GOOGLE: `${API_BASE_URL}/api/auth/login/google`,
  AUTH_LOGIN_MICROSOFT: `${API_BASE_URL}/api/auth/login/microsoft`,
  AUTH_SESSIONS: `${API_BASE_URL}/api/auth/sessions`,

  // Admin endpoints
  MIGRATE_MEALS: `${API_BASE_URL}/api/admin/migrate-meals`,
};

/**
 * Auth (MSAL) placeholders – configure via environment at deploy time
 */
export const AUTH = {
  // Example: https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/B2C_1_signupsignin
  authority: import.meta.env.VITE_AUTH_AUTHORITY || '',
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI || window.location.origin,
};

/**
 * Initialize configuration on app startup
 * Call this in your main.tsx or App.tsx
 */
export function initializeConfig(): void {
  if (import.meta.env.DEV) {
    console.log('[CONFIG] Frontend configuration loaded');
    console.log('[CONFIG] API:', API_BASE_URL);
  }
  validateConfig();
}
