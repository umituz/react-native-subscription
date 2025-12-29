/**
 * useSubscriptionStatus Hook
 *
 * TanStack Query hook for checking real subscription status from RevenueCat.
 * This provides the actual premium status based on entitlements, not credits.
 */

import { useQuery } from "@tanstack/react-query";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";

declare const __DEV__: boolean;

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

export interface UseSubscriptionStatusParams {
  userId: string | undefined;
  enabled?: boolean;
}

/**
 * Check real subscription status from RevenueCat
 *
 * @param userId - User ID
 * @param enabled - Whether to enable the query
 * @returns Subscription status with isPremium flag
 */
export const useSubscriptionStatus = ({
  userId,
  enabled = true,
}: UseSubscriptionStatusParams): SubscriptionStatusResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: subscriptionStatusQueryKeys.user(userId ?? ""),
    queryFn: async () => {
      if (!userId) {
        return { isPremium: false, expirationDate: null };
      }

      const status = await SubscriptionManager.checkPremiumStatus();

      if (__DEV__) {
        console.log("[useSubscriptionStatus] Status from RevenueCat", {
          userId,
          isPremium: status.isPremium,
          expirationDate: status.expirationDate,
        });
      }

      return status;
    },
    enabled: enabled && !!userId && SubscriptionManager.isInitializedForUser(userId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    isPremium: data?.isPremium ?? false,
    expirationDate: data?.expirationDate ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
