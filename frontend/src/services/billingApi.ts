// Billing API client for subscription and plan management
// Feature: 002-saas-billing

import { getAuthHeaders, getValidAccessToken } from './authService';
import { getUserId } from '../utils/userId';

// VITE_API_URL is the base URL (e.g., https://api.proteinlens.com or http://localhost:7071)
// All API routes are under /api/* path
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_BASE_URL}/api`;

/**
 * Get headers for billing API calls
 * Includes auth headers (CSRF token) and user ID header
 */
function getBillingHeaders(): Record<string, string> {
  return {
    ...getAuthHeaders(),
    'x-user-id': getUserId(),
  };
}

/**
 * Plan feature limits
 */
export interface PlanFeatures {
  scansPerWeek: number; // -1 for unlimited
  historyDays: number; // -1 for unlimited
  exportEnabled: boolean;
}

/**
 * Pricing plan information
 */
export interface PlanInfo {
  id: 'FREE' | 'PRO';
  name: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  priceMonthlyFormatted: string;
  priceAnnualFormatted: string | null;
  annualSavings: number | null; // Percentage
  stripePriceIdMonthly: string | null;
  stripePriceIdAnnual: string | null;
  features: PlanFeatures;
}

/**
 * Feature comparison row
 */
export interface FeatureComparison {
  name: string;
  free: string | boolean;
  pro: string | boolean;
}

/**
 * Plans response from API
 */
export interface PlansResponse {
  plans: PlanInfo[];
  featureComparison: FeatureComparison[];
  currency: string;
  currencySymbol: string;
}

/**
 * Usage statistics
 */
export interface UsageStats {
  plan: 'FREE' | 'PRO';
  scansUsed: number;
  scansRemaining: number; // -1 for unlimited
  scansLimit: number; // -1 for unlimited
  periodStart: string;
  periodEnd: string;
}

/**
 * Checkout session response
 */
export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Portal session response
 */
export interface PortalResponse {
  url: string;
}

/**
 * Fetch available pricing plans
 */
export async function getPlans(): Promise<PlansResponse> {
  const response = await fetch(`${API_BASE}/billing/plans`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch plans: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get current usage statistics for authenticated user
 */
export async function getUsage(): Promise<UsageStats> {
  const response = await fetch(`${API_BASE}/billing/usage`, {
    headers: getBillingHeaders(),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch usage: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Create a checkout session for subscription
 * @param priceId - Stripe price ID (monthly or annual)
 */
export async function createCheckout(priceId: string): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE}/billing/checkout`, {
    method: 'POST',
    headers: getBillingHeaders(),
    credentials: 'include',
    body: JSON.stringify({ priceId }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create checkout: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Create a billing portal session
 */
export async function createPortalSession(): Promise<PortalResponse> {
  const response = await fetch(`${API_BASE}/billing/portal`, {
    method: 'POST',
    headers: getBillingHeaders(),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create portal session: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(priceId: string): Promise<void> {
  const { url } = await createCheckout(priceId);
  window.location.href = url;
}

/**
 * Redirect to Stripe Customer Portal
 */
export async function redirectToPortal(): Promise<void> {
  const { url } = await createPortalSession();
  window.location.href = url;
}

/**
 * T062: Export meal data (Pro-only)
 * @param format - 'json' or 'csv'
 */
export async function exportMeals(format: 'json' | 'csv' = 'json'): Promise<void> {
  const response = await fetch(`${API_BASE}/meals/export?format=${format}`, {
    headers: {
      // TODO: Add auth header when auth is implemented
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Pro subscription required for export');
    }
    throw new Error(`Failed to export: ${response.statusText}`);
  }
  
  // Download file
  const blob = await response.blob();
  const filename = response.headers.get('Content-Disposition')
    ?.split('filename=')[1]
    ?.replace(/"/g, '') || `proteinlens-export.${format}`;
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
