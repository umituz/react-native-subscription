import { DAYS_REMAINING_WARNING_THRESHOLD } from "./PremiumDetailsCard.constants";

export const shouldHighlightExpiration = (daysRemaining: number | null | undefined): boolean => {
  return daysRemaining !== null && daysRemaining !== undefined && daysRemaining > 0 && daysRemaining <= DAYS_REMAINING_WARNING_THRESHOLD;
};
