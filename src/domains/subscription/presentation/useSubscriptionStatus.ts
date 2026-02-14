import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useEffect, useRef } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { SubscriptionManager } from "../infrastructure/managers/SubscriptionManager";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { SubscriptionStatusResult } from "./useSubscriptionStatus.types";
import { isAuthenticated } from "../utils/authGuards";

export const subscriptionStatusQueryKeys = {
  all: ["subscriptionStatus"] as const,
  user: (userId: string | null | undefined) =>
    userId ? (["subscriptionStatus", userId] as const) : (["subscriptionStatus"] as const),
};

export const useSubscriptionStatus = (): SubscriptionStatusResult => {
  const userId = useAuthStore(selectUserId);
  const queryClient = useQueryClient();

  const queryEnabled = isAuthenticated(userId) && SubscriptionManager.isInitializedForUser(userId);

  const { data, status, error, refetch } = useQuery({
    queryKey: subscriptionStatusQueryKeys.user(userId),
    queryFn: async () => {
      if (!isAuthenticated(userId)) {
        return null;
      }

      try {
        const result = await SubscriptionManager.checkPremiumStatus();
        return result;
      } catch {
        return null;
      }
    },
    enabled: queryEnabled,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });

  // Track previous userId to clear stale cache on logout/user switch
  const prevUserIdRef = useRef(userId);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    // Clear previous user's cache when userId changes (logout or user switch)
    if (prevUserId !== userId && isAuthenticated(prevUserId)) {
      queryClient.removeQueries({
        queryKey: subscriptionStatusQueryKeys.user(prevUserId),
      });
    }
  }, [userId, queryClient]);

  useEffect(() => {
    if (!isAuthenticated(userId)) return undefined;

    const unsubscribe = subscriptionEventBus.on(
      SUBSCRIPTION_EVENTS.PREMIUM_STATUS_CHANGED,
      (event: { userId: string; isPremium: boolean }) => {
        if (event.userId === userId) {
          queryClient.invalidateQueries({
            queryKey: subscriptionStatusQueryKeys.user(userId),
          });
        }
      }
    );

    return unsubscribe;
  }, [userId, queryClient]);

  const isLoading = status === "pending";

  return {
    isPremium: data?.isPremium || false,
    expirationDate: data?.expirationDate || null,
    willRenew: data?.willRenew || false,
    productIdentifier: data?.productIdentifier || null,
    originalPurchaseDate: data?.originalPurchaseDate || null,
    latestPurchaseDate: data?.latestPurchaseDate || null,
    billingIssuesDetected: data?.billingIssuesDetected || false,
    isSandbox: data?.isSandbox || false,
    periodType: data?.periodType || null,
    store: data?.store || null,
    gracePeriodExpiresDate: data?.gracePeriodExpiresDate || null,
    unsubscribeDetectedAt: data?.unsubscribeDetectedAt || null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};




