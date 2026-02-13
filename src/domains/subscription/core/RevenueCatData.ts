import type { PeriodType } from "./SubscriptionStatus";

/**
 * RevenueCat subscription data (Single Source of Truth)
 * Used across the subscription package for storing RevenueCat data in Firestore
 */
export interface RevenueCatData {
  expirationDate: string | null;
  willRenew: boolean | null;
  originalTransactionId: string | null;
  isPremium: boolean;
  periodType: PeriodType | null;
  unsubscribeDetectedAt: string | null;
}
