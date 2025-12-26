/**
 * Signup Attempt Service
 * Feature 010 - User Signup Process
 * 
 * Tracks signup attempts for security monitoring and rate limiting.
 * Logs all attempts (success and failure) for audit purposes.
 */

import getPrismaClient from '../utils/prisma.js';
import { SignupAttemptOutcome } from '@prisma/client';
import { Logger } from '../utils/logger.js';

// Get prisma client
const prisma = getPrismaClient();

export interface SignupAttemptInput {
  email: string;
  ipAddress: string;
  userAgent?: string;
  outcome: SignupAttemptOutcome;
  failureReason?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining: number;
  resetAt: Date;
  message?: string;
}

// Rate limit configuration
const RATE_LIMITS = {
  // Per email address
  email: {
    maxAttempts: 5,
    windowMinutes: 60,
  },
  // Per IP address
  ip: {
    maxAttempts: 10,
    windowMinutes: 60,
  },
  // Before CAPTCHA is required
  captchaThreshold: 3,
};

/**
 * Log a signup attempt for audit and rate limiting.
 */
export async function logAttempt(input: SignupAttemptInput): Promise<void> {
  const { email, ipAddress, userAgent, outcome, failureReason } = input;

  Logger.info('Logging signup attempt', { 
    email: maskEmail(email), 
    outcome,
    ipAddress: maskIp(ipAddress),
  });

  await prisma.signupAttempt.create({
    data: {
      email: email.toLowerCase().trim(),
      ipAddress,
      userAgent: userAgent || null,
      outcome,
      failureReason: failureReason || null,
    },
  });
}

/**
 * Check if email/IP combination is rate limited.
 * Returns whether signup is allowed and remaining attempts.
 */
export async function checkRateLimit(
  email: string,
  ipAddress: string
): Promise<RateLimitResult> {
  const now = new Date();
  const normalizedEmail = email.toLowerCase().trim();

  // Calculate window start times
  const emailWindowStart = new Date(
    now.getTime() - RATE_LIMITS.email.windowMinutes * 60 * 1000
  );
  const ipWindowStart = new Date(
    now.getTime() - RATE_LIMITS.ip.windowMinutes * 60 * 1000
  );

  // Count recent attempts by email
  const emailAttempts = await prisma.signupAttempt.count({
    where: {
      email: normalizedEmail,
      createdAt: { gte: emailWindowStart },
    },
  });

  // Count recent attempts by IP
  const ipAttempts = await prisma.signupAttempt.count({
    where: {
      ipAddress,
      createdAt: { gte: ipWindowStart },
    },
  });

  Logger.debug('Rate limit check', {
    email: maskEmail(normalizedEmail),
    emailAttempts,
    emailMax: RATE_LIMITS.email.maxAttempts,
    ipAttempts,
    ipMax: RATE_LIMITS.ip.maxAttempts,
  });

  // Check email rate limit
  if (emailAttempts >= RATE_LIMITS.email.maxAttempts) {
    Logger.warn('Email rate limit exceeded', { 
      email: maskEmail(normalizedEmail),
      attempts: emailAttempts 
    });
    return {
      allowed: false,
      attemptsRemaining: 0,
      resetAt: new Date(emailWindowStart.getTime() + RATE_LIMITS.email.windowMinutes * 60 * 1000),
      message: 'Too many signup attempts for this email. Please try again later.',
    };
  }

  // Check IP rate limit
  if (ipAttempts >= RATE_LIMITS.ip.maxAttempts) {
    Logger.warn('IP rate limit exceeded', { 
      ip: maskIp(ipAddress),
      attempts: ipAttempts 
    });
    return {
      allowed: false,
      attemptsRemaining: 0,
      resetAt: new Date(ipWindowStart.getTime() + RATE_LIMITS.ip.windowMinutes * 60 * 1000),
      message: 'Too many signup attempts from your location. Please try again later.',
    };
  }

  // Calculate remaining attempts (minimum of both limits)
  const emailRemaining = RATE_LIMITS.email.maxAttempts - emailAttempts;
  const ipRemaining = RATE_LIMITS.ip.maxAttempts - ipAttempts;
  const attemptsRemaining = Math.min(emailRemaining, ipRemaining);

  // Calculate reset time (earliest reset)
  const resetAt = emailRemaining < ipRemaining
    ? new Date(emailWindowStart.getTime() + RATE_LIMITS.email.windowMinutes * 60 * 1000)
    : new Date(ipWindowStart.getTime() + RATE_LIMITS.ip.windowMinutes * 60 * 1000);

  return {
    allowed: true,
    attemptsRemaining,
    resetAt,
  };
}

