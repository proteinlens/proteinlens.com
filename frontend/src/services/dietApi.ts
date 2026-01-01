/**
 * Feature 017: Diet Style API Service
 * T034: Frontend API client for diet style operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_PATH = `${API_BASE_URL}/api`;

import { getUserId } from '@/utils/userId';

export interface DietStyle {
  id: string;
  slug: string;
  name: string;
  description: string;
  netCarbCapG: number | null;
  fatTargetPercent: number | null;
}

export interface DietStylesResponse {
  dietStyles: DietStyle[];
}

export interface UpdateDietStyleResponse {
  success: boolean;
  dietStyle: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getUserId(),
  };
}

/**
 * Get all active diet styles
 * GET /api/diet-styles
 */
export async function getDietStyles(): Promise<DietStyle[]> {
  const response = await fetch(`${API_PATH}/diet-styles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch diet styles: ${response.status}`);
  }

  const data: DietStylesResponse = await response.json();
  return data.dietStyles;
}

/**
 * Update user's selected diet style
 * PATCH /api/me/diet-style
 */
export async function updateUserDietStyle(dietStyleId: string | null): Promise<UpdateDietStyleResponse> {
  const response = await fetch(`${API_PATH}/me/diet-style`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ dietStyleId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update diet style: ${response.status}`);
  }

  return response.json();
}

/**
 * Daily summary with macro breakdown
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
 * Get daily macro summary
 * GET /api/meals/daily-summary
 * T048: Daily summary with macro breakdown for diet users
 */
export async function getDailySummary(date?: string): Promise<DailySummary> {
  const params = date ? `?date=${date}` : '';
  const response = await fetch(`${API_PATH}/meals/daily-summary${params}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch daily summary: ${response.status}`);
  }

  return response.json();
}

/**
 * Diet API service object for convenience
 */
export const dietApi = {
  getDietStyles,
  updateUserDietStyle,
  getDailySummary,
};

export default dietApi;
