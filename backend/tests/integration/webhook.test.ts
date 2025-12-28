// Integration tests for Stripe webhook handling
// Feature: 002-saas-billing, User Story 2
// Tests: mock Stripe events, verify DB updates

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Use vi.hoisted to create mocks that are available during vi.mock hoisting
const { mockUserFindUnique, mockUserUpdate, mockSubscriptionEventFindUnique, mockSubscriptionEventCreate } = vi.hoisted(() => {
  return {
    mockUserFindUnique: vi.fn(),
    mockUserUpdate: vi.fn(),
    mockSubscriptionEventFindUnique: vi.fn(),
    mockSubscriptionEventCreate: vi.fn(),
  };
});

// Mock the prisma utils module - uses hoisted mock functions
vi.mock('../../src/utils/prisma.js', () => {
  return {
    getPrismaClient: () => ({
      user: {
        findUnique: mockUserFindUnique,
        update: mockUserUpdate,
      },
      subscriptionEvent: {
        findUnique: mockSubscriptionEventFindUnique,
        create: mockSubscriptionEventCreate,
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
  };
});

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));

// Import after mocks
import { 
  updateSubscriptionFromWebhook, 
  downgradeToFree,
  logSubscriptionEvent,
} from '../../src/services/subscriptionService';

// Import enums for use in tests
const Plan = { FREE: 'FREE', PRO: 'PRO' } as const;
const SubscriptionStatus = { active: 'active', canceled: 'canceled', past_due: 'past_due', trialing: 'trialing' } as const;

describe('Webhook Integration Tests', () => {
  const testCustomerId = 'cus_test123';
  const testSubscriptionId = 'sub_test456';
  const testUserId = 'user-uuid-789';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    mockUserFindUnique.mockReset();
    mockUserUpdate.mockReset();
    mockSubscriptionEventFindUnique.mockReset();
    mockSubscriptionEventCreate.mockReset();

    // Default mock: user exists
    mockUserFindUnique.mockResolvedValue({
      id: testUserId,
      externalId: 'external-123',
      stripeCustomerId: testCustomerId,
      stripeSubscriptionId: testSubscriptionId,
      plan: Plan.PRO,
      subscriptionStatus: SubscriptionStatus.active,
      currentPeriodEnd: new Date('2025-12-31'),
    });

    mockUserUpdate.mockResolvedValue({
      id: testUserId,
      plan: Plan.PRO,
    });

    mockSubscriptionEventFindUnique.mockResolvedValue(null);
    mockSubscriptionEventCreate.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkout.session.completed handling', () => {
    it('should upgrade user to Pro on successful checkout', async () => {
      const futureDate = new Date('2025-12-31');

      await updateSubscriptionFromWebhook(
        testCustomerId,
        testSubscriptionId,
        'active',
        futureDate
      );

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          stripeSubscriptionId: testSubscriptionId,
          subscriptionStatus: SubscriptionStatus.active,
          plan: Plan.PRO,
        }),
      });
    });
  });

  describe('customer.subscription.updated handling', () => {
    it('should update subscription period end', async () => {
      const newPeriodEnd = new Date('2026-01-31');

      await updateSubscriptionFromWebhook(
        testCustomerId,
        testSubscriptionId,
        'active',
        newPeriodEnd
      );

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          currentPeriodEnd: newPeriodEnd,
          subscriptionStatus: SubscriptionStatus.active,
        }),
      });
    });

    it('should update status to canceled', async () => {
      await updateSubscriptionFromWebhook(
        testCustomerId,
        testSubscriptionId,
        'canceled',
        new Date('2025-12-31')
      );

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          subscriptionStatus: SubscriptionStatus.canceled,
        }),
      });
    });
  });

  describe('customer.subscription.deleted handling', () => {
    it('should downgrade user to Free', async () => {
      mockUserUpdate.mockResolvedValue({
        id: testUserId,
        plan: Plan.FREE,
        subscriptionStatus: null,
      });

      await downgradeToFree(testCustomerId);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: {
          plan: Plan.FREE,
          subscriptionStatus: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        },
      });
    });

    it('should handle non-existent user gracefully', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const result = await downgradeToFree('non-existent-customer');

      expect(result).toBeNull();
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });
  });

  describe('invoice.payment_failed handling', () => {
    it('should set subscription status to past_due', async () => {
      await updateSubscriptionFromWebhook(
        testCustomerId,
        testSubscriptionId,
        'past_due',
        new Date('2025-12-31')
      );

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          subscriptionStatus: SubscriptionStatus.past_due,
        }),
      });
    });
  });

  describe('Event logging (idempotency)', () => {
    it('should create event record for new events', async () => {
      mockSubscriptionEventFindUnique.mockResolvedValue(null);

      await logSubscriptionEvent(
        testUserId,
        'checkout.session.completed',
        'evt_new_123',
        { customer: testCustomerId }
      );

      expect(mockSubscriptionEventCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: testUserId,
          eventType: 'checkout.session.completed',
          stripeEventId: 'evt_new_123',
        }),
      });
    });

    it('should skip duplicate events', async () => {
      mockSubscriptionEventFindUnique.mockResolvedValue({
        id: 'existing-event',
        stripeEventId: 'evt_duplicate_456',
      });

      await logSubscriptionEvent(
        testUserId,
        'checkout.session.completed',
        'evt_duplicate_456',
        { customer: testCustomerId }
      );

      expect(mockSubscriptionEventCreate).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle unknown status gracefully', async () => {
      await updateSubscriptionFromWebhook(
        testCustomerId,
        testSubscriptionId,
        'unknown_status',
        new Date('2025-12-31')
      );

      // Should map to canceled
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          subscriptionStatus: SubscriptionStatus.canceled,
        }),
      });
    });

    it('should handle trialing status', async () => {
      await updateSubscriptionFromWebhook(
        testCustomerId,
        testSubscriptionId,
        'trialing',
        new Date('2025-12-31')
      );

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          subscriptionStatus: SubscriptionStatus.trialing,
          plan: Plan.PRO,
        }),
      });
    });
  });
});
