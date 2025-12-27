/**
 * Signup API Routes
 * Feature 010 - User Signup Process
 * Feature 011 - Observability telemetry
 * 
 * Endpoints for user registration, email validation, password validation,
 * and consent management.
 * 
 * Routes:
 * - POST /api/signup/profile - Create/update user profile after B2C signup
 * - POST /api/signup/check-email - Check if email is available
 * - POST /api/signup/validate-password - Validate password strength and breach status
 * - GET /api/signup/consent - Get user's consent records
 * - POST /api/signup/consent - Record user consent
 * - POST /api/signup/resend-verification - Resend email verification
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, isAuthFailure } from '../middleware/authGuard.js';
import { 
  checkEmailRequestSchema, 
  validatePasswordRequestSchema,
  createProfileRequestSchema,
  consentRequestSchema,
} from '../models/signupSchema.js';
import { validatePassword } from '../utils/passwordValidator.js';
import { Logger } from '../utils/logger.js';
import { 
  completeSignupProfile, 
  emailExists,
  getExtendedUserProfile,
} from '../services/authService.js';
import { 
  createConsent, 
  createMultipleConsents, 
  getActiveConsents,
} from '../services/consentService.js';
import { 
  logAttempt, 
  checkRateLimit, 
  shouldRequireCaptcha,
  checkResendRateLimit,
} from '../services/signupAttemptService.js';
import { ConsentType, SignupAttemptOutcome } from '@prisma/client';
import { correlationMiddleware } from '../middleware/correlationMiddleware.js';
import { trackEvent, trackMetric, trackException, setTraceContext } from '../utils/telemetry.js';

// Helper to get client IP from request
function getClientIp(request: HttpRequest): string {
  // Azure Functions provides client IP in headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const clientIp = request.headers.get('x-client-ip');
  if (clientIp) {
    return clientIp;
  }
  // Fallback
  return '0.0.0.0';
}

// Helper to get user agent from request
function getUserAgent(request: HttpRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/signup/profile - Create/update user profile
// ─────────────────────────────────────────────────────────────────────────────

async function createProfile(
  request: HttpRequest, 
  context: InvocationContext
): Promise<HttpResponseInit> {
  // T019: Extract correlation context
  const { traceContext, addResponseHeaders } = correlationMiddleware(request, context);
  setTraceContext(traceContext);
  
  // Requires authentication (B2C token)
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const parsed = createProfileRequestSchema.safeParse(body);

    if (!parsed.success) {
      await logAttempt({
        email: auth.ctx.user.email || 'unknown',
        ipAddress,
        userAgent,
        outcome: SignupAttemptOutcome.VALIDATION_ERROR,
        failureReason: parsed.error.errors[0]?.message,
      });

      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { 
          error: 'Invalid request data',
          details: parsed.error.errors,
        },
      };
    }

    const { firstName, lastName, organizationName, phone, consents } = parsed.data;

    // Complete user profile
    const profile = await completeSignupProfile(
      { 
        externalId: auth.ctx.user.externalId, 
        email: auth.ctx.user.email || '',
      },
      { firstName, lastName, organizationName, phone }
    );

    // Record consent records
    const consentInputs = consents.map(c => ({
      userId: profile.id,
      consentType: c.consentType as ConsentType,
      documentVersion: c.documentVersion,
      ipAddress,
      userAgent,
    }));
    await createMultipleConsents(consentInputs);

    // Log successful signup
    await logAttempt({
      email: profile.email || 'unknown',
      ipAddress,
      userAgent,
      outcome: SignupAttemptOutcome.SUCCESS,
    });

    Logger.info('Profile created successfully', { 
      userId: profile.id,
      profileCompleted: profile.profileCompleted,
    });

    // T034: Track successful signup
    trackEvent('proteinlens.auth.signup_completed', {
      correlationId: traceContext.correlationId,
      userId: profile.id,
      profileCompleted: String(profile.profileCompleted),
    });
    
    // Track signup count metric
    trackMetric({
      name: 'proteinlens.auth.signup_count',
      value: 1,
      properties: { source: 'profile' },
    });

    return addResponseHeaders({
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        organizationName: profile.organizationName,
        profileCompleted: profile.profileCompleted,
        emailVerified: profile.emailVerified,
      },
    });
  } catch (error) {
    Logger.error('Failed to create profile', error as Error);
    
    // T034: Track signup failure
    trackException(error as Error, {
      correlationId: traceContext.correlationId,
      operation: 'createProfile',
    });
    
    trackEvent('proteinlens.auth.signup_failed', {
      correlationId: traceContext.correlationId,
      errorType: (error as Error).name,
    });
    
    await logAttempt({
      email: auth.ctx.user.email || 'unknown',
      ipAddress,
      userAgent,
      outcome: SignupAttemptOutcome.NETWORK_ERROR,
      failureReason: 'Internal server error',
    });

    return addResponseHeaders({
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: { error: 'Failed to create profile' },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/signup/check-email - Check email availability
// ─────────────────────────────────────────────────────────────────────────────

async function checkEmail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const parsed = checkEmailRequestSchema.safeParse(body);

    if (!parsed.success) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { 
          error: 'Invalid email format',
          details: parsed.error.errors,
        },
      };
    }

    const { email } = parsed.data;

    // Check rate limiting
    const rateLimit = await checkRateLimit(email, ipAddress);
    if (!rateLimit.allowed) {
      return {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
        },
        jsonBody: { 
          error: rateLimit.message,
          retryAfter: rateLimit.resetAt.toISOString(),
        },
      };
    }

    // Check if CAPTCHA should be required
    const requireCaptcha = await shouldRequireCaptcha(ipAddress);

    // Check email availability
    const exists = await emailExists(email);

    // Note: Per FR-027, we don't reveal email existence until form submission
    // This endpoint is used for form submission, so we can reveal it
    if (exists) {
      await logAttempt({
        email,
        ipAddress,
        userAgent,
        outcome: SignupAttemptOutcome.DUPLICATE_EMAIL,
      });
    }

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        available: !exists,
        requireCaptcha,
      },
    };
  } catch (error) {
    const err = error as Error;
    Logger.error('Failed to check email', err);
    
    // Provide more details in non-production for debugging
    const errorDetails = process.env.NODE_ENV !== 'production' 
      ? { message: err.message, stack: err.stack }
      : undefined;
    
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: { 
        error: 'Failed to check email availability',
        ...(errorDetails && { details: errorDetails }),
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/signup/validate-password - Validate password strength
// ─────────────────────────────────────────────────────────────────────────────

async function validatePasswordEndpoint(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const parsed = validatePasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { 
          error: 'Invalid request',
          details: parsed.error.errors,
        },
      };
    }

    const { password } = parsed.data;

    // Validate password strength and check breaches
    const result = await validatePassword(password);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        strength: result.strength,
        level: result.level,
        breached: result.breached,
        valid: result.valid,
      },
    };
  } catch (error) {
    Logger.error('Failed to validate password', error as Error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: { error: 'Failed to validate password' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/signup/consent - Get user's consent records
// ─────────────────────────────────────────────────────────────────────────────

async function getConsents(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  try {
    const consents = await getActiveConsents(auth.ctx.user.id);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        consents: consents.map(c => ({
          type: c.consentType,
          version: c.documentVersion,
          grantedAt: c.grantedAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    Logger.error('Failed to get consents', error as Error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: { error: 'Failed to get consent records' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/signup/consent - Record user consent
// ─────────────────────────────────────────────────────────────────────────────

async function recordConsent(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const parsed = consentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { 
          error: 'Invalid consent data',
          details: parsed.error.errors,
        },
      };
    }

    const { consentType, documentVersion } = parsed.data;

    const consent = await createConsent({
      userId: auth.ctx.user.id,
      consentType: consentType as ConsentType,
      documentVersion,
      ipAddress,
      userAgent,
    });

    Logger.info('Consent recorded', { 
      userId: auth.ctx.user.id,
      consentType,
    });

    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        id: consent.id,
        type: consent.consentType,
        version: consent.documentVersion,
        grantedAt: consent.grantedAt.toISOString(),
      },
    };
  } catch (error) {
    Logger.error('Failed to record consent', error as Error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: { error: 'Failed to record consent' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/signup/resend-verification - Resend verification email
// ─────────────────────────────────────────────────────────────────────────────

async function resendVerification(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  const ipAddress = getClientIp(request);

  try {
    const email = auth.ctx.user.email;
    if (!email) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { error: 'No email associated with this account' },
      };
    }

    // Check rate limit (10 resends per day)
    const rateLimit = await checkResendRateLimit(email);
    if (!rateLimit.allowed) {
      return {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
        },
        jsonBody: { 
          error: rateLimit.message,
          retryAfter: rateLimit.resetAt.toISOString(),
          attemptsRemaining: rateLimit.attemptsRemaining,
        },
      };
    }

    // Note: Actual resend is triggered by redirecting user to B2C
    // This endpoint just validates rate limiting and returns success
    // The frontend will then redirect to B2C resend flow

    Logger.info('Verification resend requested', { 
      userId: auth.ctx.user.id,
      email: email.substring(0, 3) + '***',
    });

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: {
        message: 'Verification email will be sent',
        attemptsRemaining: rateLimit.attemptsRemaining,
      },
    };
  } catch (error) {
    Logger.error('Failed to resend verification', error as Error);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: { error: 'Failed to resend verification email' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Register routes
// ─────────────────────────────────────────────────────────────────────────────

app.http('signup-profile', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'signup/profile',
  handler: createProfile,
});

app.http('signup-check-email', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'signup/check-email',
  handler: checkEmail,
});

app.http('signup-validate-password', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'signup/validate-password',
  handler: validatePasswordEndpoint,
});

app.http('signup-get-consent', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'signup/consent',
  handler: getConsents,
});

app.http('signup-record-consent', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'signup/consent',
  handler: recordConsent,
});

app.http('signup-resend-verification', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'signup/resend-verification',
  handler: resendVerification,
});
