// Admin service - business logic for admin operations
// Feature: 012-admin-dashboard
// T015: Admin service foundation with audit logging helper

import { getPrismaClient } from '../utils/prisma.js';
import { AdminContext, logAdminAction } from '../middleware/adminMiddleware.js';
import { AdminActionType, Plan, Prisma } from '@prisma/client';
import type {
  ListUsersQuery,
  UserListResponse,
  UserDetailResponse,
  PlanOverrideRequest,
  PlanOverrideResponse,
  SuspendUserRequest,
  SuspendUserResponse,
  ReactivateUserResponse,
  MetricsResponse,
  AuditLogQuery,
  AuditLogResponse,
} from '../models/adminSchemas.js';

const prisma = getPrismaClient();

// ===========================================
// User Management
// ===========================================

/**
 * T020: List users with pagination and filtering
 */
export async function listUsers(
  query: ListUsersQuery,
  adminContext: AdminContext
): Promise<UserListResponse> {
  const { page, limit, search, plan, status, suspended, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.UserWhereInput = {};
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (plan) {
    where.plan = plan;
  }
  
  if (status) {
    where.subscriptionStatus = status;
  }
  
  if (suspended !== undefined) {
    where.suspended = suspended;
  }

  // Build orderBy
  const orderBy: Prisma.UserOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  // Execute queries
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        externalId: true,
        email: true,
        firstName: true,
        lastName: true,
        plan: true,
        subscriptionStatus: true,
        suspended: true,
        createdAt: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Log admin action
  await logAdminAction(adminContext, 'VIEW_USER_LIST', {
    details: { page, limit, search, plan, status, suspended, resultCount: users.length },
  });

  return {
    users: users.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * T028: Get user detail including suspension status
 */
export async function getUserDetail(
  userId: string,
  adminContext: AdminContext
): Promise<UserDetailResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptionEvents: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          eventType: true,
          createdAt: true,
        },
      },
      usage: {
        select: { id: true, createdAt: true },
      },
    },
  });

  if (!user) return null;

  // Calculate usage stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthUsage = user.usage.filter(u => u.createdAt >= startOfMonth).length;

  // Log admin action
  await logAdminAction(adminContext, 'VIEW_USER_DETAIL', {
    targetUserId: user.externalId,
    targetEmail: user.email || undefined,
  });

  return {
    id: user.id,
    externalId: user.externalId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    organizationName: user.organizationName,
    phone: user.phone,
    emailVerified: user.emailVerified,
    profileCompleted: user.profileCompleted,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    currentPeriodEnd: user.currentPeriodEnd?.toISOString() || null,
    suspended: user.suspended,
    suspendedAt: user.suspendedAt?.toISOString() || null,
    suspendedReason: user.suspendedReason,
    suspendedBy: user.suspendedBy,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    usage: {
      totalAnalyses: user.usage.length,
      thisMonth: thisMonthUsage,
    },
    subscriptionEvents: user.subscriptionEvents.map(e => ({
      id: e.id,
      eventType: e.eventType,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

// ===========================================
// Plan Override
// ===========================================

/**
 * T056: Override user's subscription plan
 */
export async function overrideUserPlan(
  userId: string,
  data: PlanOverrideRequest,
  adminContext: AdminContext
): Promise<PlanOverrideResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, externalId: true, email: true, plan: true },
  });

  if (!user) return null;

  const previousPlan = user.plan;

  // Update user plan
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { plan: data.plan },
    select: { id: true, email: true, plan: true },
  });

  // Log admin action
  const auditLogId = await logAdminAction(adminContext, 'PLAN_OVERRIDE', {
    targetUserId: user.externalId,
    targetEmail: user.email || undefined,
    details: { previousPlan, newPlan: data.plan },
    reason: data.reason,
  });

  return {
    success: true,
    user: updatedUser,
    previousPlan,
    auditLogId,
  };
}

// ===========================================
// Account Suspension
// ===========================================

/**
 * T063: Suspend user account
 */
export async function suspendUser(
  userId: string,
  data: SuspendUserRequest,
  adminContext: AdminContext
): Promise<SuspendUserResponse | { error: string; code: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, externalId: true, email: true, suspended: true },
  });

  if (!user) {
    return { error: 'User not found', code: 404 };
  }

  if (user.suspended) {
    return { error: 'User is already suspended', code: 400 };
  }

  // T064: Prevent self-suspension
  if (user.email?.toLowerCase() === adminContext.adminEmail.toLowerCase()) {
    return { error: 'Cannot suspend your own account', code: 400 };
  }

  const now = new Date();
  
  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      suspended: true,
      suspendedAt: now,
      suspendedReason: data.reason,
      suspendedBy: adminContext.adminEmail,
    },
    select: {
      id: true,
      email: true,
      suspended: true,
      suspendedAt: true,
      suspendedReason: true,
      suspendedBy: true,
    },
  });

  // Log admin action
  const auditLogId = await logAdminAction(adminContext, 'SUSPEND_USER', {
    targetUserId: user.externalId,
    targetEmail: user.email || undefined,
    reason: data.reason,
  });

  return {
    success: true,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      suspended: updatedUser.suspended,
      suspendedAt: updatedUser.suspendedAt!.toISOString(),
      suspendedReason: updatedUser.suspendedReason!,
      suspendedBy: updatedUser.suspendedBy!,
    },
    auditLogId,
  };
}

