import { EXPIRATION_WARNING_THRESHOLD_DAYS } from '../constants/thresholds';

export function shouldHighlightExpiration(daysRemaining: number | null | undefined): boolean {
  return daysRemaining !== null && daysRemaining !== undefined && daysRemaining > 0 && daysRemaining <= EXPIRATION_WARNING_THRESHOLD_DAYS;
}
