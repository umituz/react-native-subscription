import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useEffect } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { SubscriptionManager } from "../infrastructure/managers/SubscriptionManager";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { SubscriptionStatusResult } from "./useSubscriptionStatus.types";
import { isAuthenticated } from "../utils/authGuards";
import { NO_CACHE_QUERY_CONFIG } from "../../../shared/infrastructure/react-query/queryConfig";
import { usePreviousUserCleanup } from "../../../shared/infrastructure/react-query/hooks/usePreviousUserCleanup";

export const subscriptionStatusQueryKeys = {
  all: ["subscriptionStatus"] as const,
  user: (userId: string | null | undefined) =>
    userId ? (["subscriptionStatus", userId] as const) : (["subscriptionStatus"] as const),
};

export const useSubscriptionStatus = (): SubscriptionStatusResult => {
  const userId = useAuthStore(selectUserId);
  const queryClient = useQueryClient();
  const isConfigured = SubscriptionManager.isConfigured();

  // Check if initialized (BackgroundInitializer handles initialization)
  const isInitialized = userId ? SubscriptionManager.isInitializedForUser(userId) : false;
  const queryEnabled = isAuthenticated(userId) && isConfigured && isInitialized;

  const { data, status, error, refetch } = useQuery({
    queryKey: subscriptionStatusQueryKeys.user(userId),
    queryFn: async () => {
      if (!isAuthenticated(userId)) {
        return null;
      }

      // No side effects - just check premium status
      // Initialization is handled by BackgroundInitializer
      try {
        const result = await SubscriptionManager.checkPremiumStatus();
        return result;
      } catch {
        return null;
      }
    },
    enabled: queryEnabled,
    ...NO_CACHE_QUERY_CONFIG,
  });

  // Clean up previous user's cache on logout/user switch
  usePreviousUserCleanup(userId, queryClient, subscriptionStatusQueryKeys.user);

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
    isPremium: data?.isPremium ?? false,
    expirationDate: data?.expirationDate ?? null,
    willRenew: data?.willRenew ?? false,
    productIdentifier: data?.productIdentifier ?? null,
    originalPurchaseDate: data?.originalPurchaseDate ?? null,
    latestPurchaseDate: data?.latestPurchaseDate ?? null,
    billingIssuesDetected: data?.billingIssuesDetected ?? false,
    isSandbox: data?.isSandbox ?? false,
    periodType: data?.periodType ?? null,
    packageType: data?.packageType ?? null,
    store: data?.store ?? null,
    gracePeriodExpiresDate: data?.gracePeriodExpiresDate ?? null,
    unsubscribeDetectedAt: data?.unsubscribeDetectedAt ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};