/**
 * T063: Reactivate suspended user account
 */
export async function reactivateUser(
  userId: string,
  adminContext: AdminContext
): Promise<ReactivateUserResponse | { error: string; code: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, externalId: true, email: true, suspended: true },
  });

  if (!user) {
    return { error: 'User not found', code: 404 };
  }

  if (!user.suspended) {
    return { error: 'User is not suspended', code: 400 };
  }

  // Update user - clear suspension fields
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      suspended: false,
      suspendedAt: null,
      suspendedReason: null,
      suspendedBy: null,
    },
    select: { id: true, email: true, suspended: true },
  });

  // Log admin action
  const auditLogId = await logAdminAction(adminContext, 'REACTIVATE_USER', {
    targetUserId: user.externalId,
    targetEmail: user.email || undefined,
  });

  return {
    success: true,
    user: updatedUser,
    auditLogId,
  };
}

// ===========================================
// Platform Metrics
// ===========================================

/**
 * T038: Get platform metrics
 */
export async function getMetrics(adminContext: AdminContext): Promise<MetricsResponse> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Execute all queries in parallel
  const [
    totalUsers,
    suspendedUsers,
    newUsersThisMonth,
    planCounts,
    statusCounts,
    totalUsage,
    usageThisMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { suspended: true } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.groupBy({
      by: ['plan'],
      _count: { plan: true },
    }),
    prisma.user.groupBy({
      by: ['subscriptionStatus'],
      _count: { subscriptionStatus: true },
    }),
    prisma.usage.count(),
    prisma.usage.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  // Transform plan counts
  const planMap = planCounts.reduce((acc, p) => {
    acc[p.plan] = p._count.plan;
    return acc;
  }, {} as Record<string, number>);

  // Transform status counts
  const statusMap = statusCounts.reduce((acc, s) => {
    if (s.subscriptionStatus) {
      acc[s.subscriptionStatus] = s._count.subscriptionStatus;
    }
    return acc;
  }, {} as Record<string, number>);

  // Log admin action (no target user for metrics)
  await logAdminAction(adminContext, 'VIEW_USER_LIST', {
    details: { action: 'view_metrics' },
  });

  return {
    users: {
      total: totalUsers,
      active: totalUsers - suspendedUsers,
      suspended: suspendedUsers,
      newThisMonth: newUsersThisMonth,
    },
    subscriptions: {
      free: planMap['FREE'] || 0,
      pro: planMap['PRO'] || 0,
      trialing: statusMap['trialing'] || 0,
      pastDue: statusMap['past_due'] || 0,
      canceled: statusMap['canceled'] || 0,
    },
    usage: {
      totalAnalyses: totalUsage,
      analysesThisMonth: usageThisMonth,
      averagePerUser: totalUsers > 0 ? Math.round(totalUsage / totalUsers) : 0,
    },
  };
}

// ===========================================
// Audit Log
// ===========================================

/**
 * T071: Get audit log with filters
 */
export async function getAuditLog(
  query: AuditLogQuery,
  adminContext: AdminContext
): Promise<AuditLogResponse> {
  const { page, limit, adminEmail, action, targetUserId, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.AdminAuditLogWhereInput = {};
  
  if (adminEmail) {
    where.adminEmail = { contains: adminEmail, mode: 'insensitive' };
  }
  
  if (action) {
    where.action = action;
  }
  
  if (targetUserId) {
    where.targetUserId = targetUserId;
  }
  
  if (startDate) {
    where.createdAt = { ...where.createdAt as object, gte: new Date(startDate) };
  }
  
  if (endDate) {
    where.createdAt = { ...where.createdAt as object, lte: new Date(endDate) };
  }

  // Execute queries
  const [entries, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  // Log that admin viewed audit log
  await logAdminAction(adminContext, 'VIEW_AUDIT_LOG', {
    details: { page, limit, filters: { adminEmail, action, targetUserId, startDate, endDate } },
  });

  return {
    entries: entries.map(e => ({
      ...e,
      details: e.details as Record<string, unknown> | null,
      createdAt: e.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Log export action (called from frontend before CSV download)
 */
export async function logExportAction(
  adminContext: AdminContext,
  exportedCount: number
): Promise<string> {
  return logAdminAction(adminContext, 'EXPORT_USERS', {
    details: { exportedCount },
  });
}
