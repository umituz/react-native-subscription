export interface SubscriptionStatusResult {
  isPremium: boolean;
  expirationDate: Date | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
