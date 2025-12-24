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
 * Production: https://proteinlens-api-prod.azurewebsites.net (from VITE_API_URL env var)
 * Staging: https://proteinlens-api-staging.azurewebsites.net (from VITE_API_URL env var)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:7071' : '');

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
