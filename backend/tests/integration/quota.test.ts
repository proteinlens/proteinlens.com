// Integration tests for quota enforcement
// Feature: 002-saas-billing, User Story 3
// Tests: analyze increments usage, blocks at limit

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
import { canPerformScan, recordUsage, getUsageCount } from '../../src/services/usageService';
import { enforceWeeklyQuota } from '../../src/middleware/quotaMiddleware';
import { getUserPlan, shouldHaveProAccess } from '../../src/services/subscriptionService';

// Import enums from our mock for use in tests
const Plan = { FREE: 'FREE', PRO: 'PRO' } as const;
const UsageType = { MEAL_ANALYSIS: 'MEAL_ANALYSIS' } as const;

// Use the actual constant from billing - 1000 for POC extended quota
const FREE_SCANS_LIMIT = 1000;

describe('Quota Integration Tests', () => {
  const testUserId = 'test-user-123';
  const internalUserId = 'internal-uuid-456';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    mockUserFindUnique.mockReset();
    mockUserCreate.mockReset();
    mockUsageCount.mockReset();
    mockUsageCreate.mockReset();
    mockUsageFindMany.mockReset();
    
    // Default mock: user exists with FREE plan
    mockUserFindUnique.mockResolvedValue({
      id: internalUserId,
      externalId: testUserId,
      plan: Plan.FREE,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });
    
    // Default subscription service mock for FREE users
    vi.mocked(getUserPlan).mockResolvedValue({
      plan: Plan.FREE as any,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });
    vi.mocked(shouldHaveProAccess).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Free Tier Quota Enforcement', () => {
    it('should allow scan when usage is below limit', async () => {
      // Setup: User has used 3 of 1000 scans
      mockUsageCount.mockResolvedValue(3);

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(true);
      expect(result.scansUsed).toBe(3);
      expect(result.scansRemaining).toBe(997); // 1000 - 3
      expect(result.scansLimit).toBe(FREE_SCANS_LIMIT);
      expect(result.plan).toBe(Plan.FREE);
    });

    it('should block scan when usage reaches limit', async () => {
      // Setup: User has used all 1000 scans
      mockUsageCount.mockResolvedValue(1000);

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(false);
      expect(result.scansUsed).toBe(1000);
      expect(result.scansRemaining).toBe(0);
      expect(result.reason).toContain('Upgrade to Pro');
    });

    it('should block scan when usage exceeds limit', async () => {
      // Setup: Edge case - usage somehow exceeded limit
      mockUsageCount.mockResolvedValue(1005);

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(false);
      expect(result.scansRemaining).toBe(0); // Never negative
    });
  });

  describe('enforceWeeklyQuota middleware', () => {
    it('should return null (allow) when under quota', async () => {
      mockUsageCount.mockResolvedValue(2);

      const result = await enforceWeeklyQuota(testUserId);

      expect(result).toBeNull();
    });

    it('should return 429 response when quota exceeded', async () => {
      mockUsageCount.mockResolvedValue(1000);

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
      mockUsageCreate.mockResolvedValue({});

      await recordUsage(testUserId, UsageType.MEAL_ANALYSIS as any, mealId);

      expect(mockUsageCreate).toHaveBeenCalledWith({
        data: {
          userId: internalUserId,
          type: UsageType.MEAL_ANALYSIS,
          mealId,
        },
      });
    });

    it('should create user if not exists when recording usage', async () => {
      // User doesn't exist
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        id: 'new-internal-id',
        externalId: 'new-user',
        plan: Plan.FREE,
      });
      mockUsageCreate.mockResolvedValue({});

      await recordUsage('new-user', UsageType.MEAL_ANALYSIS as any);

      expect(mockUserCreate).toHaveBeenCalled();
      expect(mockUsageCreate).toHaveBeenCalled();
    });
  });

  describe('Pro User Unlimited Access', () => {
    it('should allow unlimited scans for Pro users', async () => {
      // Setup: Pro user with active subscription
      vi.mocked(getUserPlan).mockResolvedValue({
        plan: Plan.PRO as any,
        subscriptionStatus: 'active' as any,
        currentPeriodEnd: new Date('2025-12-31'),
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      });
      vi.mocked(shouldHaveProAccess).mockReturnValue(true);
      
      mockUserFindUnique.mockResolvedValue({
        id: internalUserId,
        externalId: testUserId,
      });
      mockUsageCount.mockResolvedValue(100); // High usage

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(true);
      expect(result.scansRemaining).toBe(-1); // Unlimited
      expect(result.scansLimit).toBe(-1); // Unlimited
      expect(result.plan).toBe(Plan.PRO);
    });

    it('should allow Pro user with 0 current usage', async () => {
      vi.mocked(getUserPlan).mockResolvedValue({
        plan: Plan.PRO as any,
        subscriptionStatus: 'active' as any,
        currentPeriodEnd: new Date('2025-12-31'),
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      });
      vi.mocked(shouldHaveProAccess).mockReturnValue(true);
      
      mockUserFindUnique.mockResolvedValue({
        id: internalUserId,
        externalId: testUserId,
      });
      mockUsageCount.mockResolvedValue(0);

      const result = await canPerformScan(testUserId);

      expect(result.canScan).toBe(true);
      expect(result.plan).toBe(Plan.PRO);
    });
  });

  describe('Rolling Window Calculation', () => {
    it('should only count scans within 7-day rolling window', async () => {
      mockUsageCount.mockResolvedValue(2);

      await getUsageCount(testUserId);

      // Verify the query includes date filter
      expect(mockUsageCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );

      // Verify the date is approximately 7 days ago
      const call = mockUsageCount.mock.calls[0][0];
      const windowStart = call.where.createdAt.gte;
      const now = new Date();
      const daysDiff = Math.round((now.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDiff).toBe(7);
    });
  });

  describe('New User Handling', () => {
    it('should return 0 usage for non-existent user', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const count = await getUsageCount('non-existent-user');

      expect(count).toBe(0);
    });

    it('should allow new user to scan (starts with 0 usage)', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'new-internal',
        externalId: 'new-user',
        plan: Plan.FREE,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      });
      mockUsageCount.mockResolvedValue(0);

      const result = await canPerformScan('new-user');

      expect(result.canScan).toBe(true);
      expect(result.scansUsed).toBe(0);
      expect(result.scansRemaining).toBe(1000); // 1000 - 0
    });
  });
});
