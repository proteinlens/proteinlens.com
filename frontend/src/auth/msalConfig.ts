/**
 * MSAL Configuration
 * 
 * Configures Azure AD B2C authentication for the frontend
 * Set environment variables for production/staging deployments
 */

import { PublicClientApplication, Configuration, LogLevel } from '@azure/msal-browser';
import { AUTH } from '../config';

/**
 * MSAL configuration object
 * Uses environment variables for authority and clientId
 */
const msalConfig: Configuration = {
  auth: {
    clientId: AUTH.clientId,
    authority: AUTH.authority,
    redirectUri: AUTH.redirectUri,
    postLogoutRedirectUri: AUTH.redirectUri,
    knownAuthorities: AUTH.authority ? [new URL(AUTH.authority).hostname] : [],
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            break;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            break;
          case LogLevel.Info:
            if (import.meta.env.DEV) {
              console.info('[MSAL]', message);
            }
            break;
          case LogLevel.Verbose:
            if (import.meta.env.DEV) {
              console.debug('[MSAL]', message);
            }
            break;
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Verbose : LogLevel.Warning,
    },
  },
};

/**
 * Login request scopes
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

/**
 * Check if MSAL is properly configured
 */
export function isMsalConfigured(): boolean {
  return Boolean(AUTH.clientId && AUTH.authority);
}

/**
 * Create and initialize MSAL instance
 * Returns null if not properly configured
 */
export function createMsalInstance(): PublicClientApplication | null {
  if (!isMsalConfigured()) {
    console.warn('[MSAL] Authentication not configured. Set VITE_AUTH_CLIENT_ID and VITE_AUTH_AUTHORITY.');
    return null;
  }

  try {
    const msalInstance = new PublicClientApplication(msalConfig);
    // Set on window for backward compatibility with AuthProvider
    (window as any).msalInstance = msalInstance;
    return msalInstance;
  } catch (error) {
    console.error('[MSAL] Failed to create instance:', error);
    return null;
  }
}

/**
 * Initialize MSAL - call this before rendering the app
 */
export async function initializeMsal(): Promise<PublicClientApplication | null> {
  const instance = createMsalInstance();
  if (!instance) return null;

  try {
    await instance.initialize();
    console.log('[MSAL] Initialized successfully');
    return instance;
  } catch (error) {
    console.error('[MSAL] Initialization failed:', error);
    return null;
  }
}
