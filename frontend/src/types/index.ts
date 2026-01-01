/**
 * T085: TypeScript types for API responses
 * Centralized type definitions for frontend-backend communication
 */

// ========================
// Common Types
// ========================

export interface ApiError {
  error: string;
  requestId?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ========================
// Meal Analysis Types
// ========================

export interface Food {
  id: string;
  name: string;
  portion: string;
  protein: number;
  displayOrder: number;
  isUserCorrected?: boolean;
}

export interface MealAnalysis {
  id: string;
  userId: string;
  blobName: string;
  blobUrl: string;
  requestId: string;
  aiModel: string;
  totalProtein: number;
  confidence: 'high' | 'medium' | 'low';
  foods: Food[];
  createdAt: string;
  updatedAt: string;
  userCorrections?: MealCorrections | null;
}

export interface MealCorrections {
  foods: Array<{
    name: string;
    portion: string;
    protein: number;
  }>;
  totalProtein: number;
  correctedAt?: string;
}

// ========================
// API Request Types
// ========================

export interface UploadUrlRequest {
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  blobName: string;
  expiresAt: string;
}

export interface AnalyzeRequest {
  blobName: string;
}

export interface AnalyzeResponse {
  mealAnalysisId: string;
  foods: Array<{
    name: string;
    portion: string;
    protein: number;
  }>;
  totalProtein: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  blobName: string;
  requestId: string;
}

export interface UpdateMealRequest {
  corrections: MealCorrections;
}

export interface UpdateMealResponse {
  id: string;
  totalProtein: number;
  foods: Food[];
  updatedAt: string;
}

// ========================
// User & Subscription Types
// ========================

export type PlanType = 'free' | 'pro';
export type BillingInterval = 'monthly' | 'annual';

export interface User {
  id: string;
  email: string;
  plan: PlanType;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  interval: BillingInterval;
}

// ========================
// Usage & Quota Types
// ========================

export interface UsageStatus {
  userId: string;
  plan: PlanType;
  weeklyScans: number;
  weeklyLimit: number;
  remaining: number;
  resetAt: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  type: 'MEAL_ANALYSIS' | 'EXPORT';
  resourceId?: string;
  createdAt: string;
}

// ========================
// Billing Types
// ========================

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  stripePriceId: string;
}

export interface CheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

// ========================
// Health Check Types
// ========================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  uptime?: number;
  checks?: {
    database: CheckResult;
    blobStorage: CheckResult;
    aiService: CheckResult;
  };
}

export interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  latencyMs?: number;
  message?: string;
}

// ========================
// Export Types
// ========================

export interface ExportRequest {
  format: 'csv' | 'json';
  startDate?: string;
  endDate?: string;
}

export interface ExportResponse {
  downloadUrl: string;
  fileName: string;
  recordCount: number;
  expiresAt: string;
}

// ========================
// Admin Types
// ========================

export interface AdminUserLookup {
  id: string;
  email: string;
  plan: PlanType;
  subscriptionStatus?: string;
  createdAt: string;
  totalMeals: number;
  lastActivity?: string;
}

// ========================
// Diet Style Types - Feature 017
// ========================

/**
 * T053: Diet style public representation
 * Used in frontend for diet style selection and display
 */
export interface DietStyle {
  id: string;
  slug: string;
  name: string;
  description: string;
  netCarbCapG: number | null;
  fatTargetPercent: number | null;
}

/**
 * Diet style snapshot for meal history
 * Captures which diet style was active when a meal was scanned
 */
export interface DietStyleAtScan {
  id: string;
  slug: string;
  name: string;
}

/**
 * Daily macro summary for diet users
 * Feature 017, US5: Macro Split Display
 */
export interface DailySummary {
  date: string;
  meals: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  percentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
  totalCalories: number;
  carbWarning: boolean;
  carbLimit: number | null;
}

/**
 * User diet style update request
 */
export interface UpdateDietStyleRequest {
  dietStyleId: string | null;
}

/**
 * User diet style update response
 */
export interface UpdateDietStyleResponse {
  success: boolean;
  dietStyle: {
    id: string;
    slug: string;
    name: string;
  } | null;
}
