/**
 * Initialize Subscription Hook
 * TanStack mutation for initializing RevenueCat
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
import {
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

        userId,
      });

      return SubscriptionManager.initialize(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });

          "subscription",
          "Initialize mutation success - packages invalidated",
          { userId }
        );
      }
    },
    onError: (error) => {
        error instanceof Error ? error : new Error(String(error)),
        {
          packageName: "subscription",
          operation: "initialize_mutation",
          userId: userId ?? "ANONYMOUS",
        }
      );
    },
  });
};
