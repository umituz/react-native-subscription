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
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";

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
      return SubscriptionManager.checkPremiumStatus();
    },
    enabled: !!userId && SubscriptionManager.isInitializedForUser(userId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    isPremium: data?.isPremium ?? false,
    expirationDate: data?.expirationDate ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
