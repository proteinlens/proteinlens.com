/**
 * Email Service - Azure Communication Services Integration
 * 
 * Feature: 013-self-managed-auth
 * Purpose: Send transactional emails for authentication flows
 * 
 * Emails supported:
 * - Email verification (FR-005)
 * - Resend verification (FR-007)
 * - Password reset request (FR-015)
 * - Password changed notification (FR-018)
 */

import { EmailClient, EmailMessage, KnownEmailSendStatus } from '@azure/communication-email';
import { slackNotifier } from './slack.js';

// ===========================================
// Types
// ===========================================

export interface EmailConfig {
  connectionString: string;
  senderAddress: string;
  frontendUrl: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  plainText: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Template data types
export interface VerificationEmailData {
  email: string;
  token: string;
  expiresInHours: number;
}

export interface PasswordResetEmailData {
  email: string;
  token: string;
  expiresInHours: number;
}

export interface PasswordChangedEmailData {
  email: string;
  ipAddress: string;
  userAgent?: string;
}

// ===========================================
// Email Service Class
// ===========================================

export class EmailService {
  private client: EmailClient | null = null;
  private senderAddress: string;
  private senderDisplayName: string;
  private frontendUrl: string;
  private mode: 'acs' | 'console';

  constructor(config?: Partial<EmailConfig>) {
    const connectionString = config?.connectionString || process.env.ACS_EMAIL_CONNECTION_STRING;
    this.senderAddress = config?.senderAddress || process.env.ACS_EMAIL_SENDER || 'noreply@proteinlens.com';
    this.senderDisplayName = process.env.ACS_EMAIL_SENDER_NAME || 'ProteinLens';
    this.frontendUrl = config?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Determine mode based on EMAIL_SERVICE env var or connection string availability
    const emailService = process.env.EMAIL_SERVICE || 'acs';
    
    if (emailService === 'console' || !connectionString) {
      this.mode = 'console';
      console.log('[EmailService] Running in console mode - emails will be logged to console');
    } else {
      this.mode = 'acs';
      this.client = new EmailClient(connectionString);
    }
  }

  /**
   * Send an email using Azure Communication Services
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    const { to, subject, html, plainText } = options;

    if (this.mode === 'console') {
      return this.sendConsole(options);
    }

    if (!this.client) {
      return { success: false, error: 'Email client not initialized' };
    }

    try {
      const message: EmailMessage = {
        senderAddress: this.senderAddress,
        // Add headers for better deliverability
        headers: {
          // Using display name helps with spam filtering
          'X-Sender-Display-Name': this.senderDisplayName
        },
        recipients: {
          to: [{ address: to, displayName: to.split('@')[0] }]
        },
        content: {
          subject,
          html,
          plainText
        },
        // Set reply-to for better engagement
        replyTo: [{ address: this.senderAddress, displayName: this.senderDisplayName }]
      };

      // Begin send and poll for completion
      const poller = await this.client.beginSend(message);
      const result = await poller.pollUntilDone();

      if (result.status === KnownEmailSendStatus.Succeeded) {
        return { success: true, messageId: result.id };
      } else {
        return { 
          success: false, 
          error: `Email send failed with status: ${result.status}`,
          messageId: result.id
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] Send error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Console mode - log email to console (for development)
   */
  private sendConsole(options: SendEmailOptions): EmailResult {
    console.log('\n========== EMAIL (Console Mode) ==========');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('--- Plain Text ---');
    console.log(options.plainText);
    console.log('==========================================\n');
    return { success: true, messageId: `console-${Date.now()}` };
  }

  // ===========================================
  // Email Templates
  // ===========================================

  /**
   * Send email verification email (FR-005)
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<EmailResult> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(data.email)}`;
    
    const subject = 'Verify your ProteinLens account';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ProteinLens</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Welcome! Please verify your email</h2>
    <p>Thanks for signing up for ProteinLens. To complete your registration, please verify your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
    </div>
    <p style="color: #666; font-size: 14px;">This link will expire in ${data.expiresInHours} hours.</p>
    <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color: #667eea; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
  </div>
</body>
</html>`;

    const plainText = `
Welcome to ProteinLens!

Please verify your email address by visiting the following link:

${verifyUrl}

This link will expire in ${data.expiresInHours} hours.

If you didn't create an account, you can safely ignore this email.

---
ProteinLens - AI-Powered Meal Analysis
`;

    const result = await this.send({ to: data.email, subject, html, plainText });
    
    // Feature 014: Send Slack notification on successful verification email send
    if (result.success) {
      slackNotifier.notify({ eventType: 'SIGNUP', email: data.email });
    }
    
    return result;
  }

  /**
   * Send password reset email (FR-015)
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<EmailResult> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(data.email)}`;
    
    const subject = 'Reset your ProteinLens password';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ProteinLens</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Reset your password</h2>
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
    </div>
    <p style="color: #666; font-size: 14px;"><strong>This link will expire in ${data.expiresInHours} hour${data.expiresInHours !== 1 ? 's' : ''}.</strong></p>
    <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color: #667eea; font-size: 12px; word-break: break-all;">${resetUrl}</p>
  </div>
</body>
</html>`;

    const plainText = `
Reset your ProteinLens password

We received a request to reset your password. Click the link below to choose a new password:

${resetUrl}

This link will expire in ${data.expiresInHours} hour${data.expiresInHours !== 1 ? 's' : ''}.

If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.

---
ProteinLens - AI-Powered Meal Analysis
`;

    const result = await this.send({ to: data.email, subject, html, plainText });
    
    // Feature 014: Send Slack notification on successful password reset email send
    if (result.success) {
      slackNotifier.notify({ eventType: 'PASSWORD_RESET', email: data.email });
    }
    
    return result;
  }

  /**
   * Send password changed notification (FR-018)
   */
  async sendPasswordChangedEmail(data: PasswordChangedEmailData): Promise<EmailResult> {
    const subject = 'Your ProteinLens password was changed';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password changed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ProteinLens</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Your password was changed</h2>
    <p>This is a confirmation that your ProteinLens account password was successfully changed.</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Details:</strong></p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">IP Address: ${data.ipAddress}</p>
      ${data.userAgent ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Device: ${data.userAgent}</p>` : ''}
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Time: ${new Date().toISOString()}</p>
    </div>
    <p style="color: #666; font-size: 14px;"><strong>If you did not make this change</strong>, please contact support immediately and consider resetting your password.</p>
  </div>
</body>
</html>`;

    const plainText = `
Your ProteinLens password was changed

This is a confirmation that your ProteinLens account password was successfully changed.

Details:
- IP Address: ${data.ipAddress}
${data.userAgent ? `- Device: ${data.userAgent}` : ''}
- Time: ${new Date().toISOString()}

If you did not make this change, please contact support immediately and consider resetting your password.

---
ProteinLens - AI-Powered Meal Analysis
`;

    return this.send({ to: data.email, subject, html, plainText });
  }
}

// ===========================================
// Singleton instance
// ===========================================

let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

// For testing - allows injecting a mock
export function resetEmailService(): void {
  emailServiceInstance = null;
}
