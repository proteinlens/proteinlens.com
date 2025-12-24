// Unit tests for usage service quota logic
// Feature: 002-saas-billing

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Use vi.hoisted to create mocks that are available during vi.mock hoisting
const { mockUserFindUnique, mockUserCreate, mockUsageCount, mockUsageCreate, mockUsageFindMany } = vi.hoisted(() => {
  return {
    mockUserFindUnique: vi.fn(),
    mockUserCreate: vi.fn(),
    mockUsageCount: vi.fn(),
    mockUsageCreate: vi.fn(),
    mockUsageFindMany: vi.fn(),
  };
});

// Mock the prisma utils module - uses hoisted mock functions
vi.mock('../../src/utils/prisma.js', () => {
  return {
    getPrismaClient: () => ({
      user: {
        findUnique: mockUserFindUnique,
        create: mockUserCreate,
      },
      usage: {
        count: mockUsageCount,
        create: mockUsageCreate,
        findMany: mockUsageFindMany,
      },
    }),
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
  };
});

// Mock subscription service
vi.mock('../../src/services/subscriptionService.js', () => ({
  getUserPlan: vi.fn(),
  shouldHaveProAccess: vi.fn(),
}));

// Now import the modules after mocks are set up
import * as usageService from '../../src/services/usageService.js';
import { getUserPlan, shouldHaveProAccess } from '../../src/services/subscriptionService.js';

// Import enums from our mock for use in tests
const Plan = { FREE: 'FREE', PRO: 'PRO' } as const;
const SubscriptionStatus = { active: 'active', canceled: 'canceled', past_due: 'past_due', trialing: 'trialing' } as const;

const FREE_SCANS_PER_WEEK = 5;

describe('UsageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockUserFindUnique.mockReset();
    mockUserCreate.mockReset();
    mockUsageCount.mockReset();
    mockUsageCreate.mockReset();
    mockUsageFindMany.mockReset();
    console.log('Test setup complete');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('canPerformScan', () => {
    it('should allow Pro users unlimited scans', async () => {
      // Setup
      vi.mocked(getUserPlan).mockResolvedValue({
        plan: Plan.PRO as any,
        subscriptionStatus: SubscriptionStatus.active as any,
        currentPeriodEnd: new Date('2025-12-31'),
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      });
      vi.mocked(shouldHaveProAccess).mockReturnValue(true);

      // Execute
      const result = await usageService.canPerformScan('user-123');

      // Assert
      expect(result.canScan).toBe(true);
      expect(result.scansRemaining).toBe(-1); // Unlimited
      expect(result.scansLimit).toBe(-1); // Unlimited
      expect(result.plan).toBe(Plan.PRO);
    });

    it('should allow Free users with scans remaining', async () => {
      // Setup
      vi.mocked(getUserPlan).mockResolvedValue({
        plan: Plan.FREE as any,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      });
      vi.mocked(shouldHaveProAccess).mockReturnValue(false);

      // Mock getUsageCount to return 3 (below limit)
      mockUserFindUnique.mockResolvedValue({ id: 'internal-123' });
      mockUsageCount.mockResolvedValue(3);

      // Execute
      const result = await usageService.canPerformScan('user-123');

      // Assert
      expect(result.canScan).toBe(true);
      expect(result.scansUsed).toBe(3);
      expect(result.scansRemaining).toBe(2); // 5 - 3 = 2
      expect(result.scansLimit).toBe(FREE_SCANS_PER_WEEK);
      expect(result.plan).toBe(Plan.FREE);
    });

    it('should block Free users at quota limit', async () => {
      // Setup
      vi.mocked(getUserPlan).mockResolvedValue({
        plan: Plan.FREE as any,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      });
      vi.mocked(shouldHaveProAccess).mockReturnValue(false);

      // Mock getUsageCount to return 5 (at limit)
      mockUserFindUnique.mockResolvedValue({ id: 'internal-123' });
      mockUsageCount.mockResolvedValue(5);

      // Execute
      const result = await usageService.canPerformScan('user-123');

      // Assert
      expect(result.canScan).toBe(false);
      expect(result.scansUsed).toBe(5);
      expect(result.scansRemaining).toBe(0);
      expect(result.reason).toContain('Upgrade to Pro');
    });

    it('should block Free users over quota limit', async () => {
      // Setup
      vi.mocked(getUserPlan).mockResolvedValue({
        plan: Plan.FREE as any,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      });
      vi.mocked(shouldHaveProAccess).mockReturnValue(false);

      // Mock getUsageCount to return 7 (over limit - edge case)
      mockUserFindUnique.mockResolvedValue({ id: 'internal-123' });
      mockUsageCount.mockResolvedValue(7);

      // Execute
      const result = await usageService.canPerformScan('user-123');

      // Assert
      expect(result.canScan).toBe(false);
      expect(result.scansRemaining).toBe(0); // Never negative
    });
  });

  describe('getUsageCount', () => {
    it('should return 0 for non-existent user', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const count = await usageService.getUsageCount('non-existent');

      expect(count).toBe(0);
    });

    it('should query usage within rolling 7-day window', async () => {
      mockUserFindUnique.mockResolvedValue({ id: 'internal-123' });
      mockUsageCount.mockResolvedValue(3);

      await usageService.getUsageCount('user-123');

      // Verify the query includes date filter
      expect(mockUsageCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'internal-123',
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('recordUsage', () => {
    it('should create usage record for existing user', async () => {
      mockUserFindUnique.mockResolvedValue({ id: 'internal-123' });
      mockUsageCreate.mockResolvedValue({});

      await usageService.recordUsage('user-123', 'MEAL_ANALYSIS' as any, 'meal-456');

      expect(mockUsageCreate).toHaveBeenCalledWith({
        data: {
          userId: 'internal-123',
          type: 'MEAL_ANALYSIS',
          mealId: 'meal-456',
        },
      });
    });

    it('should create user if not exists (lazy creation)', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ id: 'new-internal-123' });
      mockUsageCreate.mockResolvedValue({});

      await usageService.recordUsage('new-user');

      expect(mockUserCreate).toHaveBeenCalled();
      expect(mockUsageCreate).toHaveBeenCalledWith({
        data: {
          userId: 'new-internal-123',
          type: 'MEAL_ANALYSIS',
          mealId: undefined,
        },
      });
    });
  });
});
