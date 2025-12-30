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
  
  // Get auth token from localStorage
  const accessToken = localStorage.getItem('proteinlens_access_token');

  // Build headers using plain object - string concatenation to avoid any compilation issues
  const authHeader = accessToken ? ('Bearer ' + accessToken) : '';
  const adminEmail = getAdminEmail();
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-admin-email': adminEmail,
    ...headers,
  };
  
  // Add Authorization header if token exists
  if (authHeader) {
    requestHeaders['Authorization'] = authHeader;
  }

  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    method,
    headers: requestHeaders,
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
  return request<UserListResponse>(`/dashboard/users${query ? `?${query}` : ''}`);
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
  return request<UserDetail>(`/dashboard/users/${userId}`);
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
  return request<PlanOverrideResponse>(`/dashboard/users/${userId}/plan`, {
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
  return request<SuspendUserResponse>(`/dashboard/users/${userId}/suspend`, {
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
  return request<ReactivateUserResponse>(`/dashboard/users/${userId}/reactivate`, {
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
  return request<MetricsResponse>('/dashboard/metrics');
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
  return request<AuditLogResponse>(`/dashboard/audit-log${query ? `?${query}` : ''}`);
}

export async function logExport(exportedCount: number): Promise<{ success: boolean; auditLogId: string }> {
  return request<{ success: boolean; auditLogId: string }>('/dashboard/log-export', {
    method: 'POST',
    body: { exportedCount },
  });
}

// ===========================================
// Meals APIs
// ===========================================

export interface MealListParams {
  page?: number;
  limit?: number;
  userId?: string;
  search?: string;
  confidence?: 'high' | 'medium' | 'low';
  sortBy?: 'createdAt' | 'totalProtein' | 'confidence';
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  protein: number;
  displayOrder: number;
}

export interface MealListItem {
  id: string;
  userId: string;
  userEmail: string | null;
  blobName: string;
  blobUrl: string;
  imageUrl: string;
  totalProtein: number;
  confidence: 'high' | 'medium' | 'low';
  notes: string | null;
  aiModel: string;
  foodCount: number;
  foods: FoodItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MealsListResponse {
  meals: MealListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalMeals: number;
    totalProteinSum: number;
    averageProtein: number;
    confidenceBreakdown: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

export interface MealDetailResponse extends MealListItem {
  requestId: string;
  blobHash: string | null;
  aiResponseRaw: unknown;
  userCorrections: unknown;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    plan: string;
  } | null;
}

export async function fetchMeals(params: MealListParams = {}): Promise<MealsListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.userId) searchParams.set('userId', params.userId);
  if (params.search) searchParams.set('search', params.search);
  if (params.confidence) searchParams.set('confidence', params.confidence);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  return request<MealsListResponse>(`/dashboard/meals${query ? `?${query}` : ''}`);
}

export async function fetchMealDetail(mealId: string): Promise<MealDetailResponse> {
  return request<MealDetailResponse>(`/dashboard/meals/${mealId}`);
}

