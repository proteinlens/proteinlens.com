/**
 * Authentication API Endpoints
 * Self-managed auth with PostgreSQL - signup, signin, refresh, logout
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { z } from 'zod';
import { getPrismaClient } from '../utils/prisma.js';
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  checkPasswordBreached,
  generateSecureToken,
  hashToken,
} from '../utils/password.js';
import {
  generateTokenPair,
  verifyToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
  TokenError,
} from '../utils/jwt.js';
import { getEmailService } from '../utils/email.js';
import { AuthEventService } from '../utils/authEvents.js';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  setCsrfTokenCookie,
  clearCsrfTokenCookie,
  generateCsrfToken,
  getRefreshTokenFromCookie,
  validateCsrfToken,
} from '../utils/cookies.js';

const prisma = getPrismaClient();
const emailService = getEmailService();
const authEvents = new AuthEventService(prisma);

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────

const signupSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(320, 'Email address is too long')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be less than 128 characters'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters')
    .transform(val => val.trim()),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters')
    .transform(val => val.trim()),
  organizationName: z.string()
    .max(100, 'Organization name is too long')
    .optional()
    .transform(val => val?.trim() || undefined),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service' }),
  }),
  acceptedPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Privacy Policy' }),
  }),
});

const signinSchema = z.object({
  email: z.string().email().transform(val => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

const resendVerificationSchema = z.object({
  email: z.string().email().transform(val => val.toLowerCase().trim()),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().transform(val => val.toLowerCase().trim()),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(12).max(128),
});

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

async function logSignupAttempt(
  email: string,
  outcome: 'SUCCESS' | 'VALIDATION_ERROR' | 'DUPLICATE_EMAIL' | 'RATE_LIMITED' | 'CAPTCHA_FAILED' | 'BREACH_PASSWORD' | 'NETWORK_ERROR',
  ipAddress: string,
  userAgent: string | null,
  failureReason?: string
): Promise<void> {
  try {
    await prisma.signupAttempt.create({
      data: {
        email,
        outcome,
        ipAddress,
        userAgent,
        failureReason,
      },
    });
  } catch (error) {
    console.error('[Auth] Failed to log signup attempt:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────────────────────────

async function signup(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    // Parse and validate request body
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      await logSignupAttempt(
        (body as any)?.email || 'unknown',
        'VALIDATION_ERROR',
        ipAddress,
        userAgent,
        result.error.errors[0]?.message
      );
      return {
        status: 400,
        jsonBody: {
          error: 'Validation failed',
          details: result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      };
    }

    const { email, password, firstName, lastName, organizationName, acceptedTerms, acceptedPrivacy } = result.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await logSignupAttempt(email, 'DUPLICATE_EMAIL', ipAddress, userAgent, 'Email already registered');
      return {
        status: 409,
        jsonBody: {
          error: 'An account with this email already exists',
          code: 'DUPLICATE_EMAIL',
        },
      };
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      await logSignupAttempt(email, 'VALIDATION_ERROR', ipAddress, userAgent, passwordValidation.errors[0]);
      return {
        status: 400,
        jsonBody: {
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
          requirements: passwordValidation.requirements,
        },
      };
    }

    // Check if password has been breached
    const isBreached = await checkPasswordBreached(password);
    if (isBreached) {
      await logSignupAttempt(email, 'BREACH_PASSWORD', ipAddress, userAgent, 'Password found in breach database');
      return {
        status: 400,
        jsonBody: {
          error: 'This password has been found in a data breach. Please choose a different password.',
          code: 'BREACHED_PASSWORD',
        },
      };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    // Generate email verification token
    const verificationToken = generateSecureToken(32);
    const verificationTokenHash = hashToken(verificationToken);

    // Create user and verification token in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          organizationName,
          authProvider: 'LOCAL',
          emailVerified: false,
          profileCompleted: true,
          plan: 'FREE',
        },
      });

      // Create email verification token
      await tx.emailVerificationToken.create({
        data: {
          userId: newUser.id,
          tokenHash: verificationTokenHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // Record consent
      await tx.consentRecord.createMany({
        data: [
          {
            userId: newUser.id,
            consentType: 'TERMS_OF_SERVICE',
            documentVersion: process.env.TOS_VERSION || '1.0.0',
            ipAddress,
            userAgent,
          },
          {
            userId: newUser.id,
            consentType: 'PRIVACY_POLICY',
            documentVersion: process.env.PRIVACY_VERSION || '1.0.0',
            ipAddress,
            userAgent,
          },
        ],
      });

      return newUser;
    });

    await logSignupAttempt(email, 'SUCCESS', ipAddress, userAgent);

    // Send verification email (FR-005)
    const emailResult = await emailService.sendVerificationEmail({
      email,
      token: verificationToken,
      expiresInHours: 24,
    });

    if (!emailResult.success) {
      context.warn(`[Auth] Failed to send verification email to ${email}: ${emailResult.error}`);
    }

    // Log auth event (FR-031)
    await authEvents.logSignupSuccess(user.id, email, { ipAddress, userAgent: userAgent || undefined });

    return {
      status: 201,
      jsonBody: {
        message: 'Account created successfully. Please check your email to verify your account.',
        userId: user.id,
        email: user.email,
        // In dev mode, return token for testing
        ...(process.env.NODE_ENV === 'development' && { verificationToken }),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    context.error('[Auth] Signup error:', errorMessage, errorStack);
    
    // Include more details in response for debugging (can be removed in production)
    return {
      status: 500,
      jsonBody: { 
        error: 'An unexpected error occurred during signup',
        // Debug info - remove in production
        debug: process.env.NODE_ENV !== 'production' ? {
          message: errorMessage,
          type: error?.constructor?.name,
        } : undefined,
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signin
// ─────────────────────────────────────────────────────────────────────────────

async function signin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const result = signinSchema.safeParse(body);

    if (!result.success) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid email or password format',
        },
      };
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      // Log failed signin attempt (FR-031)
      await authEvents.logSigninFailed(email, 'User not found', { ipAddress, userAgent: userAgent || undefined });
      // Don't reveal if email exists for security
      return {
        status: 401,
        jsonBody: { error: 'Invalid email or password' },
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      // Log failed signin attempt (FR-031)
      await authEvents.logSigninFailed(email, 'Invalid password', { ipAddress, userAgent: userAgent || undefined }, user.id);
      return {
        status: 401,
        jsonBody: { error: 'Invalid email or password' },
      };
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Log failed signin attempt (FR-031)
      await authEvents.logSigninFailed(email, 'Email not verified', { ipAddress, userAgent: userAgent || undefined }, user.id);
      return {
        status: 403,
        jsonBody: {
          error: 'Please verify your email before signing in',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
        },
      };
    }

    // Generate token pair
    const tokens = await generateTokenPair({
      userId: user.id,
      email: user.email!, // Email is guaranteed non-null for LOCAL auth users
    });

    // Store refresh token hash in database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(tokens.refreshToken),
        deviceInfo: userAgent?.substring(0, 255),
        ipAddress,
        expiresAt: tokens.refreshExpiresAt,
      },
    });

    // Log successful signin (FR-031)
    await authEvents.logSigninSuccess(user.id, email, { ipAddress, userAgent: userAgent || undefined });

    // Generate CSRF token for double-submit cookie pattern
    const csrfToken = generateCsrfToken();

    return {
      status: 200,
      // Set refresh token as HttpOnly cookie (T024) and CSRF token cookie (T025)
      cookies: [
        setRefreshTokenCookie(tokens.refreshToken, tokens.refreshExpiresAt),
        setCsrfTokenCookie(csrfToken),
      ],
      jsonBody: {
        accessToken: tokens.accessToken,
        // Include refresh token in body for backward compatibility
        // Frontend should transition to using HttpOnly cookie
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        csrfToken, // Include for client to use in future requests
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: user.plan,
          emailVerified: user.emailVerified,
        },
      },
    };
  } catch (error) {
    context.error('[Auth] Signin error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred during signin' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────────────────────

async function refresh(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Try to get refresh token from HttpOnly cookie first, then body (backward compat)
    let refreshToken = getRefreshTokenFromCookie(request);
    let usingCookie = !!refreshToken;

    if (!refreshToken) {
      // Fall back to body for backward compatibility
      const body = await request.json().catch(() => ({}));
      const result = refreshSchema.safeParse(body);
      if (result.success) {
        refreshToken = result.data.refreshToken;
      }
    }

    if (!refreshToken) {
      return {
        status: 400,
        jsonBody: { error: 'Refresh token is required' },
      };
    }

    // Validate CSRF token if using cookie-based refresh (T025)
    if (usingCookie && !validateCsrfToken(request)) {
      return {
        status: 403,
        jsonBody: { error: 'Invalid or missing CSRF token', code: 'CSRF_INVALID' },
      };
    }

    // Verify the refresh token JWT
    let payload;
    try {
      payload = await verifyToken(refreshToken, 'refresh');
    } catch (error) {
      if (error instanceof TokenError) {
        return {
          status: 401,
          // Clear the invalid cookie
          cookies: usingCookie ? [clearRefreshTokenCookie(), clearCsrfTokenCookie()] : undefined,
          jsonBody: { error: error.message, code: error.code },
        };
      }
      throw error;
    }

    // Check if token is in database and not revoked
    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt) {
      return {
        status: 401,
        cookies: usingCookie ? [clearRefreshTokenCookie(), clearCsrfTokenCookie()] : undefined,
        jsonBody: { error: 'Invalid or revoked refresh token' },
      };
    }

    // Generate new token pair
    const tokens = await generateTokenPair({
      userId: storedToken.user.id,
      email: storedToken.user.email ?? '', // Fallback for legacy users
    });

    // Revoke old refresh token and create new one (token rotation)
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          tokenHash: hashRefreshToken(tokens.refreshToken),
          deviceInfo: storedToken.deviceInfo,
          ipAddress: storedToken.ipAddress,
          expiresAt: tokens.refreshExpiresAt,
        },
      }),
    ]);

    // Generate new CSRF token
    const csrfToken = generateCsrfToken();

    return {
      status: 200,
      // Set new cookies for rotated tokens
      cookies: [
        setRefreshTokenCookie(tokens.refreshToken, tokens.refreshExpiresAt),
        setCsrfTokenCookie(csrfToken),
      ],
      jsonBody: {
        accessToken: tokens.accessToken,
        // Include refresh token in body for backward compatibility
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        csrfToken,
      },
    };
  } catch (error) {
    context.error('[Auth] Refresh error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────

async function logout(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    // Try to get refresh token from cookie first, then body (backward compat)
    let refreshToken: string | null = getRefreshTokenFromCookie(request);
    
    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = (body as { refreshToken?: string }).refreshToken ?? null;
    }

    if (refreshToken) {
      // Revoke the specific refresh token
      const tokenHash = hashRefreshToken(refreshToken);
      
      // Get user info before revoking for logging
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: { select: { id: true, email: true } } },
      });

      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      // Log auth event (FR-031)
      if (tokenRecord?.user) {
        await authEvents.logSignout(
          tokenRecord.user.id,
          tokenRecord.user.email!,
          { ipAddress, userAgent: userAgent || undefined }
        );
      }
    }

    // Clear cookies (T040) - always clear even if no token found
    return {
      status: 200,
      cookies: [
        clearRefreshTokenCookie(),
        clearCsrfTokenCookie(),
      ],
      jsonBody: { message: 'Logged out successfully' },
    };
  } catch (error) {
    context.error('[Auth] Logout error:', error);
    // Still try to clear cookies on error
    return {
      status: 500,
      cookies: [
        clearRefreshTokenCookie(),
        clearCsrfTokenCookie(),
      ],
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-email
// ─────────────────────────────────────────────────────────────────────────────

async function verifyEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const result = verifyEmailSchema.safeParse(body);

    if (!result.success) {
      return {
        status: 400,
        jsonBody: { error: 'Verification token is required' },
      };
    }

    const { token } = result.data;
    const tokenHash = hashToken(token);

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!verificationToken) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid verification token' },
      };
    }

    if (verificationToken.usedAt) {
      return {
        status: 400,
        jsonBody: { error: 'This verification link has already been used' },
      };
    }

    if (verificationToken.expiresAt < new Date()) {
      return {
        status: 400,
        jsonBody: {
          error: 'This verification link has expired. Please request a new one.',
          code: 'TOKEN_EXPIRED',
        },
      };
    }

    // Mark email as verified and token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Log auth event (FR-031)
    await authEvents.logEmailVerified(
      verificationToken.userId,
      verificationToken.user.email!,
      { ipAddress, userAgent: userAgent || undefined }
    );

    return {
      status: 200,
      jsonBody: {
        message: 'Email verified successfully. You can now sign in.',
        email: verificationToken.user.email,
      },
    };
  } catch (error) {
    context.error('[Auth] Verify email error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/resend-verification
// ─────────────────────────────────────────────────────────────────────────────

async function resendVerification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const result = resendVerificationSchema.safeParse(body);

    if (!result.success) {
      return {
        status: 400,
        jsonBody: { error: 'Valid email is required' },
      };
    }

    const { email } = result.data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal if email exists
    if (!user) {
      return {
        status: 200,
        jsonBody: { message: 'If an account exists with this email, a verification link will be sent.' },
      };
    }

    if (user.emailVerified) {
      return {
        status: 400,
        jsonBody: { error: 'This email is already verified' },
      };
    }

    // Check rate limiting (max 5 per hour)
    const recentTokens = await prisma.emailVerificationToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (recentTokens >= 5) {
      return {
        status: 429,
        jsonBody: { error: 'Too many verification requests. Please try again later.' },
      };
    }

    // Generate new verification token
    const verificationToken = generateSecureToken(32);
    const verificationTokenHash = hashToken(verificationToken);

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: verificationTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email (FR-007)
    const emailResult = await emailService.sendVerificationEmail({
      email,
      token: verificationToken,
      expiresInHours: 24,
    });

    if (!emailResult.success) {
      context.warn(`[Auth] Failed to resend verification email to ${email}: ${emailResult.error}`);
    }

    return {
      status: 200,
      jsonBody: {
        message: 'If an account exists with this email, a verification link will be sent.',
        ...(process.env.NODE_ENV === 'development' && { verificationToken }),
      },
    };
  } catch (error) {
    context.error('[Auth] Resend verification error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────

async function forgotPassword(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return {
        status: 400,
        jsonBody: { error: 'Valid email is required' },
      };
    }

    const { email } = result.data;
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Find user (don't reveal if exists)
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.authProvider !== 'LOCAL') {
      // Don't reveal if email exists or uses social login
      return {
        status: 200,
        jsonBody: { message: 'If an account exists with this email, a password reset link will be sent.' },
      };
    }

    // Rate limiting (max 3 per hour)
    const recentTokens = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (recentTokens >= 3) {
      return {
        status: 200,
        jsonBody: { message: 'If an account exists with this email, a password reset link will be sent.' },
      };
    }

    // Generate reset token
    const resetToken = generateSecureToken(32);
    const resetTokenHash = hashToken(resetToken);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: resetTokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send password reset email (FR-015)
    const emailResult = await emailService.sendPasswordResetEmail({
      email,
      token: resetToken,
      expiresInHours: 1,
    });

    if (!emailResult.success) {
      context.warn(`[Auth] Failed to send password reset email to ${email}: ${emailResult.error}`);
    }

    // Log auth event (FR-031)
    await authEvents.logPasswordResetRequested(email, { ipAddress, userAgent: userAgent || undefined }, user.id);

    return {
      status: 200,
      jsonBody: {
        message: 'If an account exists with this email, a password reset link will be sent.',
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      },
    };
  } catch (error) {
    context.error('[Auth] Forgot password error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────

async function resetPassword(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return {
        status: 400,
        jsonBody: {
          error: 'Validation failed',
          details: result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      };
    }

    const { token, password } = result.data;
    const tokenHash = hashToken(token);

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken) {
      return {
        status: 400,
        jsonBody: { error: 'Invalid password reset token' },
      };
    }

    if (resetToken.usedAt) {
      return {
        status: 400,
        jsonBody: { error: 'This reset link has already been used' },
      };
    }

    if (resetToken.expiresAt < new Date()) {
      return {
        status: 400,
        jsonBody: {
          error: 'This reset link has expired. Please request a new one.',
          code: 'TOKEN_EXPIRED',
        },
      };
    }

    // Validate new password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        status: 400,
        jsonBody: {
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        },
      };
    }

    // Check if password has been breached
    const isBreached = await checkPasswordBreached(password);
    if (isBreached) {
      return {
        status: 400,
        jsonBody: {
          error: 'This password has been found in a data breach. Please choose a different password.',
          code: 'BREACHED_PASSWORD',
        },
      };
    }

    // Hash new password and update user
    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens for security
      prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    // Send password changed notification email (FR-018)
    await emailService.sendPasswordChangedEmail({
      email: resetToken.user.email!,
      ipAddress,
      userAgent: userAgent || undefined,
    });

    // Log auth event (FR-031)
    await authEvents.logPasswordResetSuccess(
      resetToken.userId,
      resetToken.user.email!,
      { ipAddress, userAgent: userAgent || undefined }
    );

    return {
      status: 200,
      jsonBody: { message: 'Password reset successfully. You can now sign in with your new password.' },
    };
  } catch (error) {
    context.error('[Auth] Reset password error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/check-email
// ─────────────────────────────────────────────────────────────────────────────

async function checkEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const email = request.query.get('email')?.toLowerCase().trim();

    if (!email) {
      return {
        status: 400,
        jsonBody: { error: 'Email parameter is required' },
      };
    }

    context.log('[Auth] Checking email availability:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    context.log('[Auth] Email check result:', { email, available: !user });

    return {
      status: 200,
      jsonBody: { available: !user },
    };
  } catch (error) {
    context.error('[Auth] Check email error:', error);
    // Log more details about the error
    if (error instanceof Error) {
      context.error('[Auth] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/validate-password
// ─────────────────────────────────────────────────────────────────────────────

async function validatePasswordEndpoint(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    if (!password) {
      return {
        status: 400,
        jsonBody: { error: 'Password is required' },
      };
    }

    const validation = validatePassword(password);
    const isBreached = await checkPasswordBreached(password);

    return {
      status: 200,
      jsonBody: {
        ...validation,
        isBreached,
      },
    };
  } catch (error) {
    context.error('[Auth] Validate password error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/sessions (T044 - Phase 7: Session Management)
// ─────────────────────────────────────────────────────────────────────────────

async function listSessions(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Verify access token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        status: 401,
        jsonBody: { error: 'Access token required' },
      };
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = await verifyToken(token, 'access');
    } catch (error) {
      if (error instanceof TokenError) {
        return {
          status: 401,
          jsonBody: { error: error.message, code: error.code },
        };
      }
      throw error;
    }

    // Get current refresh token hash to mark current session
    const currentRefreshToken = getRefreshTokenFromCookie(request);
    const currentTokenHash = currentRefreshToken ? hashRefreshToken(currentRefreshToken) : null;

    // Get all active sessions for this user
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId: payload.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        tokenHash: true,
      },
    });

    // Format sessions for response (excluding sensitive tokenHash)
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt.toISOString(),
      isCurrent: currentTokenHash === session.tokenHash,
    }));

    return {
      status: 200,
      jsonBody: { sessions: formattedSessions },
    };
  } catch (error) {
    context.error('[Auth] List sessions error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/auth/sessions/:id (T045 - Phase 7: Session Management)
// ─────────────────────────────────────────────────────────────────────────────

async function revokeSession(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    // Verify access token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        status: 401,
        jsonBody: { error: 'Access token required' },
      };
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = await verifyToken(token, 'access');
    } catch (error) {
      if (error instanceof TokenError) {
        return {
          status: 401,
          jsonBody: { error: error.message, code: error.code },
        };
      }
      throw error;
    }

    // Get session ID from URL
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/').pop();
    
    if (!sessionId) {
      return {
        status: 400,
        jsonBody: { error: 'Session ID is required' },
      };
    }

    // Find the session
    const session = await prisma.refreshToken.findUnique({
      where: { id: sessionId },
      include: { user: { select: { id: true, email: true } } },
    });

    // Check if session exists and belongs to user
    if (!session) {
      return {
        status: 404,
        jsonBody: { error: 'Session not found' },
      };
    }

    if (session.userId !== payload.userId) {
      return {
        status: 403,
        jsonBody: { error: 'Cannot revoke another user\'s session' },
      };
    }

    // Check if already revoked
    if (session.revokedAt) {
      return {
        status: 200,
        jsonBody: { message: 'Session already revoked' },
      };
    }

    // Revoke the session
    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    // Log auth event (T046: SESSION_REVOKED)
    await authEvents.logSessionRevoked(
      payload.userId,
      payload.email,
      { ipAddress, userAgent: userAgent || undefined },
      sessionId
    );

    return {
      status: 200,
      jsonBody: { message: 'Session revoked successfully' },
    };
  } catch (error) {
    context.error('[Auth] Revoke session error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Register Azure Functions
// ─────────────────────────────────────────────────────────────────────────────

app.http('auth-signup', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/signup',
  handler: signup,
});

app.http('auth-signin', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/signin',
  handler: signin,
});

app.http('auth-refresh', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/refresh',
  handler: refresh,
});

app.http('auth-logout', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/logout',
  handler: logout,
});

app.http('auth-verify-email', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/verify-email',
  handler: verifyEmail,
});

app.http('auth-resend-verification', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/resend-verification',
  handler: resendVerification,
});

app.http('auth-forgot-password', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/forgot-password',
  handler: forgotPassword,
});

app.http('auth-reset-password', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/reset-password',
  handler: resetPassword,
});

app.http('auth-check-email', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/check-email',
  handler: checkEmail,
});

app.http('auth-validate-password', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/validate-password',
  handler: validatePasswordEndpoint,
});

// Session Management (Phase 7: T044, T045)
app.http('auth-sessions-list', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/sessions',
  handler: listSessions,
});

app.http('auth-sessions-revoke', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'auth/sessions/{sessionId}',
  handler: revokeSession,
});
