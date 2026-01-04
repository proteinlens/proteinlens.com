// Quota middleware for enforcing scan limits
// Feature: 002-saas-billing, User Story 3
// T085: Added structured logging for quota enforcement
// Updated: Anonymous user quota tracking (3 scans)

import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { canPerformScan } from '../services/usageService';
import { canAnonymousScan } from '../services/anonymousQuotaService';
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
 * Handles both authenticated users and anonymous users
 * Returns a 429 response if quota exceeded
 * T085: Added structured logging
 * @param userId - User identifier (null for anonymous)
 * @param request - HTTP request (for extracting IP for anonymous users)
 * @returns null if allowed, HttpResponseInit if blocked
 */
export async function enforceWeeklyQuota(userId: string | null, request: HttpRequest): Promise<HttpResponseInit | null> {
  // Handle anonymous users (IP-based quota)
  if (!userId) {
    const ipAddress = extractClientIp(request);
    if (!ipAddress) {
      Logger.warn('Could not determine client IP for anonymous quota check');
      // Allow the request if we can't determine IP (fail open)
      return null;
    }

    const anonymousQuota = await canAnonymousScan(ipAddress);

    Logger.info('Anonymous quota check performed', {
      ipAddress: maskIp(ipAddress),
      scansUsed: anonymousQuota.scansUsed,
      scansLimit: anonymousQuota.scansLimit,
      scansRemaining: anonymousQuota.scansRemaining,
      allowed: anonymousQuota.canScan,
    });

    if (!anonymousQuota.canScan) {
      Logger.warn('Anonymous quota exceeded - scan blocked', {
        ipAddress: maskIp(ipAddress),
        scansUsed: anonymousQuota.scansUsed,
        scansLimit: anonymousQuota.scansLimit,
      });

      return {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-Quota-Used': anonymousQuota.scansUsed.toString(),
          'X-Quota-Limit': anonymousQuota.scansLimit.toString(),
          'X-Quota-Remaining': '0',
        },
        jsonBody: {
          error: 'Quota exceeded',
          message: anonymousQuota.reason || `You've used all ${anonymousQuota.scansLimit} free scans.`,
          quota: {
            used: anonymousQuota.scansUsed,
            limit: anonymousQuota.scansLimit,
            remaining: 0,
            plan: 'ANONYMOUS',
          },
          signup: {
            message: `Create a free account to get 20 scans per week!`,
            url: '/signup',
          },
        },
      };
    }

    return null; // Anonymous quota check passed
  }

  // Handle authenticated users (existing logic)
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

/**
 * Extract client IP address from request
 * Checks various headers used by proxies and Azure Functions
 */
export function extractClientIp(request: HttpRequest): string | null {
  // Check X-Forwarded-For (most common)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Take the first IP in the chain
    return xForwardedFor.split(',')[0].trim();
  }

  // Check X-Real-IP
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }

  // Check X-Azure-ClientIP (Azure-specific)
  const azureClientIp = request.headers.get('x-azure-clientip');
  if (azureClientIp) {
    return azureClientIp.trim();
  }

  return null;
}

/**
 * Mask IP address for logging (privacy)
 * Example: 192.168.1.100 -> 192.168.x.x
 */
function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  // IPv6 or other format - just mask last part
  return ip.substring(0, ip.length / 2) + 'xxx';
}
