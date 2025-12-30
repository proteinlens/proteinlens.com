/**
 * Admin Protein API Client (Feature 015)
 * 
 * API functions for managing protein presets and configuration
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

// ===========================================
// Types
// ===========================================

export type TrainingLevel = 'none' | 'regular';
export type ProteinGoal = 'maintain' | 'lose' | 'gain';

export interface ProteinPreset {
  id: string;
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  multiplierGPerKg: number;
  active: boolean;
  updatedAt: string;
}

export interface PresetsResponse {
  presets: ProteinPreset[];
}

export interface ProteinConfig {
  id: string;
  minGDay: number;
  maxGDay: number;
  defaultMealsPerDay: number;
  mealSplits: Record<string, number[]>;
  updatedAt: string;
}

export interface UpdatePresetRequest {
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  multiplierGPerKg: number;
}

export interface UpdateConfigRequest {
  minGDay?: number;
  maxGDay?: number;
  defaultMealsPerDay?: number;
  mealSplits?: Record<string, number[]>;
}

// ===========================================
// Helper
// ===========================================

function getAuthHeaders(): Record<string, string> {
  const accessToken = localStorage.getItem('proteinlens_access_token');
  const adminEmail = localStorage.getItem('adminEmail') || import.meta.env.VITE_ADMIN_EMAIL || '';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-admin-email': adminEmail,
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// ===========================================
// API Functions
// ===========================================

/**
 * Get all protein presets
 */
export async function getPresets(): Promise<PresetsResponse> {
  const response = await fetch(`${API_BASE}/api/dashboard/protein/presets`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return handleResponse<PresetsResponse>(response);
}

/**
 * Update a protein preset
 */
export async function updatePreset(request: UpdatePresetRequest): Promise<ProteinPreset> {
  const response = await fetch(`${API_BASE}/api/dashboard/protein/presets`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  });
  return handleResponse<ProteinPreset>(response);
}

/**
 * Get protein config
 */
export async function getProteinConfig(): Promise<ProteinConfig> {
  const response = await fetch(`${API_BASE}/api/dashboard/protein/config`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  return handleResponse<ProteinConfig>(response);
}

/**
 * Update protein config
 */
export async function updateProteinConfig(request: UpdateConfigRequest): Promise<ProteinConfig> {
  const response = await fetch(`${API_BASE}/api/dashboard/protein/config`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  });
  return handleResponse<ProteinConfig>(response);
}
