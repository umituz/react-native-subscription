/**
 * Progress calculation utilities
 * All progress bar and percentage calculations
 */

/**
 * Calculate percentage for progress bars
 * Returns 0 for invalid inputs (zero or negative total)
 */
export function calculatePercentage(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current / total) * 100;
}

/**
 * Determine progress color based on percentage thresholds
 * @param percentage - Progress percentage (0-100)
 * @param colors - Color object with error, warning, and success colors
 * @returns Appropriate color based on percentage
 */
export interface ProgressColors {
  error: string;
  warning: string;
  success: string;
}

export function getProgressColor(
  percentage: number,
  colors: ProgressColors
): string {
  if (percentage <= 20) return colors.error;
  if (percentage <= 50) return colors.warning;
  return colors.success;
}

/**
 * Check if percentage is in critical range (<= 20%)
 */
export function isCriticalPercentage(percentage: number): boolean {
  return percentage <= 20;
}

/**
 * Check if percentage is in warning range (21-50%)
 */
export function isWarningPercentage(percentage: number): boolean {
  return percentage > 20 && percentage <= 50;
}

/**
 * Check if percentage is in healthy range (> 50%)
 */
export function isHealthyPercentage(percentage: number): boolean {
  return percentage > 50;
}