/**
 * Check if CAPTCHA should be required based on recent failed attempts.
 * Returns true if more than captchaThreshold failed attempts from IP.
 */
export async function shouldRequireCaptcha(ipAddress: string): Promise<boolean> {
  const windowStart = new Date(
    Date.now() - RATE_LIMITS.ip.windowMinutes * 60 * 1000
  );

  const failedAttempts = await prisma.signupAttempt.count({
    where: {
      ipAddress,
      createdAt: { gte: windowStart },
      outcome: {
        in: [
          SignupAttemptOutcome.VALIDATION_ERROR,
          SignupAttemptOutcome.DUPLICATE_EMAIL,
          SignupAttemptOutcome.BREACH_PASSWORD,
        ],
      },
    },
  });

  const requireCaptcha = failedAttempts >= RATE_LIMITS.captchaThreshold;

  if (requireCaptcha) {
    Logger.info('CAPTCHA required due to failed attempts', {
      ip: maskIp(ipAddress),
      failedAttempts,
    });
  }

  return requireCaptcha;
}

/**
 * Get signup attempt statistics for monitoring.
 */
export async function getAttemptStats(
  since: Date
): Promise<{
  total: number;
  byOutcome: Record<SignupAttemptOutcome, number>;
  uniqueEmails: number;
  uniqueIps: number;
}> {
  const attempts = await prisma.signupAttempt.findMany({
    where: { createdAt: { gte: since } },
    select: { outcome: true, email: true, ipAddress: true },
  });

  const byOutcome: Record<string, number> = {};
  const uniqueEmails = new Set<string>();
  const uniqueIps = new Set<string>();

  for (const attempt of attempts) {
    byOutcome[attempt.outcome] = (byOutcome[attempt.outcome] || 0) + 1;
    uniqueEmails.add(attempt.email);
    uniqueIps.add(attempt.ipAddress);
  }

  return {
    total: attempts.length,
    byOutcome: byOutcome as Record<SignupAttemptOutcome, number>,
    uniqueEmails: uniqueEmails.size,
    uniqueIps: uniqueIps.size,
  };
}

/**
 * Check resend verification rate limit.
 * Users can only request 10 resends per day per email.
 */
export async function checkResendRateLimit(email: string): Promise<RateLimitResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Count resend requests in last 24 hours
  // Note: We track resends separately or use a specific outcome
  // For now, we'll count SUCCESS outcomes as potential resends
  const resendCount = await prisma.signupAttempt.count({
    where: {
      email: normalizedEmail,
      createdAt: { gte: oneDayAgo },
      outcome: SignupAttemptOutcome.SUCCESS,
    },
  });

  const maxResends = 10;
  if (resendCount >= maxResends) {
    return {
      allowed: false,
      attemptsRemaining: 0,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      message: 'Maximum verification email resends reached. Please try again tomorrow.',
    };
  }

  return {
    allowed: true,
    attemptsRemaining: maxResends - resendCount,
    resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

// Helper functions for masking sensitive data in logs

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : '**';
  return `${maskedLocal}@${domain}`;
}

function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    // IPv4: mask last two octets
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  // IPv6: mask last half
  return ip.substring(0, ip.length / 2) + '****';
}
