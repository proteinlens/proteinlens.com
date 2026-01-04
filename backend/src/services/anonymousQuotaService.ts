// Anonymous user quota tracking service
// Tracks scan usage for non-authenticated users using IP-based fingerprinting

import { getPrismaClient } from '../utils/prisma.js';
import { BILLING_CONSTANTS } from '../models/subscription.js';

const prisma = getPrismaClient();

const ANONYMOUS_SCANS_LIMIT = BILLING_CONSTANTS.ANONYMOUS_SCANS_LIMIT;
const ROLLING_WINDOW_DAYS = BILLING_CONSTANTS.ROLLING_WINDOW_DAYS;

/**
 * Get anonymous scan count for an IP address within rolling window
 * @param ipAddress - Client IP address
 */
export async function getAnonymousScanCount(ipAddress: string): Promise<number> {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - ROLLING_WINDOW_DAYS);

  const count = await (prisma as any).anonymousUsage.count({
    where: {
      ipAddress,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  return count;
}

/**
 * Check if anonymous user can perform a scan
 * @param ipAddress - Client IP address
 */
export async function canAnonymousScan(ipAddress: string): Promise<{
  canScan: boolean;
  scansUsed: number;
  scansRemaining: number;
  scansLimit: number;
  reason?: string;
}> {
  const scansUsed = await getAnonymousScanCount(ipAddress);
  const scansRemaining = Math.max(0, ANONYMOUS_SCANS_LIMIT - scansUsed);

  if (scansUsed >= ANONYMOUS_SCANS_LIMIT) {
    return {
      canScan: false,
      scansUsed,
      scansRemaining: 0,
      scansLimit: ANONYMOUS_SCANS_LIMIT,
      reason: `You've used all ${ANONYMOUS_SCANS_LIMIT} free scans. Create a free account to get ${BILLING_CONSTANTS.FREE_SCANS_PER_WEEK} scans per week!`,
    };
  }

  return {
    canScan: true,
    scansUsed,
    scansRemaining,
    scansLimit: ANONYMOUS_SCANS_LIMIT,
  };
}

/**
 * Record anonymous scan usage
 * @param ipAddress - Client IP address
 * @param mealId - Optional meal analysis ID
 */
export async function recordAnonymousScan(
  ipAddress: string,
  mealId?: string
): Promise<void> {
  await (prisma as any).anonymousUsage.create({
    data: {
      ipAddress,
      mealId,
    },
  });
}
