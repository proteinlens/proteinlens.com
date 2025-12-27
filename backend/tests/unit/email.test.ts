/**
 * Email Service Unit Tests
 * 
 * Feature: 013-self-managed-auth
 * Tests: email.ts, emailTemplates.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmailService, resetEmailService, getEmailService } from '../../src/utils/email';
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  passwordChangedEmailTemplate
} from '../../src/templates/emailTemplates';

// ===========================================
// Mock Azure Communication Services
// ===========================================

vi.mock('@azure/communication-email', () => ({
  EmailClient: vi.fn().mockImplementation(() => ({
    beginSend: vi.fn().mockResolvedValue({
      pollUntilDone: vi.fn().mockResolvedValue({
        status: 'Succeeded',
        id: 'mock-message-id-123'
      })
    })
  })),
  KnownEmailSendStatus: {
    Succeeded: 'Succeeded',
    Failed: 'Failed'
  }
}));

describe('EmailService', () => {
  beforeEach(() => {
    // Reset singleton between tests
    resetEmailService();
    
    // Set up environment for console mode by default
    process.env.EMAIL_SERVICE = 'console';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.ACS_EMAIL_SENDER = 'test@proteinlens.com';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize in console mode when EMAIL_SERVICE is console', () => {
      const service = new EmailService();
      expect(service).toBeDefined();
    });

    it('should initialize in console mode when no connection string', () => {
      delete process.env.ACS_EMAIL_CONNECTION_STRING;
      process.env.EMAIL_SERVICE = 'acs';
      const service = new EmailService();
      expect(service).toBeDefined();
    });

    it('should use default sender address', () => {
      delete process.env.ACS_EMAIL_SENDER;
      const service = new EmailService();
      expect(service).toBeDefined();
    });

    it('should accept config override', () => {
      const service = new EmailService({
        senderAddress: 'custom@test.com',
        frontendUrl: 'https://custom.example.com'
      });
      expect(service).toBeDefined();
    });
  });

  describe('send() - Console Mode', () => {
    it('should log email to console and return success', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const service = new EmailService();
      const result = await service.send({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>HTML content</p>',
        plainText: 'Plain text content'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^console-/);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('sendVerificationEmail()', () => {
    it('should send verification email with correct structure', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const service = new EmailService();
      const result = await service.sendVerificationEmail({
        email: 'user@example.com',
        token: 'test-token-123',
        expiresInHours: 24
      });

      expect(result.success).toBe(true);
      
      // Check that console output includes verification URL
      const logCalls = consoleSpy.mock.calls.flat().join('\n');
      expect(logCalls).toContain('user@example.com');
      expect(logCalls).toContain('Verify your ProteinLens account');
      expect(logCalls).toContain('verify-email');
      expect(logCalls).toContain('test-token-123');
      
      consoleSpy.mockRestore();
    });

    it('should URL-encode token and email in verification URL', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const service = new EmailService();
      await service.sendVerificationEmail({
        email: 'user+test@example.com',
        token: 'token/with/special=chars',
        expiresInHours: 24
      });

      const logCalls = consoleSpy.mock.calls.flat().join('\n');
      expect(logCalls).toContain(encodeURIComponent('token/with/special=chars'));
      expect(logCalls).toContain(encodeURIComponent('user+test@example.com'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('sendPasswordResetEmail()', () => {
    it('should send password reset email with correct structure', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const service = new EmailService();
      const result = await service.sendPasswordResetEmail({
        email: 'user@example.com',
        token: 'reset-token-456',
        expiresInHours: 1
      });

      expect(result.success).toBe(true);
      
      const logCalls = consoleSpy.mock.calls.flat().join('\n');
      expect(logCalls).toContain('Reset your ProteinLens password');
      expect(logCalls).toContain('reset-password');
      expect(logCalls).toContain('reset-token-456');
      expect(logCalls).toContain('1 hour');
      
      consoleSpy.mockRestore();
    });

    it('should use plural "hours" when expiry > 1', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const service = new EmailService();
      await service.sendPasswordResetEmail({
        email: 'user@example.com',
        token: 'token',
        expiresInHours: 2
      });

      const logCalls = consoleSpy.mock.calls.flat().join('\n');
      expect(logCalls).toContain('2 hours');
      
      consoleSpy.mockRestore();
    });
  });

  describe('sendPasswordChangedEmail()', () => {
    it('should send password changed notification', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const service = new EmailService();
      const result = await service.sendPasswordChangedEmail({
        email: 'user@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Chrome'
      });

      expect(result.success).toBe(true);
      
      const logCalls = consoleSpy.mock.calls.flat().join('\n');
      expect(logCalls).toContain('password was changed');
      expect(logCalls).toContain('192.168.1.1');
      expect(logCalls).toContain('Mozilla/5.0 Chrome');
      
      consoleSpy.mockRestore();
    });

    it('should handle missing userAgent', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const service = new EmailService();
      const result = await service.sendPasswordChangedEmail({
        email: 'user@example.com',
        ipAddress: '10.0.0.1'
      });

      expect(result.success).toBe(true);
      
      consoleSpy.mockRestore();
    });
  });

  describe('getEmailService() singleton', () => {
    it('should return same instance', () => {
      const service1 = getEmailService();
      const service2 = getEmailService();
      expect(service1).toBe(service2);
    });

    it('should return new instance after reset', () => {
      const service1 = getEmailService();
      resetEmailService();
      const service2 = getEmailService();
      expect(service1).not.toBe(service2);
    });
  });
});

// ===========================================
// Email Templates Tests
// ===========================================

describe('Email Templates', () => {
  describe('verificationEmailTemplate()', () => {
    it('should return correct subject', () => {
      const template = verificationEmailTemplate('https://example.com/verify', 24);
      expect(template.subject).toBe('Verify your ProteinLens account');
    });

    it('should include verification URL in HTML', () => {
      const url = 'https://example.com/verify?token=abc';
      const template = verificationEmailTemplate(url, 24);
      expect(template.html).toContain(url);
    });

    it('should include verification URL in plain text', () => {
      const url = 'https://example.com/verify?token=abc';
      const template = verificationEmailTemplate(url, 24);
      expect(template.plainText).toContain(url);
    });

    it('should include expiry hours', () => {
      const template = verificationEmailTemplate('https://example.com', 48);
      expect(template.html).toContain('48 hours');
      expect(template.plainText).toContain('48 hours');
    });

    it('should include ProteinLens branding', () => {
      const template = verificationEmailTemplate('https://example.com', 24);
      expect(template.html).toContain('ProteinLens');
      expect(template.plainText).toContain('ProteinLens');
    });
  });

  describe('passwordResetEmailTemplate()', () => {
    it('should return correct subject', () => {
      const template = passwordResetEmailTemplate('https://example.com/reset', 1);
      expect(template.subject).toBe('Reset your ProteinLens password');
    });

    it('should include reset URL', () => {
      const url = 'https://example.com/reset?token=xyz';
      const template = passwordResetEmailTemplate(url, 1);
      expect(template.html).toContain(url);
      expect(template.plainText).toContain(url);
    });

    it('should use singular "hour" for expiresInHours=1', () => {
      const template = passwordResetEmailTemplate('https://example.com', 1);
      expect(template.html).toContain('1 hour.');
      expect(template.plainText).toContain('1 hour.');
    });

    it('should use plural "hours" for expiresInHours>1', () => {
      const template = passwordResetEmailTemplate('https://example.com', 2);
      expect(template.html).toContain('2 hours.');
      expect(template.plainText).toContain('2 hours.');
    });
  });

  describe('passwordChangedEmailTemplate()', () => {
    it('should return correct subject', () => {
      const template = passwordChangedEmailTemplate('192.168.1.1');
      expect(template.subject).toBe('Your ProteinLens password was changed');
    });

    it('should include IP address', () => {
      const template = passwordChangedEmailTemplate('10.0.0.1');
      expect(template.html).toContain('10.0.0.1');
      expect(template.plainText).toContain('10.0.0.1');
    });

    it('should include user agent when provided', () => {
      const template = passwordChangedEmailTemplate('10.0.0.1', 'Safari/537.36');
      expect(template.html).toContain('Safari/537.36');
      expect(template.plainText).toContain('Safari/537.36');
    });

    it('should handle undefined user agent', () => {
      const template = passwordChangedEmailTemplate('10.0.0.1', undefined);
      expect(template.html).not.toContain('undefined');
      expect(template.plainText).not.toContain('undefined');
    });

    it('should include timestamp', () => {
      const template = passwordChangedEmailTemplate('10.0.0.1');
      // Timestamp format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(template.html).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(template.plainText).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
