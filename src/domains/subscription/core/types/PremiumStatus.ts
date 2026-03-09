/**
 * Resolved premium status from RevenueCat CustomerInfo.
 * Uses Date objects (presentation-ready).
 *
 * Extended by SubscriptionStatusResult which adds hook state (isLoading, error, refetch).
 */
export interface PremiumStatus {
  isPremium: boolean;
  expirationDate: Date | null;
  willRenew: boolean;
  productIdentifier: string | null;
  originalPurchaseDate: Date | null;
  latestPurchaseDate: Date | null;
  billingIssuesDetected: boolean;
  isSandbox: boolean;
  periodType: string | null;
  packageType: string | null;
  store: string | null;
  gracePeriodExpiresDate: Date | null;
  unsubscribeDetectedAt: Date | null;
}
