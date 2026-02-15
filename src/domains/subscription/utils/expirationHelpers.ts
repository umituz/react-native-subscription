const DAYS_REMAINING_WARNING_THRESHOLD = 7;

export function shouldHighlightExpiration(daysRemaining: number | null | undefined): boolean {
  return daysRemaining !== null && daysRemaining !== undefined && daysRemaining > 0 && daysRemaining <= DAYS_REMAINING_WARNING_THRESHOLD;
}
