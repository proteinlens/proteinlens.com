/**
 * Slack Notifier - Event Notifications
 *
 * Feature: 014-slack-auth-notifications
 * Purpose: Send Slack notifications for auth and billing events
 *
 * Key Design Decisions:
 * - Fire-and-forget: Notification failures never block user operations (FR-006)
 * - 1 retry with 1s delay: Balances reliability with simplicity (FR-010)
 * - Native fetch: No additional dependencies (Node 20+ includes fetch)
 */

// ===========================================
// Types
// ===========================================

export type NotificationEventType = 
  | 'SIGNUP' 
  | 'PASSWORD_RESET' 
  | 'EMAIL_VERIFIED'
  | 'CHECKOUT_COMPLETED'      // User completed checkout (anonymous → pro or free → pro)
  | 'SUBSCRIPTION_UPGRADED'   // User upgraded plan
  | 'SUBSCRIPTION_DOWNGRADED' // User downgraded or cancelled (pro → free)
  | 'PAYMENT_FAILED';         // Payment failed

export interface NotificationOptions {
  eventType: NotificationEventType;
  email: string;
  timestamp?: Date;
  metadata?: Record<string, string>;
  plan?: string;              // For subscription events (e.g., 'PRO', 'FREE')
  previousPlan?: string;      // For upgrade/downgrade events
}

interface SlackBlock {
  type: 'section' | 'divider' | 'context';
  text?: {
    type: 'mrkdwn' | 'plain_text';
    text: string;
  };
  elements?: Array<{
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }>;
}

interface SlackPayload {
  text: string;
  blocks?: SlackBlock[];
}

// ===========================================
// Event Configuration
// ===========================================

const EVENT_CONFIG: Record<NotificationEventType, { emoji: string; title: string }> = {
  // Auth events
  SIGNUP: { emoji: '🎉', title: 'New Signup' },
  PASSWORD_RESET: { emoji: '🔐', title: 'Password Reset Requested' },
  EMAIL_VERIFIED: { emoji: '✅', title: 'Email Verified' },
  // Billing events
  CHECKOUT_COMPLETED: { emoji: '💳', title: 'Checkout Completed' },
  SUBSCRIPTION_UPGRADED: { emoji: '⬆️', title: 'Subscription Upgraded' },
  SUBSCRIPTION_DOWNGRADED: { emoji: '⬇️', title: 'Subscription Downgraded' },
  PAYMENT_FAILED: { emoji: '⚠️', title: 'Payment Failed' },
};

// ===========================================
// SlackNotifier Class
// ===========================================

export class SlackNotifier {
  private webhookUrl: string | null;
  private readonly TIMEOUT_MS = 10000; // 10 second timeout
  private readonly RETRY_DELAY_MS = 1000; // 1 second retry delay

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL || null;

    if (!this.webhookUrl) {
      console.log('[SlackNotifier] No webhook URL configured - notifications disabled');
    }
  }

  /**
   * Send a notification to Slack (fire-and-forget)
   * Never throws - logs errors and continues
   */
  async notify(options: NotificationOptions): Promise<void> {
    if (!this.webhookUrl) {
      return; // Silently skip if not configured
    }

    const payload = this.formatMessage(options);

    // Fire-and-forget: don't await, don't block
    this.sendWithRetry(payload).catch((error) => {
      // This should never happen since sendWithRetry catches all errors
      console.error('[SlackNotifier] Unexpected error in notify:', error);
    });
  }

  /**
   * Format notification message with Block Kit
   */
  private formatMessage(options: NotificationOptions): SlackPayload {
    const { eventType, email, timestamp = new Date(), plan, previousPlan } = options;
    const config = EVENT_CONFIG[eventType];

    const text = `${config.emoji} ${config.title}: ${email}`;
    const timestampStr = timestamp.toISOString();

    // Build plan info for billing events
    let planInfo = '';
    if (plan && previousPlan) {
      planInfo = `\n📊 ${previousPlan} → ${plan}`;
    } else if (plan) {
      planInfo = `\n📊 Plan: ${plan}`;
    }

    return {
      text, // Fallback for notifications/accessibility
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${config.emoji} *${config.title}*\n\`${email}\`${planInfo}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `📅 ${timestampStr}`,
            },
          ],
        },
      ],
    };
  }

  /**
   * Send to Slack with 1 retry on failure
   * Returns true if successful, false otherwise
   */
  private async sendWithRetry(payload: SlackPayload): Promise<boolean> {
    const success = await this.sendOnce(payload);
    if (success) {
      return true;
    }

    // Retry once after delay
    console.log('[SlackNotifier] First attempt failed, retrying in 1s...');
    await this.delay(this.RETRY_DELAY_MS);

    const retrySuccess = await this.sendOnce(payload);
    if (!retrySuccess) {
      console.error('[SlackNotifier] Notification failed after retry:', payload.text);
    }
    return retrySuccess;
  }

  /**
   * Single send attempt with timeout
   */
  private async sendOnce(payload: SlackPayload): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('[SlackNotifier] Notification sent:', payload.text);
        return true;
      }

      const errorText = await response.text();
      console.error(`[SlackNotifier] HTTP ${response.status}: ${errorText}`);
      return false;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[SlackNotifier] Request timed out');
      } else {
        console.error('[SlackNotifier] Send error:', error);
      }
      return false;
    }
  }

  /**
   * Utility: Promise-based delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ===========================================
// Singleton Export
// ===========================================

export const slackNotifier = new SlackNotifier();
