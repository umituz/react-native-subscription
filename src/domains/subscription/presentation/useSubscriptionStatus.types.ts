import type { PremiumStatus } from "../core/types";

export interface SubscriptionStatusResult extends PremiumStatus {
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
