// Usage tracking service for scan quota enforcement
// Feature: 002-saas-billing

import { getPrismaClient, Plan, UsageType } from '../utils/prisma.js';
import { BILLING_CONSTANTS } from '../models/subscription.js';
import { shouldHaveProAccess, getUserPlan } from './subscriptionService.js';

const prisma = getPrismaClient();

// Re-export UsageType for use in other modules
export { UsageType };

/**
 * Rolling window in days for Free tier quota
 */
const ROLLING_WINDOW_DAYS = BILLING_CONSTANTS.ROLLING_WINDOW_DAYS;

/**
 * Maximum scans per rolling window for Free tier
 */
const FREE_SCANS_PER_WEEK = BILLING_CONSTANTS.FREE_SCANS_PER_WEEK;

/**
 * Get usage count for a user within the rolling window
 * @param userId - External user ID
 * @param type - Usage type (MEAL_ANALYSIS)
 */
export async function getUsageCount(
  userId: string,
  type: UsageType = UsageType.MEAL_ANALYSIS
): Promise<number> {
  // Find internal user ID
  const user = await prisma.user.findUnique({
    where: { externalId: userId },
    select: { id: true },
  });

  if (!user) {
    return 0;
  }

  // Calculate rolling window start
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - ROLLING_WINDOW_DAYS);

  const count = await prisma.usage.count({
    where: {
      userId: user.id,
      type,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  return count;
}

/**
 * Check if user can perform a scan
 * @param userId - External user ID
 * @returns Object with canScan flag and remaining scans
 */
export async function canPerformScan(userId: string): Promise<{
  canScan: boolean;
  scansUsed: number;
  scansRemaining: number; // -1 for unlimited
  scansLimit: number; // -1 for unlimited
  plan: Plan;
  reason?: string;
}> {
  // Get user's plan and billing info
  const userPlan = await getUserPlan(userId);
  
  // Check if user has Pro access (including grace period)
  const hasPro = shouldHaveProAccess(
    userPlan.plan,
    userPlan.subscriptionStatus,
    userPlan.currentPeriodEnd
  );

  // Pro users have unlimited scans
  if (hasPro) {
    return {
      canScan: true,
      scansUsed: await getUsageCount(userId),
      scansRemaining: -1, // Unlimited
      scansLimit: -1, // Unlimited
      plan: Plan.PRO,
    };
  }

  // Free tier: enforce quota
  const scansUsed = await getUsageCount(userId);
  const scansRemaining = Math.max(0, FREE_SCANS_PER_WEEK - scansUsed);

  if (scansUsed >= FREE_SCANS_PER_WEEK) {
    return {
      canScan: false,
      scansUsed,
      scansRemaining: 0,
      scansLimit: FREE_SCANS_PER_WEEK,
      plan: Plan.FREE,
      reason: `You've used all ${FREE_SCANS_PER_WEEK} free scans this week. Upgrade to Pro for unlimited scans.`,
    };
  }

  return {
    canScan: true,
    scansUsed,
    scansRemaining,
    scansLimit: FREE_SCANS_PER_WEEK,
    plan: Plan.FREE,
  };
}

/**
 * Record a usage event (e.g., meal scan)
 * @param userId - External user ID
 * @param type - Usage type
 * @param mealId - Optional meal analysis ID for reference
 */
export async function recordUsage(
  userId: string,
  type: UsageType = UsageType.MEAL_ANALYSIS,
  mealId?: string
): Promise<void> {
  // Get or create internal user
  let user = await prisma.user.findUnique({
    where: { externalId: userId },
    select: { id: true },
  });

  if (!user) {
    // Create user if doesn't exist (lazy user creation)
    const newUser = await prisma.user.create({
      data: {
        externalId: userId,
        plan: Plan.FREE,
      },
    });
    user = { id: newUser.id };
  }

  await prisma.usage.create({
    data: {
      userId: user.id,
      type,
      mealId,
    },
  });
}

/**
 * Get usage statistics for display
 * @param userId - External user ID
 */
export async function getUsageStats(userId: string): Promise<{
  plan: Plan;
  scansUsed: number;
  scansRemaining: number;
  scansLimit: number;
  periodStart: Date;
  periodEnd: Date;
}> {
  const result = await canPerformScan(userId);
  
  // Calculate rolling window dates
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - ROLLING_WINDOW_DAYS);

  return {
    plan: result.plan,
    scansUsed: result.scansUsed,
    scansRemaining: result.scansRemaining,
    scansLimit: result.scansLimit,
    periodStart,
    periodEnd,
  };
}

/**
 * Get detailed usage history for a user
 * @param userId - External user ID
 * @param limit - Maximum records to return
 */
export async function getUsageHistory(
  userId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  type: UsageType;
  mealId: string | null;
  createdAt: Date;
}>> {
  const user = await prisma.user.findUnique({
    where: { externalId: userId },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  return prisma.usage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      mealId: true,
      createdAt: true,
    },
  });
}

// Export prisma for testing
export { prisma };
