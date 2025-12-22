// Quota middleware for enforcing scan limits
// Feature: 002-saas-billing, User Story 3
// T085: Added structured logging for quota enforcement

import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { canPerformScan } from '../services/usageService';
import { Logger } from '../utils/logger';

/**
 * Result of quota check
 */
export interface QuotaCheckResult {
  allowed: boolean;
  scansUsed: number;
  scansRemaining: number;
  scansLimit: number;
  plan: 'FREE' | 'PRO';
  reason?: string;
}

/**
 * Check if user has quota for a scan
 * Returns quota information without blocking
 */
export async function checkQuota(userId: string): Promise<QuotaCheckResult> {
  const result = await canPerformScan(userId);
  
  return {
    allowed: result.canScan,
    scansUsed: result.scansUsed,
    scansRemaining: result.scansRemaining,
    scansLimit: result.scansLimit,
    plan: result.plan,
    reason: result.reason,
  };
}

/**
 * Enforce weekly quota for scan operations
 * Returns a 429 response if quota exceeded
 * T085: Added structured logging
 * @param userId - User identifier
 * @returns null if allowed, HttpResponseInit if blocked
 */
export async function enforceWeeklyQuota(userId: string): Promise<HttpResponseInit | null> {
  const quotaCheck = await checkQuota(userId);

  // T085: Structured logging for quota enforcement
  Logger.info('Quota check performed', {
    userId,
    scansUsed: quotaCheck.scansUsed,
    scansLimit: quotaCheck.scansLimit,
    scansRemaining: quotaCheck.scansRemaining,
    plan: quotaCheck.plan,
    allowed: quotaCheck.allowed,
  });

  if (!quotaCheck.allowed) {
    Logger.warn('Quota exceeded - scan blocked', {
      userId,
      scansUsed: quotaCheck.scansUsed,
      scansLimit: quotaCheck.scansLimit,
      plan: quotaCheck.plan,
    });

    return {
      status: 429, // Too Many Requests
      headers: {
        'Content-Type': 'application/json',
        'X-Quota-Used': quotaCheck.scansUsed.toString(),
        'X-Quota-Limit': quotaCheck.scansLimit.toString(),
        'X-Quota-Remaining': '0',
        'Retry-After': '86400', // Suggest retry after 1 day
      },
      jsonBody: {
        error: 'Quota exceeded',
        message: quotaCheck.reason || `You've reached your weekly scan limit of ${quotaCheck.scansLimit} scans.`,
        quota: {
          used: quotaCheck.scansUsed,
          limit: quotaCheck.scansLimit,
          remaining: 0,
          plan: quotaCheck.plan,
        },
        upgrade: {
          message: 'Upgrade to Pro for unlimited scans',
          url: '/pricing',
        },
      },
    };
  }

  return null; // Quota check passed
}

/**
 * Extract user ID from request
 * Priority: Auth header > x-user-id header > blob path
 */
export function extractUserId(request: HttpRequest, blobName?: string): string | null {
  // Check Authorization header first (JWT would contain userId)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // TODO: Decode JWT and extract userId when auth is implemented
  }

  // Check x-user-id header (temporary for development)
  const userIdHeader = request.headers.get('x-user-id');
  if (userIdHeader) {
    return userIdHeader;
  }

  // Extract from blob name pattern: meals/{userId}/{filename}
  if (blobName) {
    const match = blobName.match(/^meals\/([^\/]+)\//);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * T060: Check if user has Pro plan
 * Returns a 403 response if user is on Free plan
 * @param userId - User identifier
 * @returns null if Pro, HttpResponseInit if Free
 */
export async function requirePro(userId: string): Promise<HttpResponseInit | null> {
  const quotaCheck = await checkQuota(userId);

  if (quotaCheck.plan !== 'PRO') {
    return {
      status: 403, // Forbidden
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        error: 'Pro subscription required',
        message: 'This feature is only available for Pro subscribers.',
        currentPlan: quotaCheck.plan,
        upgrade: {
          message: 'Upgrade to Pro to access this feature',
          url: '/pricing',
        },
      },
    };
  }

  return null; // User is Pro
}

/**
 * Get history days limit based on plan
 * Free: 7 days, Pro: unlimited (null)
 */
export function getHistoryDaysLimit(plan: 'FREE' | 'PRO'): number | null {
  return plan === 'PRO' ? null : 7;
}
