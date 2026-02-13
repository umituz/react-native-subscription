import type { PeriodType, Store, OwnershipType } from "./SubscriptionConstants";

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
  billingIssueDetectedAt: string | null;
  store: Store | null;
  ownershipType: OwnershipType | null;
}
