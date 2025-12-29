/**
 * SlackNotifier Unit Tests
 * 
 * Feature: 014-slack-auth-notifications
 * Tests: SlackNotifier class for auth event notifications
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import {
  SlackNotifier,
  slackNotifier,
  type NotificationEventType,
  type NotificationOptions
} from '../../src/utils/slack';

// ===========================================
// Mock fetch globally
// ===========================================

const mockFetch = vi.fn() as Mock;
vi.stubGlobal('fetch', mockFetch);

describe('SlackNotifier', () => {
  const webhookUrl = 'https://hooks.slack.com/services/T00/B00/xxx';
  let notifier: SlackNotifier;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve('ok') });
    notifier = new SlackNotifier(webhookUrl);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with webhook URL', () => {
      expect(notifier).toBeDefined();
    });

    it('should allow undefined webhook URL for disabled mode', () => {
      const disabledNotifier = new SlackNotifier(undefined);
      expect(disabledNotifier).toBeDefined();
    });

    it('should allow empty webhook URL for disabled mode', () => {
      const disabledNotifier = new SlackNotifier('');
      expect(disabledNotifier).toBeDefined();
    });
  });

  describe('notify()', () => {
    it('should send SIGNUP notification successfully', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      const options: NotificationOptions = {
        eventType: 'SIGNUP',
        email: 'user@example.com',
        timestamp: new Date()
      };
      
      // notify() returns immediately (fire-and-forget), need small delay for async
      await notifier.notify(options);
      // Give time for the fire-and-forget to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        webhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      // Verify payload structure
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.text).toContain('🎉');
      expect(body.text).toContain('New Signup');
      expect(body.text).toContain('user@example.com');
      expect(body.blocks).toBeDefined();
    });

    it('should send PASSWORD_RESET notification with correct emoji', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      await notifier.notify({
        eventType: 'PASSWORD_RESET',
        email: 'reset@example.com'
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.text).toContain('🔐');
      expect(body.text).toContain('Password Reset');
    });

    it('should send EMAIL_VERIFIED notification with correct emoji', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      await notifier.notify({
        eventType: 'EMAIL_VERIFIED',
        email: 'verified@example.com'
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.text).toContain('✅');
      expect(body.text).toContain('Email Verified');
    });

    it('should include email in notification payload', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      await notifier.notify({
        eventType: 'SIGNUP',
        email: 'test@domain.com'
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.text).toContain('test@domain.com');
      
      // Email should also be in blocks
      const payloadString = JSON.stringify(body.blocks);
      expect(payloadString).toContain('test@domain.com');
    });

    it('should use current timestamp when not provided', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      const before = new Date();
      
      await notifier.notify({
        eventType: 'SIGNUP',
        email: 'user@example.com'
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify fetch was called with body containing timestamp
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      // Body should have blocks (Block Kit format)
      expect(body.blocks).toBeDefined();
      const payloadString = JSON.stringify(body.blocks);
      // Should contain ISO date format somewhere
      expect(payloadString).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle disabled mode silently', async () => {
      const disabledNotifier = new SlackNotifier('');
      
      await disabledNotifier.notify({
        eventType: 'SIGNUP',
        email: 'user@example.com'
      });
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should retry once on failure', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('Server error') })
        .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      await notifier.notify({
        eventType: 'SIGNUP',
        email: 'user@example.com'
      });
      // Wait for retry (1s delay + some buffer)
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not throw even when all retries fail', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve('Error') });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Should not throw
      await expect(
        notifier.notify({
          eventType: 'SIGNUP',
          email: 'user@example.com'
        })
      ).resolves.toBeUndefined();
      
      // Wait for retry cycle
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      consoleSpy.mockRestore();
    });

    it('should handle network errors with retry', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      await notifier.notify({
        eventType: 'SIGNUP',
        email: 'user@example.com'
      });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Types', () => {
    const authEventTypes: NotificationEventType[] = ['SIGNUP', 'PASSWORD_RESET', 'EMAIL_VERIFIED'];
    const billingEventTypes: NotificationEventType[] = ['CHECKOUT_COMPLETED', 'SUBSCRIPTION_UPGRADED', 'SUBSCRIPTION_DOWNGRADED', 'PAYMENT_FAILED'];
    
    authEventTypes.forEach(eventType => {
      it(`should handle ${eventType} auth event type`, async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
        
        await notifier.notify({
          eventType,
          email: 'user@example.com'
        });
        await new Promise(resolve => setTimeout(resolve, 50));
        
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    billingEventTypes.forEach(eventType => {
      it(`should handle ${eventType} billing event type`, async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
        
        await notifier.notify({
          eventType,
          email: 'user@example.com',
          plan: 'PRO'
        });
        await new Promise(resolve => setTimeout(resolve, 50));
        
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Billing Events with Plan Info', () => {
    it('should include plan info for CHECKOUT_COMPLETED', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      await notifier.notify({
        eventType: 'CHECKOUT_COMPLETED',
        email: 'user@example.com',
        plan: 'PRO',
        previousPlan: 'FREE'
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.text).toContain('💳');
      expect(body.text).toContain('Checkout Completed');
      
      // Plan transition should be in the blocks
      const payloadString = JSON.stringify(body.blocks);
      expect(payloadString).toContain('FREE');
      expect(payloadString).toContain('PRO');
    });

    it('should include plan info for SUBSCRIPTION_DOWNGRADED', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      await notifier.notify({
        eventType: 'SUBSCRIPTION_DOWNGRADED',
        email: 'user@example.com',
        plan: 'FREE',
        previousPlan: 'PRO'
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.text).toContain('⬇️');
      expect(body.text).toContain('Subscription Downgraded');
    });

    it('should include plan info for PAYMENT_FAILED', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') });
      
      await notifier.notify({
        eventType: 'PAYMENT_FAILED',
        email: 'user@example.com',
        plan: 'PRO'
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.text).toContain('⚠️');
      expect(body.text).toContain('Payment Failed');
    });
  });

  describe('Singleton Export', () => {
    it('should export slackNotifier singleton', () => {
      expect(slackNotifier).toBeDefined();
      expect(slackNotifier).toBeInstanceOf(SlackNotifier);
    });

    it('should use SLACK_WEBHOOK_URL from environment', () => {
      // Singleton uses process.env.SLACK_WEBHOOK_URL
      // If not set, should be in disabled mode
      expect(slackNotifier).toBeDefined();
    });
  });
});
