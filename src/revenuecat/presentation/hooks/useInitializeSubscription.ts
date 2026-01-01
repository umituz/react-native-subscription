/**
 * Initialize Subscription Hook
 * TanStack mutation for initializing RevenueCat
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";

/**
 * Initialize subscription with RevenueCat
 */
export const useInitializeSubscription = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (__DEV__) {
        console.log('[DEBUG useInitializeSubscription] Initializing:', { userId });
      }

      return SubscriptionManager.initialize(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });

        if (__DEV__) {
          console.log('[DEBUG useInitializeSubscription] Success:', { userId });
        }
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('[DEBUG useInitializeSubscription] Error:', {
          error,
          userId: userId ?? "ANONYMOUS",
        });
      }
    },
  });
};
