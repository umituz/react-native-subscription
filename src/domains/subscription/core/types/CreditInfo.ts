/**
 * Credit usage information for display in subscription UI components.
 * Single source of truth — used by SubscriptionDetailScreen and PremiumDetailsCard.
 */
export interface CreditInfo {
  id: string;
  label: string;
  current: number;
  total: number;
}
