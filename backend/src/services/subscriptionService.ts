// Subscription service for plan management
// Feature: 002-saas-billing

import { PrismaClient, Plan, SubscriptionStatus, User } from '@prisma/client';
import { BILLING_CONSTANTS } from '../models/subscription';

const prisma = new PrismaClient();

/**
 * Grace period in days after subscription ends
 * User keeps Pro features during this time
 */
const GRACE_PERIOD_DAYS = BILLING_CONSTANTS.GRACE_PERIOD_DAYS;

/**
 * Get user's current plan and billing info
 */
export async function getUserPlan(userId: string): Promise<{
  plan: Plan;
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}> {
  const user = await prisma.user.findUnique({
    where: { externalId: userId },
    select: {
      plan: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    return {
      plan: Plan.FREE,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
  }

  return user;
}

/**
 * Determine if user should have Pro access
 * Includes grace period logic for canceled/past_due subscriptions
 */
export function shouldHaveProAccess(
  plan: Plan,
  subscriptionStatus: SubscriptionStatus | null,
  currentPeriodEnd: Date | null
): boolean {
  // Free users never have Pro access
  if (plan === Plan.FREE) {
    return false;
  }

  // Active or trialing Pro subscriptions have access
  if (subscriptionStatus === SubscriptionStatus.active || 
      subscriptionStatus === SubscriptionStatus.trialing) {
    return true;
  }

  // Canceled or past_due: check grace period
  if (subscriptionStatus === SubscriptionStatus.canceled || 
      subscriptionStatus === SubscriptionStatus.past_due) {
    if (!currentPeriodEnd) {
      return false;
    }

    const gracePeriodEnd = new Date(currentPeriodEnd);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

    return new Date() <= gracePeriodEnd;
  }

  return false;
}

/**
 * Update user's subscription from Stripe webhook event
 */
export async function updateSubscriptionFromWebhook(
  stripeCustomerId: string,
  subscriptionId: string,
  status: string,
  currentPeriodEnd: Date
): Promise<User | null> {
  // Map Stripe status to our enum
  const mappedStatus = mapStripeStatus(status);

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId },
  });

  if (!user) {
    console.warn(`No user found for Stripe customer: ${stripeCustomerId}`);
    return null;
  }

  // Determine plan based on status
  const plan = mappedStatus === SubscriptionStatus.active || 
               mappedStatus === SubscriptionStatus.trialing
    ? Plan.PRO
    : user.plan; // Keep current plan for canceled (until downgrade logic)

  return prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: mappedStatus,
      currentPeriodEnd,
      plan,
    },
  });
}

/**
 * Downgrade user to Free plan (called when subscription fully expires)
 */
export async function downgradeToFree(stripeCustomerId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId },
  });

  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: {
      plan: Plan.FREE,
      subscriptionStatus: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    },
  });
}

/**
 * Log subscription event for audit trail
 */
export async function logSubscriptionEvent(
  userId: string | null,
  eventType: string,
  stripeEventId: string,
  eventData: Record<string, unknown>
): Promise<void> {
  // Check for duplicate event (idempotency)
  const existing = await prisma.subscriptionEvent.findUnique({
    where: { stripeEventId },
  });

  if (existing) {
    console.log(`Duplicate Stripe event ignored: ${stripeEventId}`);
    return;
  }

  await prisma.subscriptionEvent.create({
    data: {
      userId,
      eventType,
      stripeEventId,
      eventData: eventData as any,
      processedAt: new Date(),
    },
  });
}

/**
 * Get or create user by external ID
 */
export async function getOrCreateUser(
  externalId: string,
  email?: string
): Promise<User> {
  let user = await prisma.user.findUnique({
    where: { externalId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        externalId,
        email,
        plan: Plan.FREE,
      },
    });
  }

  return user;
}

/**
 * Update user's Stripe customer ID
 */
export async function updateStripeCustomerId(
  userId: string,
  stripeCustomerId: string
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId },
  });
}

/**
 * Map Stripe subscription status to our enum
 */
function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.active;
    case 'canceled':
      return SubscriptionStatus.canceled;
    case 'past_due':
      return SubscriptionStatus.past_due;
    case 'trialing':
      return SubscriptionStatus.trialing;
    default:
      // Default to canceled for unknown statuses
      return SubscriptionStatus.canceled;
  }
}

// Export prisma for direct queries if needed
export { prisma };
