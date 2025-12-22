// Integration tests for Stripe webhook handling
// Feature: 002-saas-billing, User Story 2
// Tests: mock Stripe events, verify DB updates

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Plan, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  subscriptionEvent: {
    findUnique: vi.fn(),
    create: vi.fn(),
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
}));

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

describe('Webhook Integration Tests', () => {
  const testCustomerId = 'cus_test123';
  const testSubscriptionId = 'sub_test456';
  const testUserId = 'user-uuid-789';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: user exists
    mockPrisma.user.findUnique.mockResolvedValue({
      id: testUserId,
      externalId: 'external-123',
      stripeCustomerId: testCustomerId,
      stripeSubscriptionId: testSubscriptionId,
      plan: Plan.PRO,
      subscriptionStatus: SubscriptionStatus.active,
      currentPeriodEnd: new Date('2025-12-31'),
    });

    mockPrisma.user.update.mockResolvedValue({
      id: testUserId,
      plan: Plan.PRO,
    });

    mockPrisma.subscriptionEvent.findUnique.mockResolvedValue(null);
    mockPrisma.subscriptionEvent.create.mockResolvedValue({});
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

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
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

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
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

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          subscriptionStatus: SubscriptionStatus.canceled,
        }),
      });
    });
  });

  describe('customer.subscription.deleted handling', () => {
    it('should downgrade user to Free', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: testUserId,
        plan: Plan.FREE,
        subscriptionStatus: null,
      });

      await downgradeToFree(testCustomerId);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
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
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await downgradeToFree('non-existent-customer');

      expect(result).toBeNull();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
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

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          subscriptionStatus: SubscriptionStatus.past_due,
        }),
      });
    });
  });

  describe('Event logging (idempotency)', () => {
    it('should create event record for new events', async () => {
      mockPrisma.subscriptionEvent.findUnique.mockResolvedValue(null);

      await logSubscriptionEvent(
        testUserId,
        'checkout.session.completed',
        'evt_new_123',
        { customer: testCustomerId }
      );

      expect(mockPrisma.subscriptionEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: testUserId,
          eventType: 'checkout.session.completed',
          stripeEventId: 'evt_new_123',
        }),
      });
    });

    it('should skip duplicate events', async () => {
      mockPrisma.subscriptionEvent.findUnique.mockResolvedValue({
        id: 'existing-event',
        stripeEventId: 'evt_duplicate_456',
      });

      await logSubscriptionEvent(
        testUserId,
        'checkout.session.completed',
        'evt_duplicate_456',
        { customer: testCustomerId }
      );

      expect(mockPrisma.subscriptionEvent.create).not.toHaveBeenCalled();
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
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
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

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: testUserId },
        data: expect.objectContaining({
          subscriptionStatus: SubscriptionStatus.trialing,
          plan: Plan.PRO,
        }),
      });
    });
  });
});
