import type { Store, OwnershipType } from "./RevenueCatTypes";

/**
 * RevenueCat subscription data (Single Source of Truth)
 * Used across the subscription package for storing RevenueCat data in Firestore
 * All fields come directly from RevenueCat SDK - no manual definitions
 */
export interface RevenueCatData {
  expirationDate: string | null;
  willRenew: boolean | null;
  originalTransactionId: string | null;
  isPremium: boolean;
  periodType: string | null; // From RevenueCat SDK (NORMAL, INTRO, TRIAL)
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
  store: Store | null; // From PurchasesEntitlementInfo['store']
  ownershipType: OwnershipType | null; // From PurchasesEntitlementInfo['ownershipType']
}
