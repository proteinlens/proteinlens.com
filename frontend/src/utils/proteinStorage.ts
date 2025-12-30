/**
 * Protein Calculator localStorage Helper (Feature 015)
 * 
 * Manages anonymous user protein profile persistence
 */

import type { TrainingLevel, ProteinGoal, WeightUnit } from '../services/proteinApi';

// ===========================================
// Types
// ===========================================

export interface LocalProteinProfile {
  version: 1;
  weightKg: number;
  weightUnit: WeightUnit;
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  mealsPerDay: number;
  proteinTargetG: number;
  perMealTargetsG: number[];
  multiplierUsed: number;
  calculatedAt: string; // ISO 8601
}

// ===========================================
// Constants
// ===========================================

const STORAGE_KEY = 'proteinlens_protein_profile';
const CURRENT_VERSION = 1;

// ===========================================
// Storage Functions
// ===========================================

/**
 * Save protein profile to localStorage
 */
export function saveLocalProteinProfile(profile: LocalProteinProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('Failed to save protein profile to localStorage:', error);
  }
}

/**
 * Load protein profile from localStorage
 * Returns null if no profile exists or if data is invalid
 */
export function loadLocalProteinProfile(): LocalProteinProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as LocalProteinProfile;
    
    // Validate version
    if (parsed.version !== CURRENT_VERSION) {
      console.warn('Protein profile version mismatch, clearing storage');
      clearLocalProteinProfile();
      return null;
    }

    // Basic validation
    if (
      typeof parsed.weightKg !== 'number' ||
      typeof parsed.proteinTargetG !== 'number' ||
      !Array.isArray(parsed.perMealTargetsG) ||
      !['none', 'regular'].includes(parsed.trainingLevel) ||
      !['maintain', 'lose', 'gain'].includes(parsed.goal) ||
      !['kg', 'lbs'].includes(parsed.weightUnit)
    ) {
      console.warn('Invalid protein profile data, clearing storage');
      clearLocalProteinProfile();
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to load protein profile from localStorage:', error);
    return null;
  }
}

/**
 * Clear protein profile from localStorage
 */
export function clearLocalProteinProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear protein profile from localStorage:', error);
  }
}

/**
 * Check if a local profile exists
 */
export function hasLocalProteinProfile(): boolean {
  return loadLocalProteinProfile() !== null;
}

/**
 * Create a new LocalProteinProfile from calculation results
 */
export function createLocalProteinProfile(params: {
  weightKg: number;
  weightUnit: WeightUnit;
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  mealsPerDay: number;
  proteinTargetG: number;
  perMealTargetsG: number[];
  multiplierUsed: number;
}): LocalProteinProfile {
  return {
    version: CURRENT_VERSION,
    ...params,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Update existing profile with new calculation results
 */
export function updateLocalProteinProfile(
  updates: Partial<Omit<LocalProteinProfile, 'version' | 'calculatedAt'>>
): LocalProteinProfile | null {
  const existing = loadLocalProteinProfile();
  if (!existing) {
    return null;
  }

  const updated: LocalProteinProfile = {
    ...existing,
    ...updates,
    calculatedAt: new Date().toISOString(),
  };

  saveLocalProteinProfile(updated);
  return updated;
}

// ===========================================
// Migration Helpers
// ===========================================

/**
 * Get profile data for migration to database
 * Call this when anonymous user signs up
 */
export function getProfileForMigration(): LocalProteinProfile | null {
  return loadLocalProteinProfile();
}

/**
 * Clear local profile after successful database migration
 */
export function clearAfterMigration(): void {
  clearLocalProteinProfile();
}
