const EXPIRATION_WARNING_THRESHOLD_DAYS = 7;

export function shouldHighlightExpiration(daysRemaining: number | null | undefined): boolean {
  return daysRemaining !== null && daysRemaining !== undefined && daysRemaining > 0 && daysRemaining <= EXPIRATION_WARNING_THRESHOLD_DAYS;
}
