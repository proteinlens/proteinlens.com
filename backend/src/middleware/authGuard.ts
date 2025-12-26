import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { validateBearerToken, getOrCreateLocalUser, LocalUserProfile, AuthError, AuthErrorCode } from '../services/authService.js';

export interface AuthContext {
  user: LocalUserProfile;
  token: string;
}

export interface AuthFailure {
  response: HttpResponseInit;
}

export interface AuthSuccess {
  ctx: AuthContext;
}

export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Type guard to check if auth result is a failure
 */
export function isAuthFailure(result: AuthResult): result is AuthFailure {
  return 'response' in result;
}

/**
 * Type guard to check if auth result is a success
 */
export function isAuthSuccess(result: AuthResult): result is AuthSuccess {
  return 'ctx' in result;
}

/**
 * Middleware that enforces authentication on a request.
 * Extracts and validates the Bearer token, then retrieves/creates the local user.
 * 
 * @param request - The incoming HTTP request
 * @returns Either an AuthContext on success, or an HTTP error response on failure
 * 
 * @example
 * ```ts
 * const authResult = await requireAuth(request);
 * if (isAuthFailure(authResult)) {
 *   return authResult.response;
 * }
 * const { user, token } = authResult.ctx;
 * ```
 */
export async function requireAuth(request: HttpRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  
  if (!authHeader) {
    return createAuthError('TOKEN_MISSING', 'Authorization header is required', 401);
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return createAuthError('TOKEN_INVALID', 'Authorization header must use Bearer scheme', 401);
  }

  const token = authHeader.slice(7).trim(); // Remove "Bearer " prefix
  
  if (!token) {
    return createAuthError('TOKEN_MISSING', 'Bearer token is empty', 401);
  }

  try {
    const verified = await validateBearerToken(token);
    const user = await getOrCreateLocalUser(verified);
    
    // Check if user is suspended (Feature 012: Admin Dashboard)
    if (user.suspended) {
      return createSuspendedError();
    }
    
    return { ctx: { user, token } };
  } catch (err) {
    if (err instanceof AuthError) {
      return createAuthError(err.code, err.message, err.statusCode);
    }
    // Unexpected error - log and return generic message
    console.error('Unexpected auth error:', err);
    return createAuthError('TOKEN_INVALID', 'Authentication failed', 401);
  }
}

/**
 * Creates a standardized auth error response
 */
function createAuthError(code: AuthErrorCode, message: string, status: number): AuthFailure {
  return {
    response: {
      status,
      headers: { 
        'Content-Type': 'application/json',
        'WWW-Authenticate': `Bearer realm="proteinlens", error="${code}"`,
      },
      jsonBody: { 
        error: 'Unauthorized', 
        code,
        message,
      },
    },
  };
}

/**
 * Creates a suspended user error response
 * Feature 012: Admin Dashboard - blocks suspended users from accessing the API
 */
function createSuspendedError(): AuthFailure {
  return {
    response: {
      status: 403,
      headers: { 
        'Content-Type': 'application/json',
      },
      jsonBody: { 
        error: 'Forbidden', 
        code: 'USER_SUSPENDED',
        message: 'Your account has been suspended. Please contact support for assistance.',
      },
    },
  };
}
