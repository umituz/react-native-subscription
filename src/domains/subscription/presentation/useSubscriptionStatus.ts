/**
 * useSubscriptionStatus Hook
 *
 * Checks real subscription status from RevenueCat.
 * Auth info automatically read from @umituz/react-native-auth.
 */

import { useQuery } from "@umituz/react-native-design-system";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from "../infrastructure/managers/SubscriptionManager";

export const subscriptionStatusQueryKeys = {
  all: ["subscriptionStatus"] as const,
  user: (userId: string) => ["subscriptionStatus", userId] as const,
};

export interface SubscriptionStatusResult {
  isPremium: boolean;
  expirationDate: Date | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSubscriptionStatus = (): SubscriptionStatusResult => {
  const userId = useAuthStore(selectUserId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: subscriptionStatusQueryKeys.user(userId ?? ""),
    queryFn: async () => {
      if (!userId) {
        return { isPremium: false, expirationDate: null };
      }

      try {
        const result = await SubscriptionManager.checkPremiumStatus();
        return result ?? { isPremium: false, expirationDate: null };
      } catch {
        return { isPremium: false, expirationDate: null };
      }
    },
    enabled: !!userId && SubscriptionManager.isInitializedForUser(userId),

  });

  return {
    isPremium: data?.isPremium ?? false,
    expirationDate: data?.expirationDate ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
