import type { PremiumStatus } from "../core/types/PremiumStatus";

export interface SubscriptionStatusResult extends PremiumStatus {
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
