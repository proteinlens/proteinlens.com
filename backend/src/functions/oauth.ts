/**
 * OAuth Authentication Endpoints
 * Social login with Google and Microsoft using their OAuth 2.0 APIs
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import { getPrismaClient } from '../utils/prisma.js';
import { generateTokenPair, hashRefreshToken } from '../utils/jwt.js';
import { generateSecureToken, hashToken } from '../utils/password.js';

const prisma = getPrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// OAuth Configuration
// ─────────────────────────────────────────────────────────────────────────────

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
}

function getGoogleConfig(): OAuthConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:7071';
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth not configured: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/callback/google`,
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
  };
}

function getMicrosoftConfig(): OAuthConfig {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:7071';
  
  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth not configured: Missing MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET');
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/callback/microsoft`,
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['openid', 'email', 'profile', 'User.Read'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OAuth State Management (CSRF protection)
// ─────────────────────────────────────────────────────────────────────────────

// In production, use Redis or database. For simplicity, using in-memory with TTL
const oauthStates = new Map<string, { createdAt: number; returnUrl?: string }>();

// Clean up old states periodically (older than 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (now - data.createdAt > 10 * 60 * 1000) {
      oauthStates.delete(state);
    }
  }
}, 60 * 1000);

function generateOAuthState(returnUrl?: string): string {
  const state = generateSecureToken(32);
  oauthStates.set(state, { createdAt: Date.now(), returnUrl });
  return state;
}

function validateOAuthState(state: string): { valid: boolean; returnUrl?: string } {
  const data = oauthStates.get(state);
  if (!data) {
    return { valid: false };
  }
  
  // Check if state is not expired (10 minutes)
  if (Date.now() - data.createdAt > 10 * 60 * 1000) {
    oauthStates.delete(state);
    return { valid: false };
  }
  
  oauthStates.delete(state); // Single use
  return { valid: true, returnUrl: data.returnUrl };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getClientIp(request: HttpRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || '0.0.0.0';
}

function getUserAgent(request: HttpRequest): string | null {
  return request.headers.get('user-agent') || null;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

interface MicrosoftUserInfo {
  id: string;
  mail?: string;
  userPrincipalName: string;
  displayName: string;
  givenName?: string;
  surname?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/login/google
// ─────────────────────────────────────────────────────────────────────────────

async function googleLogin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const config = getGoogleConfig();
    const returnUrl = request.query.get('returnUrl') || undefined;
    const state = generateOAuthState(returnUrl);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return {
      status: 302,
      headers: {
        Location: `${config.authorizationUrl}?${params.toString()}`,
      },
    };
  } catch (error) {
    context.error('[OAuth] Google login error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Google login is not configured' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/login/microsoft
// ─────────────────────────────────────────────────────────────────────────────

async function microsoftLogin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const config = getMicrosoftConfig();
    const returnUrl = request.query.get('returnUrl') || undefined;
    const state = generateOAuthState(returnUrl);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      response_mode: 'query',
    });

    return {
      status: 302,
      headers: {
        Location: `${config.authorizationUrl}?${params.toString()}`,
      },
    };
  } catch (error) {
    context.error('[OAuth] Microsoft login error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Microsoft login is not configured' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/callback/google
// ─────────────────────────────────────────────────────────────────────────────

async function googleCallback(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const code = request.query.get('code');
    const state = request.query.get('state');
    const error = request.query.get('error');

    if (error) {
      context.warn('[OAuth] Google auth error:', error);
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=oauth_denied` },
      };
    }

    if (!code || !state) {
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=invalid_request` },
      };
    }

    // Validate state
    const { valid, returnUrl } = validateOAuthState(state);
    if (!valid) {
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=invalid_state` },
      };
    }

    const config = getGoogleConfig();

    // Exchange code for tokens
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      context.error('[OAuth] Google token exchange failed:', await tokenResponse.text());
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=token_exchange_failed` },
      };
    }

    const tokens = await tokenResponse.json() as { access_token: string };

    // Get user info
    const userInfoResponse = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      context.error('[OAuth] Google user info failed:', await userInfoResponse.text());
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=user_info_failed` },
      };
    }

    const userInfo = await userInfoResponse.json() as GoogleUserInfo;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { authProvider: 'GOOGLE', oauthProviderId: userInfo.id },
          { email: userInfo.email },
        ],
      },
    });

    if (user) {
      // Update OAuth info if linking existing email account
      if (user.authProvider !== 'GOOGLE') {
        // Account exists with different provider - could be email or Microsoft
        // For security, don't auto-link. User should link from account settings.
        return {
          status: 302,
          headers: { Location: `${frontendUrl}/login?error=account_exists&email=${encodeURIComponent(userInfo.email)}` },
        };
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          firstName: userInfo.given_name || null,
          lastName: userInfo.family_name || null,
          authProvider: 'GOOGLE',
          oauthProviderId: userInfo.id,
          emailVerified: userInfo.verified_email,
          profileCompleted: !!(userInfo.given_name && userInfo.family_name),
          plan: 'FREE',
        },
      });

      // Record consent (implicit for social login)
      await prisma.consentRecord.createMany({
        data: [
          {
            userId: user.id,
            consentType: 'TERMS_OF_SERVICE',
            documentVersion: process.env.TOS_VERSION || '1.0.0',
            ipAddress,
            userAgent,
          },
          {
            userId: user.id,
            consentType: 'PRIVACY_POLICY',
            documentVersion: process.env.PRIVACY_VERSION || '1.0.0',
            ipAddress,
            userAgent,
          },
        ],
      });
    }

    // Generate our own tokens
    const appTokens = await generateTokenPair({
      userId: user.id,
      email: user.email!, // Email is guaranteed for OAuth users
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(appTokens.refreshToken),
        deviceInfo: userAgent?.substring(0, 255),
        ipAddress,
        expiresAt: appTokens.refreshExpiresAt,
      },
    });

    // Redirect with tokens (use fragment for security - not sent to server)
    const redirectTo = returnUrl || '/dashboard';
    const callbackParams = new URLSearchParams({
      accessToken: appTokens.accessToken,
      refreshToken: appTokens.refreshToken,
      expiresIn: appTokens.expiresIn.toString(),
      returnUrl: redirectTo,
    });

    return {
      status: 302,
      headers: { Location: `${frontendUrl}/auth/callback?${callbackParams.toString()}` },
    };
  } catch (error) {
    context.error('[OAuth] Google callback error:', error);
    return {
      status: 302,
      headers: { Location: `${frontendUrl}/login?error=server_error` },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/callback/microsoft
// ─────────────────────────────────────────────────────────────────────────────

async function microsoftCallback(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const code = request.query.get('code');
    const state = request.query.get('state');
    const error = request.query.get('error');

    if (error) {
      context.warn('[OAuth] Microsoft auth error:', error);
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=oauth_denied` },
      };
    }

    if (!code || !state) {
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=invalid_request` },
      };
    }

    // Validate state
    const { valid, returnUrl } = validateOAuthState(state);
    if (!valid) {
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=invalid_state` },
      };
    }

    const config = getMicrosoftConfig();

    // Exchange code for tokens
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        scope: config.scopes.join(' '),
      }),
    });

    if (!tokenResponse.ok) {
      context.error('[OAuth] Microsoft token exchange failed:', await tokenResponse.text());
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=token_exchange_failed` },
      };
    }

    const tokens = await tokenResponse.json() as { access_token: string };

    // Get user info from Microsoft Graph
    const userInfoResponse = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      context.error('[OAuth] Microsoft user info failed:', await userInfoResponse.text());
      return {
        status: 302,
        headers: { Location: `${frontendUrl}/login?error=user_info_failed` },
      };
    }

    const userInfo = await userInfoResponse.json() as MicrosoftUserInfo;
    const email = userInfo.mail || userInfo.userPrincipalName;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { authProvider: 'MICROSOFT', oauthProviderId: userInfo.id },
          { email },
        ],
      },
    });

    if (user) {
      if (user.authProvider !== 'MICROSOFT') {
        return {
          status: 302,
          headers: { Location: `${frontendUrl}/login?error=account_exists&email=${encodeURIComponent(email)}` },
        };
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          firstName: userInfo.givenName || null,
          lastName: userInfo.surname || null,
          authProvider: 'MICROSOFT',
          oauthProviderId: userInfo.id,
          emailVerified: true, // Microsoft accounts are verified
          profileCompleted: !!(userInfo.givenName && userInfo.surname),
          plan: 'FREE',
        },
      });

      await prisma.consentRecord.createMany({
        data: [
          {
            userId: user.id,
            consentType: 'TERMS_OF_SERVICE',
            documentVersion: process.env.TOS_VERSION || '1.0.0',
            ipAddress,
            userAgent,
          },
          {
            userId: user.id,
            consentType: 'PRIVACY_POLICY',
            documentVersion: process.env.PRIVACY_VERSION || '1.0.0',
            ipAddress,
            userAgent,
          },
        ],
      });
    }

    const appTokens = await generateTokenPair({
      userId: user.id,
      email: user.email!, // Email is guaranteed for OAuth users
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(appTokens.refreshToken),
        deviceInfo: userAgent?.substring(0, 255),
        ipAddress,
        expiresAt: appTokens.refreshExpiresAt,
      },
    });

    const redirectTo = returnUrl || '/dashboard';
    const callbackParams = new URLSearchParams({
      accessToken: appTokens.accessToken,
      refreshToken: appTokens.refreshToken,
      expiresIn: appTokens.expiresIn.toString(),
      returnUrl: redirectTo,
    });

    return {
      status: 302,
      headers: { Location: `${frontendUrl}/auth/callback?${callbackParams.toString()}` },
    };
  } catch (error) {
    context.error('[OAuth] Microsoft callback error:', error);
    return {
      status: 302,
      headers: { Location: `${frontendUrl}/login?error=server_error` },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/providers - List available OAuth providers
// ─────────────────────────────────────────────────────────────────────────────

async function listProviders(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const providers = [];

  try {
    getGoogleConfig();
    providers.push({
      id: 'google',
      name: 'Google',
      loginUrl: '/api/auth/login/google',
    });
  } catch {
    // Google not configured
  }

  try {
    getMicrosoftConfig();
    providers.push({
      id: 'microsoft',
      name: 'Microsoft',
      loginUrl: '/api/auth/login/microsoft',
    });
  } catch {
    // Microsoft not configured
  }

  return {
    status: 200,
    jsonBody: { providers },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Register Azure Functions
// ─────────────────────────────────────────────────────────────────────────────

app.http('oauth-login-google', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/login/google',
  handler: googleLogin,
});

app.http('oauth-login-microsoft', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/login/microsoft',
  handler: microsoftLogin,
});

app.http('oauth-callback-google', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/callback/google',
  handler: googleCallback,
});

app.http('oauth-callback-microsoft', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/callback/microsoft',
  handler: microsoftCallback,
});

app.http('oauth-providers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/providers',
  handler: listProviders,
});
