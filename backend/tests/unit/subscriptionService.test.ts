// Unit tests for subscription service grace period logic
// Feature: 002-saas-billing

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Plan, SubscriptionStatus } from '@prisma/client';
import { shouldHaveProAccess } from '../services/subscriptionService';

// Test constants
const GRACE_PERIOD_DAYS = 5;

describe('SubscriptionService', () => {
  describe('shouldHaveProAccess', () => {
    describe('Free plan', () => {
      it('should return false for Free plan regardless of status', () => {
        expect(shouldHaveProAccess(Plan.FREE, null, null)).toBe(false);
        expect(shouldHaveProAccess(Plan.FREE, SubscriptionStatus.active, null)).toBe(false);
        expect(shouldHaveProAccess(Plan.FREE, SubscriptionStatus.canceled, new Date())).toBe(false);
      });
    });

    describe('Pro plan - Active subscription', () => {
      it('should return true for active subscription', () => {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 1);

        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.active,
          futureDate
        )).toBe(true);
      });

      it('should return true for trialing subscription', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 14);

        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.trialing,
          futureDate
        )).toBe(true);
      });
    });

    describe('Pro plan - Canceled subscription (grace period)', () => {
      it('should return true within grace period', () => {
        // Period ended 2 days ago (within 5-day grace)
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() - 2);

        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.canceled,
          periodEnd
        )).toBe(true);
      });

      it('should return true on last day of grace period', () => {
        // Period ended exactly GRACE_PERIOD_DAYS ago
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() - GRACE_PERIOD_DAYS);

        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.canceled,
          periodEnd
        )).toBe(true);
      });

      it('should return false after grace period expires', () => {
        // Period ended 6 days ago (beyond 5-day grace)
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() - (GRACE_PERIOD_DAYS + 1));

        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.canceled,
          periodEnd
        )).toBe(false);
      });

      it('should return false if currentPeriodEnd is null', () => {
        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.canceled,
          null
        )).toBe(false);
      });
    });

    describe('Pro plan - Past due subscription (grace period)', () => {
      it('should return true within grace period for past_due', () => {
        // Period ended 3 days ago
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() - 3);

        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.past_due,
          periodEnd
        )).toBe(true);
      });

      it('should return false after grace period for past_due', () => {
        // Period ended 10 days ago
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() - 10);

        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.past_due,
          periodEnd
        )).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should return true when currentPeriodEnd is in the future', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        // Even canceled, if period end is in future, grace period extends from there
        expect(shouldHaveProAccess(
          Plan.PRO,
          SubscriptionStatus.canceled,
          futureDate
        )).toBe(true);
      });

      it('should handle unknown subscription status', () => {
        // Unknown status should be treated as no access
        expect(shouldHaveProAccess(
          Plan.PRO,
          'unknown_status' as SubscriptionStatus,
          new Date()
        )).toBe(false);
      });

      it('should handle null subscription status for Pro plan', () => {
        // Pro plan with null status (shouldn't happen but handle gracefully)
        expect(shouldHaveProAccess(
          Plan.PRO,
          null,
          null
        )).toBe(false);
      });
    });
  });
});
