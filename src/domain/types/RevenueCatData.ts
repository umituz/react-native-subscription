/**
 * RevenueCat subscription data (Single Source of Truth)
 * Used across the subscription package for storing RevenueCat data in Firestore
 */
export interface RevenueCatData {
  expirationDate?: string | null;
  willRenew?: boolean;
  originalTransactionId?: string;
  isPremium?: boolean;
  /** RevenueCat period type: NORMAL, INTRO, or TRIAL */
  periodType?: "NORMAL" | "INTRO" | "TRIAL";
}
