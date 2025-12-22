// Quota middleware for enforcing scan limits
// Feature: 002-saas-billing, User Story 3

import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { canPerformScan } from '../services/usageService';

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
 * @param userId - User identifier
 * @returns null if allowed, HttpResponseInit if blocked
 */
export async function enforceWeeklyQuota(userId: string): Promise<HttpResponseInit | null> {
  const quotaCheck = await checkQuota(userId);

  if (!quotaCheck.allowed) {
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
