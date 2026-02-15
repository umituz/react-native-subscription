export interface SubscriptionStatusResult {
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
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
