// Integration tests for quota enforcement
// Feature: 002-saas-billing, User Story 3
// Tests: analyze increments usage, blocks at limit

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient, Plan, UsageType } from '@prisma/client';

// Mock Prisma client for testing
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  usage: {
    count: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
  Plan: {
    FREE: 'FREE',
    PRO: 'PRO',
  },
  SubscriptionStatus: {
    active: 'active',
    canceled: 'canceled',
    past_due: 'past_due',
    trialing: 'trialing',
  },
  UsageType: {
    MEAL_ANALYSIS: 'MEAL_ANALYSIS',
  },
}));

import { canPerformScan, recordUsage, getUsageCount } from '../../src/services/usageService';
import { enforceWeeklyQuota } from '../../src/middleware/quotaMiddleware';

const FREE_SCANS_LIMIT = 5;

describe('Quota Integration Tests', () => {
  const testUserId = 'test-user-123';
  const internalUserId = 'internal-uuid-456';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock: user exists with FREE plan
    mockPrisma.user.findUnique.mockResolvedValue({
      id: internalUserId,
      externalId: testUserId,
      plan: Plan.FREE,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Free Tier Quota Enforcement', () => {
    it('should allow scan when usage is below limit', async () => {
      // Setup: User has used 3 of 5 scans
      mockPrisma.usage.count.mockResolvedValue(3);

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(true);
      expect(result.scansUsed).toBe(3);
      expect(result.scansRemaining).toBe(2);
      expect(result.scansLimit).toBe(FREE_SCANS_LIMIT);
      expect(result.plan).toBe(Plan.FREE);
    });

    it('should block scan when usage reaches limit', async () => {
      // Setup: User has used all 5 scans
      mockPrisma.usage.count.mockResolvedValue(5);

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(false);
      expect(result.scansUsed).toBe(5);
      expect(result.scansRemaining).toBe(0);
      expect(result.reason).toContain('Upgrade to Pro');
    });

    it('should block scan when usage exceeds limit', async () => {
      // Setup: Edge case - usage somehow exceeded limit
      mockPrisma.usage.count.mockResolvedValue(7);

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(false);
      expect(result.scansRemaining).toBe(0); // Never negative
    });
  });

  describe('enforceWeeklyQuota middleware', () => {
    it('should return null (allow) when under quota', async () => {
      mockPrisma.usage.count.mockResolvedValue(2);

      const result = await enforceWeeklyQuota(testUserId);

      expect(result).toBeNull();
    });

    it('should return 429 response when quota exceeded', async () => {
      mockPrisma.usage.count.mockResolvedValue(5);

      const result = await enforceWeeklyQuota(testUserId);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
      expect(result?.headers?.['X-Quota-Remaining']).toBe('0');
      
      const body = JSON.parse(JSON.stringify(result?.jsonBody));
      expect(body.error).toBe('Quota exceeded');
      expect(body.upgrade.url).toBe('/pricing');
    });
  });

  describe('Usage Recording', () => {
    it('should increment usage count after successful analysis', async () => {
      const mealId = 'meal-analysis-789';
      mockPrisma.usage.create.mockResolvedValue({});

      await recordUsage(testUserId, UsageType.MEAL_ANALYSIS, mealId);

      expect(mockPrisma.usage.create).toHaveBeenCalledWith({
        data: {
          userId: internalUserId,
          type: UsageType.MEAL_ANALYSIS,
          mealId,
        },
      });
    });

    it('should create user if not exists when recording usage', async () => {
      // User doesn't exist
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-internal-id',
        externalId: 'new-user',
        plan: Plan.FREE,
      });
      mockPrisma.usage.create.mockResolvedValue({});

      await recordUsage('new-user', UsageType.MEAL_ANALYSIS);

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.usage.create).toHaveBeenCalled();
    });
  });

  describe('Pro User Unlimited Access', () => {
    it('should allow unlimited scans for Pro users', async () => {
      // Setup: Pro user with active subscription
      mockPrisma.user.findUnique.mockResolvedValue({
        id: internalUserId,
        externalId: testUserId,
        plan: Plan.PRO,
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date('2025-12-31'),
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      });
      mockPrisma.usage.count.mockResolvedValue(100); // High usage

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(true);
      expect(result.scansRemaining).toBe(-1); // Unlimited
      expect(result.scansLimit).toBe(-1); // Unlimited
      expect(result.plan).toBe(Plan.PRO);
    });

    it('should allow Pro user with 0 current usage', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: internalUserId,
        externalId: testUserId,
        plan: Plan.PRO,
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date('2025-12-31'),
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      });
      mockPrisma.usage.count.mockResolvedValue(0);

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(true);
      expect(result.plan).toBe(Plan.PRO);
    });
  });

  describe('Rolling Window Calculation', () => {
    it('should only count scans within 7-day rolling window', async () => {
      mockPrisma.usage.count.mockResolvedValue(2);

      await getUsageCount(testUserId);

      // Verify the query includes date filter
      expect(mockPrisma.usage.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );

      // Verify the date is approximately 7 days ago
      const call = mockPrisma.usage.count.mock.calls[0][0];
      const windowStart = call.where.createdAt.gte;
      const now = new Date();
      const daysDiff = Math.round((now.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDiff).toBe(7);
    });
  });

  describe('New User Handling', () => {
    it('should return 0 usage for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const count = await getUsageCount('non-existent-user');

      expect(count).toBe(0);
    });

    it('should allow new user to scan (starts with 0 usage)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.usage.count.mockResolvedValue(0);

      // For canPerformScan, we need the full user mock
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'new-internal',
        externalId: 'new-user',
        plan: Plan.FREE,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      });

      const result = await canPerformScan('new-user');

      expect(result.canScan).toBe(true);
      expect(result.scansUsed).toBe(0);
      expect(result.scansRemaining).toBe(5);
    });
  });
});
