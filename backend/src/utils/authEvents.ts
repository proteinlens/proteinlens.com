/**
 * Auth Event Logging Service
 * 
 * Feature: 013-self-managed-auth (FR-031)
 * Purpose: Audit logging for all authentication events
 * 
 * Events logged:
 * - SIGNUP_SUCCESS, SIGNUP_FAILED
 * - SIGNIN_SUCCESS, SIGNIN_FAILED
 * - SIGNOUT
 * - EMAIL_VERIFIED
 * - PASSWORD_RESET_REQUESTED, PASSWORD_RESET_SUCCESS
 * - SESSION_REVOKED
 * - PASSWORD_CHANGED
 */

import { PrismaClient, AuthEventType, Prisma } from '@prisma/client';

// ===========================================
// Types
// ===========================================

export interface AuthEventData {
  userId?: string | null;
  email: string;
  eventType: AuthEventType;
  ipAddress: string;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}

export interface RequestContext {
  ipAddress: string;
  userAgent?: string;
}

// ===========================================
// Auth Event Service
// ===========================================

export class AuthEventService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Log an authentication event
   */
  async log(data: AuthEventData): Promise<void> {
    try {
      await this.prisma.authEvent.create({
        data: {
          userId: data.userId,
          email: data.email.toLowerCase(),
          eventType: data.eventType,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata ?? undefined,
        },
      });
    } catch (error) {
      // Log to console but don't throw - audit logging should not break auth flows
      console.error('[AuthEventService] Failed to log event:', error);
    }
  }

  // ===========================================
  // Convenience Methods
  // ===========================================

  /**
   * Log successful signup
   */
  async logSignupSuccess(
    userId: string,
    email: string,
    context: RequestContext
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'SIGNUP_SUCCESS',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log failed signup attempt
   */
  async logSignupFailed(
    email: string,
    reason: string,
    context: RequestContext
  ): Promise<void> {
    await this.log({
      email,
      eventType: 'SIGNUP_FAILED',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { reason },
    });
  }

  /**
   * Log successful signin
   */
  async logSigninSuccess(
    userId: string,
    email: string,
    context: RequestContext
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'SIGNIN_SUCCESS',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log failed signin attempt
   */
  async logSigninFailed(
    email: string,
    reason: string,
    context: RequestContext,
    userId?: string
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'SIGNIN_FAILED',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { reason },
    });
  }

  /**
   * Log user signout
   */
  async logSignout(
    userId: string,
    email: string,
    context: RequestContext
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'SIGNOUT',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log email verification
   */
  async logEmailVerified(
    userId: string,
    email: string,
    context: RequestContext
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'EMAIL_VERIFIED',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log password reset request
   */
  async logPasswordResetRequested(
    email: string,
    context: RequestContext,
    userId?: string
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'PASSWORD_RESET_REQUESTED',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log successful password reset
   */
  async logPasswordResetSuccess(
    userId: string,
    email: string,
    context: RequestContext
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'PASSWORD_RESET_SUCCESS',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log session revocation
   */
  async logSessionRevoked(
    userId: string,
    email: string,
    context: RequestContext,
    sessionId?: string
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'SESSION_REVOKED',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: sessionId ? { revokedSessionId: sessionId } : undefined,
    });
  }

  /**
   * Log password change
   */
  async logPasswordChanged(
    userId: string,
    email: string,
    context: RequestContext
  ): Promise<void> {
    await this.log({
      userId,
      email,
      eventType: 'PASSWORD_CHANGED',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  // ===========================================
  // Query Methods (for admin dashboard)
  // ===========================================

  /**
   * Get recent auth events for a user
   */
  async getEventsForUser(
    userId: string,
    limit: number = 50
  ): Promise<Array<{
    id: string;
    eventType: AuthEventType;
    ipAddress: string;
    userAgent: string | null;
    createdAt: Date;
  }>> {
    return this.prisma.authEvent.findMany({
      where: { userId },
      select: {
        id: true,
        eventType: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get failed signin attempts for an email (for rate limiting/security)
   */
  async getFailedSigninCount(
    email: string,
    sinceMinutes: number = 15
  ): Promise<number> {
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000);
    return this.prisma.authEvent.count({
      where: {
        email: email.toLowerCase(),
        eventType: 'SIGNIN_FAILED',
        createdAt: { gte: since },
      },
    });
  }
}

// ===========================================
// Singleton Factory
// ===========================================

let authEventServiceInstance: AuthEventService | null = null;

export function getAuthEventService(prisma: PrismaClient): AuthEventService {
  if (!authEventServiceInstance) {
    authEventServiceInstance = new AuthEventService(prisma);
  }
  return authEventServiceInstance;
}

// For testing - allows reset
export function resetAuthEventService(): void {
  authEventServiceInstance = null;
}
