// Subscription and billing type definitions
// Feature: 002-saas-billing

/**
 * User subscription plan tier
 */
export enum Plan {
  FREE = 'FREE',
  PRO = 'PRO',
}

/**
 * Stripe subscription status values
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

/**
 * Usage tracking event types
 */
export enum UsageType {
  MEAL_ANALYSIS = 'MEAL_ANALYSIS',
}

/**
 * User billing information
 */
export interface UserBilling {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
}

/**
 * Usage statistics for quota tracking
 */
export interface UsageStats {
  plan: Plan;
  subscriptionStatus: SubscriptionStatus | null;
  scansUsed: number;
  scansRemaining: number; // -1 for unlimited (Pro)
  scansLimit: number; // -1 for unlimited (Pro)
  periodStart: Date;
  periodEnd: Date;
  currentPeriodEnd: Date | null; // Subscription renewal date (Pro only)
}

/**
 * Pricing plan information
 */
export interface PlanInfo {
  id: Plan;
  name: string;
  priceMonthly: number | null; // EUR, null for free
  priceAnnual: number | null; // EUR, null for free
  stripePriceIdMonthly: string | null;
  stripePriceIdAnnual: string | null;
  features: PlanFeatures;
}

/**
 * Plan feature limits
 */
export interface PlanFeatures {
  scansPerWeek: number; // -1 for unlimited
  historyDays: number; // -1 for unlimited
  exportEnabled: boolean;
}

/**
 * Checkout session request
 */
export interface CheckoutRequest {
  priceId: string;
}

/**
 * Checkout session response
 */
export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Billing portal response
 */
export interface PortalResponse {
  url: string;
}

/**
 * Subscription event for audit logging
 */
export interface SubscriptionEventData {
  userId: string | null;
  eventType: string;
  stripeEventId: string;
  eventData: Record<string, unknown>;
  processedAt: Date | null;
}

/**
 * Constants for billing
 */
export const BILLING_CONSTANTS = {
  ANONYMOUS_SCANS_LIMIT: 3,      // Anonymous users get 3 scans before signup prompt
  FREE_SCANS_PER_WEEK: 20,       // Free plan gets 20 scans per week (generous to encourage adoption)
  FREE_HISTORY_DAYS: 7,
  ROLLING_WINDOW_DAYS: 7,
  GRACE_PERIOD_DAYS: 5,
  PRO_PRICE_MONTHLY_EUR: 9.99,
  PRO_PRICE_ANNUAL_EUR: 79.0,
} as const;

/**
 * Static plan definitions
 */
export const PLANS: PlanInfo[] = [
  {
    id: Plan.FREE,
    name: 'Free',
    priceMonthly: null,
    priceAnnual: null,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    features: {
      scansPerWeek: BILLING_CONSTANTS.FREE_SCANS_PER_WEEK,
      historyDays: BILLING_CONSTANTS.FREE_HISTORY_DAYS,
      exportEnabled: false,
    },
  },
  {
    id: Plan.PRO,
    name: 'Pro',
    priceMonthly: BILLING_CONSTANTS.PRO_PRICE_MONTHLY_EUR,
    priceAnnual: BILLING_CONSTANTS.PRO_PRICE_ANNUAL_EUR,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_MONTHLY || null,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_ANNUAL || null,
    features: {
      scansPerWeek: -1, // Unlimited
      historyDays: -1, // Unlimited
      exportEnabled: true,
    },
  },
];
