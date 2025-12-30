/**
 * Protein Calculator Utilities (Feature 015)
 * 
 * Helper functions for calculations and data normalization
 */

/**
 * Round a number to the nearest 5
 * Examples: 123 → 125, 122 → 120, 127 → 125
 */
export function roundTo5(value: number): number {
  return Math.round(value / 5) * 5;
}

/**
 * Clamp a value between min and max (inclusive)
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalize splits to sum to 1.0
 * Handles floating point precision issues
 * 
 * @param splits Array of proportions that should sum to 1.0
 * @returns Normalized array that sums exactly to 1.0
 */
export function normalizeSplits(splits: number[]): number[] {
  const sum = splits.reduce((acc, val) => acc + val, 0);
  
  if (sum === 0) {
    // Fallback: equal distribution
    const equalSplit = 1 / splits.length;
    return splits.map(() => equalSplit);
  }
  
  // Normalize to sum to 1.0
  const normalized = splits.map((val) => val / sum);
  
  // Fix floating point: adjust last element to ensure sum is exactly 1.0
  const normalizedSum = normalized.slice(0, -1).reduce((acc, val) => acc + val, 0);
  normalized[normalized.length - 1] = 1 - normalizedSum;
  
  return normalized;
}

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return kg / 0.453592;
}

/**
 * Distribute daily target across meals using splits
 * Returns per-meal targets rounded to nearest integer
 * 
 * @param dailyTarget Daily protein target in grams
 * @param splits Meal distribution proportions
 * @returns Array of per-meal protein targets (grams)
 */
export function distributeMeals(dailyTarget: number, splits: number[]): number[] {
  const normalized = normalizeSplits(splits);
  const rawTargets = normalized.map((split) => dailyTarget * split);
  
  // Round to integers while preserving total
  const rounded = rawTargets.map((target) => Math.round(target));
  
  // Adjust for rounding errors: modify the largest meal to match total
  const roundedSum = rounded.reduce((acc, val) => acc + val, 0);
  const diff = dailyTarget - roundedSum;
  
  if (diff !== 0) {
    // Find the largest meal and adjust it
    const maxIndex = rounded.indexOf(Math.max(...rounded));
    rounded[maxIndex] += diff;
  }
  
  return rounded;
}

/**
 * Check if any meal target is below the warning threshold
 */
export function hasLowMealWarning(perMealTargets: number[], threshold = 20): boolean {
  return perMealTargets.some((target) => target < threshold);
}

/**
 * Default meal splits (from data-model.md)
 */
export const DEFAULT_MEAL_SPLITS: Record<string, number[]> = {
  '2': [0.45, 0.55],
  '3': [0.25, 0.35, 0.40],
  '4': [0.25, 0.30, 0.25, 0.20],
  '5': [0.20, 0.20, 0.25, 0.20, 0.15],
};

/**
 * Get meal splits for a given number of meals
 */
export function getMealSplits(
  mealsPerDay: number,
  customSplits?: Record<string, number[]>
): number[] {
  const splits = customSplits ?? DEFAULT_MEAL_SPLITS;
  const key = String(mealsPerDay);
  
  if (key in splits) {
    return splits[key];
  }
  
  // Fallback: equal distribution
  const equalSplit = 1 / mealsPerDay;
  return Array(mealsPerDay).fill(equalSplit);
}

/**
 * Validate that meal splits sum to approximately 1.0
 */
export function validateSplits(splits: number[], tolerance = 0.01): boolean {
  const sum = splits.reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 1.0) <= tolerance;
}

/**
 * Format weight for display with unit
 */
export function formatWeight(kg: number, unit: 'kg' | 'lbs'): string {
  if (unit === 'lbs') {
    return `${Math.round(kgToLbs(kg))} lbs`;
  }
  return `${Math.round(kg)} kg`;
}

/**
 * Format protein amount for display
 */
export function formatProtein(grams: number): string {
  return `${grams}g`;
}
