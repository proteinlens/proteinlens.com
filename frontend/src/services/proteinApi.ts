/**
 * Protein Calculator API Client (Feature 015)
 * 
 * API functions for protein target calculation and profile management
 */

import { getValidAccessToken, getAuthHeaders, getStoredAccessToken } from './authService';

// API base from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_BASE_URL}/api`;

// ===========================================
// Types (shared with backend)
// ===========================================

export type TrainingLevel = 'none' | 'regular';
export type ProteinGoal = 'maintain' | 'lose' | 'gain';
export type WeightUnit = 'kg' | 'lbs';

export interface CalculateProteinRequest {
  weightKg: number;
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  mealsPerDay?: number;
}

export interface SaveProteinProfileRequest {
  weightKg: number;
  weightUnit?: WeightUnit;
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  mealsPerDay?: number;
}

export interface ProteinTargetResponse {
  proteinTargetG: number;
  perMealTargetsG: number[];
  multiplierUsed: number;
  lowMealWarning?: boolean;
}

export interface ProteinProfileResponse {
  profile: {
    id: string;
    weightKg: number;
    weightUnit: WeightUnit;
    trainingLevel: TrainingLevel;
    goal: ProteinGoal;
    mealsPerDay: number;
    updatedAt: string;
  };
  target: ProteinTargetResponse;
}

export interface ProteinConfigResponse {
  presets: {
    [trainingLevel: string]: {
      [goal: string]: number;
    };
  };
  mealSplits: {
    [meals: string]: number[];
  };
  defaults: {
    minGDay: number;
    maxGDay: number;
    mealsPerDay: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// ===========================================
// Error Handling
// ===========================================

export class ProteinApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ProteinApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      error: 'unknown_error',
      message: response.statusText,
    })) as ApiError;
    
    throw new ProteinApiError(
      errorBody.message || 'Request failed',
      errorBody.error || 'unknown_error',
      response.status,
      errorBody.details
    );
  }
  
  return response.json() as Promise<T>;
}

// ===========================================
// API Functions
// ===========================================

/**
 * Calculate protein targets (no auth required)
 * Does NOT persist results - use for preview/anonymous calculations
 */
export async function calculateProtein(
  request: CalculateProteinRequest
): Promise<ProteinTargetResponse> {
  const response = await fetch(`${API_BASE}/protein/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...request,
      mealsPerDay: request.mealsPerDay ?? 3,
    }),
  });
  
  return handleResponse<ProteinTargetResponse>(response);
}

/**
 * Get public protein configuration (presets, meal splits)
 */
export async function getProteinConfig(): Promise<ProteinConfigResponse> {
  const response = await fetch(`${API_BASE}/protein/config`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse<ProteinConfigResponse>(response);
}

/**
 * Get authenticated user's protein profile
 * Returns null if no profile exists
 */
export async function getProteinProfile(): Promise<ProteinProfileResponse | null> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new ProteinApiError('Not authenticated', 'unauthorized', 401);
  }
  
  const response = await fetch(`${API_BASE}/protein/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...getAuthHeaders(),
    },
  });
  
  if (response.status === 404) {
    return null;
  }
  
  return handleResponse<ProteinProfileResponse>(response);
}

/**
 * Save protein profile (create or update)
 */
export async function saveProteinProfile(
  request: SaveProteinProfileRequest
): Promise<ProteinProfileResponse> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new ProteinApiError('Not authenticated', 'unauthorized', 401);
  }
  
  const response = await fetch(`${API_BASE}/protein/profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...request,
      mealsPerDay: request.mealsPerDay ?? 3,
      weightUnit: request.weightUnit ?? 'kg',
    }),
  });
  
  return handleResponse<ProteinProfileResponse>(response);
}

/**
 * Delete protein profile
 */
export async function deleteProteinProfile(): Promise<void> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new ProteinApiError('Not authenticated', 'unauthorized', 401);
  }
  
  const response = await fetch(`${API_BASE}/protein/profile`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok && response.status !== 204) {
    const errorBody = await response.json().catch(() => ({
      error: 'unknown_error',
      message: response.statusText,
    })) as ApiError;
    
    throw new ProteinApiError(
      errorBody.message || 'Delete failed',
      errorBody.error || 'unknown_error',
      response.status
    );
  }
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated(): boolean {
  return !!getStoredAccessToken();
}
