/**
 * Format a macro value for display.
 * Rounds to 1 decimal place and strips trailing zeros.
 * e.g. 38.4000000 → "38.4", 19.0 → "19", 0.5 → "0.5"
 */
export function formatMacro(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  return parseFloat(value.toFixed(1)).toString();
}
