import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useEffect, useSyncExternalStore } from "react";
import { useAuthStore, selectUserId, selectIsAnonymous } from "@umituz/react-native-auth";
import { SubscriptionManager } from "../infrastructure/managers/SubscriptionManager";
import { initializationState } from "../infrastructure/state/initializationState";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { SubscriptionStatusResult } from "./useSubscriptionStatus.types";
import { isRegisteredUser } from "../utils/authGuards";
import { NO_CACHE_QUERY_CONFIG } from "../../../shared/infrastructure/react-query/queryConfig";
import { usePreviousUserCleanup } from "../../../shared/infrastructure/react-query/hooks/usePreviousUserCleanup";

export const subscriptionStatusQueryKeys = {
  all: ["subscriptionStatus"] as const,
  user: (userId: string | null | undefined) =>
    userId ? (["subscriptionStatus", userId] as const) : (["subscriptionStatus"] as const),
};

export const useSubscriptionStatus = (): SubscriptionStatusResult => {
  const userId = useAuthStore(selectUserId);
  const isAnonymous = useAuthStore(selectIsAnonymous);
  const queryClient = useQueryClient();
  const isConfigured = SubscriptionManager.isConfigured();
  const isUserRegistered = isRegisteredUser(userId, isAnonymous);

  const initState = useSyncExternalStore(
    initializationState.subscribe,
    initializationState.getSnapshot,
    initializationState.getSnapshot,
  );

  const isInitialized = userId
    ? initState.initialized && initState.userId === userId
    : false;

  const queryEnabled = isUserRegistered && isConfigured && isInitialized;

  const { data, status, error, refetch } = useQuery({
    queryKey: subscriptionStatusQueryKeys.user(userId),
    queryFn: async () => {
      if (!isUserRegistered) {
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
    ...NO_CACHE_QUERY_CONFIG,
  });

  usePreviousUserCleanup(userId, queryClient, subscriptionStatusQueryKeys.user);

  useEffect(() => {
    if (!isUserRegistered) return undefined;

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
  }, [userId, isUserRegistered, queryClient]);

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
