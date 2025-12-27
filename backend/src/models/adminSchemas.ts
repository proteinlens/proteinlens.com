// Admin API request/response validation schemas
// Feature: 012-admin-dashboard
// T014: Zod validation schemas for API types

import { z } from 'zod';

// ===========================================
// Enums matching Prisma schema
// ===========================================

export const AdminActionTypeSchema = z.enum([
  'VIEW_USER_LIST',
  'VIEW_USER_DETAIL',
  'PLAN_OVERRIDE',
  'SUSPEND_USER',
  'REACTIVATE_USER',
  'EXPORT_USERS',
  'VIEW_AUDIT_LOG',
]);

export type AdminActionType = z.infer<typeof AdminActionTypeSchema>;

export const PlanSchema = z.enum(['FREE', 'PRO']);
export type Plan = z.infer<typeof PlanSchema>;

export const SubscriptionStatusSchema = z.enum(['active', 'canceled', 'past_due', 'trialing']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

// ===========================================
// User List Request/Response
// ===========================================

export const ListUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  plan: PlanSchema.optional(),
  status: SubscriptionStatusSchema.optional(),
  suspended: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional()
  ),
  sortBy: z.enum(['email', 'plan', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;

export const UserListItemSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  plan: PlanSchema,
  subscriptionStatus: SubscriptionStatusSchema.nullable(),
  suspended: z.boolean(),
  createdAt: z.string().datetime(),
});

export type UserListItem = z.infer<typeof UserListItemSchema>;

export const UserListResponseSchema = z.object({
  users: z.array(UserListItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type UserListResponse = z.infer<typeof UserListResponseSchema>;

// ===========================================
// User Detail Response
// ===========================================

export const UserDetailResponseSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  organizationName: z.string().nullable(),
  phone: z.string().nullable(),
  emailVerified: z.boolean(),
  profileCompleted: z.boolean(),
  plan: PlanSchema,
  subscriptionStatus: SubscriptionStatusSchema.nullable(),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  currentPeriodEnd: z.string().datetime().nullable(),
  suspended: z.boolean(),
  suspendedAt: z.string().datetime().nullable(),
  suspendedReason: z.string().nullable(),
  suspendedBy: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  usage: z.object({
    totalAnalyses: z.number(),
    thisMonth: z.number(),
  }),
  subscriptionEvents: z.array(z.object({
    id: z.string(),
    eventType: z.string(),
    createdAt: z.string().datetime(),
  })),
});

export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>;

// ===========================================
// Plan Override Request/Response
// ===========================================

export const PlanOverrideRequestSchema = z.object({
  plan: PlanSchema,
  reason: z.string().min(1).max(500),
});

export type PlanOverrideRequest = z.infer<typeof PlanOverrideRequestSchema>;

export const PlanOverrideResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().nullable(),
    plan: PlanSchema,
  }),
  previousPlan: PlanSchema,
  auditLogId: z.string(),
});

export type PlanOverrideResponse = z.infer<typeof PlanOverrideResponseSchema>;

// ===========================================
// Suspend/Reactivate Request/Response
// ===========================================

export const SuspendUserRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});

export type SuspendUserRequest = z.infer<typeof SuspendUserRequestSchema>;

export const SuspendUserResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().nullable(),
    suspended: z.boolean(),
    suspendedAt: z.string().datetime(),
    suspendedReason: z.string(),
    suspendedBy: z.string(),
  }),
  auditLogId: z.string(),
});

export type SuspendUserResponse = z.infer<typeof SuspendUserResponseSchema>;

export const ReactivateUserResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().nullable(),
    suspended: z.boolean(),
  }),
  auditLogId: z.string(),
});

export type ReactivateUserResponse = z.infer<typeof ReactivateUserResponseSchema>;

// ===========================================
// Metrics Response
// ===========================================

export const MetricsResponseSchema = z.object({
  users: z.object({
    total: z.number(),
    active: z.number(),
    suspended: z.number(),
    newThisMonth: z.number(),
  }),
  subscriptions: z.object({
    free: z.number(),
    pro: z.number(),
    trialing: z.number(),
    pastDue: z.number(),
    canceled: z.number(),
  }),
  usage: z.object({
    totalAnalyses: z.number(),
    analysesThisMonth: z.number(),
    averagePerUser: z.number(),
  }),
});

export type MetricsResponse = z.infer<typeof MetricsResponseSchema>;

// ===========================================
// Audit Log Request/Response
// ===========================================

export const AuditLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  adminEmail: z.string().optional(),
  action: AdminActionTypeSchema.optional(),
  targetUserId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;

export const AuditLogEntrySchema = z.object({
  id: z.string(),
  adminEmail: z.string(),
  adminId: z.string().nullable(),
  action: AdminActionTypeSchema,
  targetUserId: z.string().nullable(),
  targetEmail: z.string().nullable(),
  details: z.record(z.unknown()).nullable(),
  reason: z.string().nullable(),
  requestId: z.string(),
  ipAddress: z.string(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

export const AuditLogResponseSchema = z.object({
  entries: z.array(AuditLogEntrySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>;
