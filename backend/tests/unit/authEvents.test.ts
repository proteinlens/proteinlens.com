/**
 * Auth Event Service Unit Tests
 * 
 * Feature: 013-self-managed-auth (FR-031)
 * Tests: authEvents.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthEventService, resetAuthEventService } from '../../src/utils/authEvents';
import { PrismaClient, AuthEventType } from '@prisma/client';

// ===========================================
// Mock Prisma Client
// ===========================================

const mockCreate = vi.fn().mockResolvedValue({ id: 'mock-event-id' });
const mockFindMany = vi.fn().mockResolvedValue([]);
const mockCount = vi.fn().mockResolvedValue(0);

const mockPrisma = {
  authEvent: {
    create: mockCreate,
    findMany: mockFindMany,
    count: mockCount,
  },
} as unknown as PrismaClient;

describe('AuthEventService', () => {
  let service: AuthEventService;

  beforeEach(() => {
    resetAuthEventService();
    vi.clearAllMocks();
    service = new AuthEventService(mockPrisma);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log()', () => {
    it('should create auth event with all fields', async () => {
      await service.log({
        userId: 'user-123',
        email: 'Test@Example.com',
        eventType: 'SIGNIN_SUCCESS',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: { extra: 'data' },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          email: 'test@example.com', // lowercase
          eventType: 'SIGNIN_SUCCESS',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          metadata: { extra: 'data' },
        },
      });
    });

    it('should handle null userId', async () => {
      await service.log({
        userId: null,
        email: 'unknown@example.com',
        eventType: 'SIGNIN_FAILED',
        ipAddress: '10.0.0.1',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: null,
          email: 'unknown@example.com',
        }),
      });
    });

    it('should handle undefined metadata', async () => {
      await service.log({
        email: 'test@example.com',
        eventType: 'SIGNOUT',
        ipAddress: '127.0.0.1',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: undefined,
        }),
      });
    });

    it('should not throw on database error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockCreate.mockRejectedValueOnce(new Error('Database error'));

      // Should not throw
      await expect(
        service.log({
          email: 'test@example.com',
          eventType: 'SIGNUP_SUCCESS',
          ipAddress: '192.168.1.1',
        })
      ).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Convenience Methods', () => {
    const context = { ipAddress: '192.168.1.100', userAgent: 'TestBrowser/1.0' };

    describe('logSignupSuccess()', () => {
      it('should log SIGNUP_SUCCESS event', async () => {
        await service.logSignupSuccess('user-123', 'new@example.com', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 'user-123',
            email: 'new@example.com',
            eventType: 'SIGNUP_SUCCESS',
            ipAddress: '192.168.1.100',
            userAgent: 'TestBrowser/1.0',
          }),
        });
      });
    });

    describe('logSignupFailed()', () => {
      it('should log SIGNUP_FAILED event with reason', async () => {
        await service.logSignupFailed('duplicate@example.com', 'Email already exists', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            email: 'duplicate@example.com',
            eventType: 'SIGNUP_FAILED',
            metadata: { reason: 'Email already exists' },
          }),
        });
      });
    });

    describe('logSigninSuccess()', () => {
      it('should log SIGNIN_SUCCESS event', async () => {
        await service.logSigninSuccess('user-456', 'active@example.com', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 'user-456',
            eventType: 'SIGNIN_SUCCESS',
          }),
        });
      });
    });

    describe('logSigninFailed()', () => {
      it('should log SIGNIN_FAILED event with reason', async () => {
        await service.logSigninFailed('wrong@example.com', 'Invalid password', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            eventType: 'SIGNIN_FAILED',
            metadata: { reason: 'Invalid password' },
          }),
        });
      });

      it('should include userId when known', async () => {
        await service.logSigninFailed('known@example.com', 'Invalid password', context, 'user-789');

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 'user-789',
            eventType: 'SIGNIN_FAILED',
          }),
        });
      });
    });

    describe('logSignout()', () => {
      it('should log SIGNOUT event', async () => {
        await service.logSignout('user-123', 'user@example.com', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            eventType: 'SIGNOUT',
          }),
        });
      });
    });

    describe('logEmailVerified()', () => {
      it('should log EMAIL_VERIFIED event', async () => {
        await service.logEmailVerified('user-123', 'verified@example.com', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            eventType: 'EMAIL_VERIFIED',
          }),
        });
      });
    });

    describe('logPasswordResetRequested()', () => {
      it('should log PASSWORD_RESET_REQUESTED event', async () => {
        await service.logPasswordResetRequested('forgot@example.com', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            eventType: 'PASSWORD_RESET_REQUESTED',
            userId: undefined,
          }),
        });
      });

      it('should include userId when provided', async () => {
        await service.logPasswordResetRequested('known@example.com', context, 'user-555');

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 'user-555',
          }),
        });
      });
    });

    describe('logPasswordResetSuccess()', () => {
      it('should log PASSWORD_RESET_SUCCESS event', async () => {
        await service.logPasswordResetSuccess('user-123', 'reset@example.com', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            eventType: 'PASSWORD_RESET_SUCCESS',
          }),
        });
      });
    });

    describe('logSessionRevoked()', () => {
      it('should log SESSION_REVOKED event', async () => {
        await service.logSessionRevoked('user-123', 'user@example.com', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            eventType: 'SESSION_REVOKED',
            metadata: undefined,
          }),
        });
      });

      it('should include session ID in metadata when provided', async () => {
        await service.logSessionRevoked('user-123', 'user@example.com', context, 'session-abc');

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            eventType: 'SESSION_REVOKED',
            metadata: { revokedSessionId: 'session-abc' },
          }),
        });
      });
    });

    describe('logPasswordChanged()', () => {
      it('should log PASSWORD_CHANGED event', async () => {
        await service.logPasswordChanged('user-123', 'user@example.com', context);

        expect(mockCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            eventType: 'PASSWORD_CHANGED',
          }),
        });
      });
    });
  });

  describe('Query Methods', () => {
    describe('getEventsForUser()', () => {
      it('should query events for user with default limit', async () => {
        mockFindMany.mockResolvedValueOnce([
          { id: 'event-1', eventType: 'SIGNIN_SUCCESS', ipAddress: '1.1.1.1', userAgent: 'Chrome', createdAt: new Date() },
        ]);

        const events = await service.getEventsForUser('user-123');

        expect(mockFindMany).toHaveBeenCalledWith({
          where: { userId: 'user-123' },
          select: {
            id: true,
            eventType: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
        expect(events).toHaveLength(1);
      });

      it('should respect custom limit', async () => {
        await service.getEventsForUser('user-123', 10);

        expect(mockFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 10,
          })
        );
      });
    });

    describe('getFailedSigninCount()', () => {
      it('should count failed signin attempts within time window', async () => {
        mockCount.mockResolvedValueOnce(3);

        const count = await service.getFailedSigninCount('test@example.com', 30);

        expect(mockCount).toHaveBeenCalledWith({
          where: {
            email: 'test@example.com',
            eventType: 'SIGNIN_FAILED',
            createdAt: { gte: expect.any(Date) },
          },
        });
        expect(count).toBe(3);
      });

      it('should default to 15 minute window', async () => {
        const beforeCall = new Date();
        await service.getFailedSigninCount('test@example.com');
        
        const calledWith = mockCount.mock.calls[0][0];
        const since = calledWith.where.createdAt.gte as Date;
        
        // Should be approximately 15 minutes ago
        const expectedTime = new Date(beforeCall.getTime() - 15 * 60 * 1000);
        expect(Math.abs(since.getTime() - expectedTime.getTime())).toBeLessThan(1000);
      });

      it('should lowercase email for query', async () => {
        await service.getFailedSigninCount('TEST@EXAMPLE.COM');

        expect(mockCount).toHaveBeenCalledWith({
          where: expect.objectContaining({
            email: 'test@example.com',
          }),
        });
      });
    });
  });
});
