// Admin API client
// Feature: 012-admin-dashboard
// T016: Admin API client with base configuration

const API_BASE = import.meta.env.VITE_API_URL || '';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Admin email from session/auth context
      'x-admin-email': getAdminEmail(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

function getAdminEmail(): string {
  // In production, this would come from auth context
  // For now, check localStorage or env
  return localStorage.getItem('adminEmail') || 
         import.meta.env.VITE_ADMIN_EMAIL || 
         '';
}

// ===========================================
// User APIs
// ===========================================

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  plan?: 'FREE' | 'PRO';
  status?: 'active' | 'canceled' | 'past_due' | 'trialing';
  suspended?: boolean;
  sortBy?: 'email' | 'plan' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListItem {
  id: string;
  externalId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  plan: 'FREE' | 'PRO';
  subscriptionStatus: string | null;
  suspended: boolean;
  createdAt: string;
}

export interface UserListResponse {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchUsers(params: UserListParams = {}): Promise<UserListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.plan) searchParams.set('plan', params.plan);
  if (params.status) searchParams.set('status', params.status);
  if (params.suspended !== undefined) searchParams.set('suspended', params.suspended.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  return request<UserListResponse>(`/admin/users${query ? `?${query}` : ''}`);
}

export interface UserDetail {
  id: string;
  externalId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phone: string | null;
  emailVerified: boolean;
  profileCompleted: boolean;
  plan: 'FREE' | 'PRO';
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  suspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  suspendedBy: string | null;
  createdAt: string;
  updatedAt: string;
  usage: {
    totalAnalyses: number;
    thisMonth: number;
  };
  subscriptionEvents: Array<{
    id: string;
    eventType: string;
    createdAt: string;
  }>;
}

export async function fetchUserDetail(userId: string): Promise<UserDetail> {
  return request<UserDetail>(`/admin/users/${userId}`);
}

// ===========================================
// Plan Override
// ===========================================

export interface PlanOverrideParams {
  plan: 'FREE' | 'PRO';
  reason: string;
}

export interface PlanOverrideResponse {
  success: boolean;
  user: {
    id: string;
    email: string | null;
    plan: 'FREE' | 'PRO';
  };
  previousPlan: 'FREE' | 'PRO';
  auditLogId: string;
}

export async function overrideUserPlan(
  userId: string,
  data: PlanOverrideParams
): Promise<PlanOverrideResponse> {
  return request<PlanOverrideResponse>(`/admin/users/${userId}/plan`, {
    method: 'PUT',
    body: data,
  });
}

// ===========================================
// Suspend/Reactivate
// ===========================================

export interface SuspendUserParams {
  reason: string;
}

export interface SuspendUserResponse {
  success: boolean;
  user: {
    id: string;
    email: string | null;
    suspended: boolean;
    suspendedAt: string;
    suspendedReason: string;
    suspendedBy: string;
  };
  auditLogId: string;
}

export async function suspendUser(
  userId: string,
  data: SuspendUserParams
): Promise<SuspendUserResponse> {
  return request<SuspendUserResponse>(`/admin/users/${userId}/suspend`, {
    method: 'POST',
    body: data,
  });
}

export interface ReactivateUserResponse {
  success: boolean;
  user: {
    id: string;
    email: string | null;
    suspended: boolean;
  };
  auditLogId: string;
}

export async function reactivateUser(userId: string): Promise<ReactivateUserResponse> {
  return request<ReactivateUserResponse>(`/admin/users/${userId}/reactivate`, {
    method: 'POST',
  });
}

// ===========================================
// Metrics
// ===========================================

export interface MetricsResponse {
  users: {
    total: number;
    active: number;
    suspended: number;
    newThisMonth: number;
  };
  subscriptions: {
    free: number;
    pro: number;
    trialing: number;
    pastDue: number;
    canceled: number;
  };
  usage: {
    totalAnalyses: number;
    analysesThisMonth: number;
    averagePerUser: number;
  };
}

export async function fetchMetrics(): Promise<MetricsResponse> {
  return request<MetricsResponse>('/admin/metrics');
}

// ===========================================
// Audit Log
// ===========================================

export interface AuditLogParams {
  page?: number;
  limit?: number;
  adminEmail?: string;
  action?: string;
  targetUserId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  adminId: string | null;
  action: string;
  targetUserId: string | null;
  targetEmail: string | null;
  details: Record<string, unknown> | null;
  reason: string | null;
  requestId: string;
  ipAddress: string;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchAuditLog(params: AuditLogParams = {}): Promise<AuditLogResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.adminEmail) searchParams.set('adminEmail', params.adminEmail);
  if (params.action) searchParams.set('action', params.action);
  if (params.targetUserId) searchParams.set('targetUserId', params.targetUserId);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  return request<AuditLogResponse>(`/admin/audit-log${query ? `?${query}` : ''}`);
}

export async function logExport(exportedCount: number): Promise<{ success: boolean; auditLogId: string }> {
  return request<{ success: boolean; auditLogId: string }>('/admin/log-export', {
    method: 'POST',
    body: { exportedCount },
  });
}
