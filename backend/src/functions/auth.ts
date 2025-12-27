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

const prisma = getPrismaClient();

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

    // TODO: Send verification email with verificationToken
    // For now, log it (in production, use email service)
    context.log(`[Auth] Verification token for ${email}: ${verificationToken}`);

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
    context.error('[Auth] Signup error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred during signup' },
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
      // Don't reveal if email exists for security
      return {
        status: 401,
        jsonBody: { error: 'Invalid email or password' },
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        status: 401,
        jsonBody: { error: 'Invalid email or password' },
      };
    }

    // Check if email is verified
    if (!user.emailVerified) {
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

    return {
      status: 200,
      jsonBody: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
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
    const body = await request.json();
    const result = refreshSchema.safeParse(body);

    if (!result.success) {
      return {
        status: 400,
        jsonBody: { error: 'Refresh token is required' },
      };
    }

    const { refreshToken } = result.data;

    // Verify the refresh token JWT
    let payload;
    try {
      payload = await verifyToken(refreshToken, 'refresh');
    } catch (error) {
      if (error instanceof TokenError) {
        return {
          status: 401,
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

    return {
      status: 200,
      jsonBody: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
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
  try {
    const body = await request.json();
    const { refreshToken } = body as { refreshToken?: string };

    if (refreshToken) {
      // Revoke the specific refresh token
      const tokenHash = hashRefreshToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return {
      status: 200,
      jsonBody: { message: 'Logged out successfully' },
    };
  } catch (error) {
    context.error('[Auth] Logout error:', error);
    return {
      status: 500,
      jsonBody: { error: 'An unexpected error occurred' },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-email
// ─────────────────────────────────────────────────────────────────────────────

async function verifyEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    // TODO: Send email with verificationToken
    context.log(`[Auth] New verification token for ${email}: ${verificationToken}`);

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

    // TODO: Send email with resetToken
    context.log(`[Auth] Password reset token for ${email}: ${resetToken}`);

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

    const user = await prisma.user.findUnique({ where: { email } });

    return {
      status: 200,
      jsonBody: { available: !user },
    };
  } catch (error) {
    context.error('[Auth] Check email error:', error);
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
