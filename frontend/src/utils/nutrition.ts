// Nutrition utility functions for macro calculation
// NEW - macro ingredients analysis feature

/**
 * Calculate macronutrient percentages based on caloric conversion (4-4-9 rule)
 * 4 calories per gram for protein and carbohydrates
 * 9 calories per gram for fat
 */
export function calculateMacroPercentages(
  protein: number,
  carbs: number,
  fat: number
): { protein: number; carbs: number; fat: number } | null {
  // Calculate calories from each macro
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;

  // Calculate total calories
  const totalCalories = proteinCalories + carbsCalories + fatCalories;

  // Avoid division by zero
  if (totalCalories === 0) {
    return null;
  }

  // Calculate percentages and round to nearest integer
  return {
    protein: Math.round((proteinCalories / totalCalories) * 100),
    carbs: Math.round((carbsCalories / totalCalories) * 100),
    fat: Math.round((fatCalories / totalCalories) * 100),
  };
}

/**
 * Calculate total calories from macronutrients
 */
export function calculateTotalCalories(
  protein: number,
  carbs: number,
  fat: number
): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

/**
 * Format macro value as string with 1 decimal place
 */
export function formatMacroValue(value: number | undefined): string {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  return `${value.toFixed(1)}g`;
}
