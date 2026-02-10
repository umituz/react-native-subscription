import { useQuery, useQueryClient } from "@umituz/react-native-design-system";
import { useEffect } from "react";
import { useAuthStore, selectUserId } from "@umituz/react-native-auth";
import { SubscriptionManager } from "../infrastructure/managers/SubscriptionManager";
import { subscriptionEventBus, SUBSCRIPTION_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import { SubscriptionStatusResult } from "./useSubscriptionStatus.types";

export const subscriptionStatusQueryKeys = {
  all: ["subscriptionStatus"] as const,
  user: (userId: string) => ["subscriptionStatus", userId] as const,
};

export const useSubscriptionStatus = (): SubscriptionStatusResult => {
  const userId = useAuthStore(selectUserId);
  const queryClient = useQueryClient();

  const { data, status, error, refetch } = useQuery({
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

  useEffect(() => {
    if (!userId) return;

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
    isLoading,
    error: error as Error | null,
    refetch,
  };
};




