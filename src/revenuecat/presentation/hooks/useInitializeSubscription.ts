/**
 * Initialize Subscription Hook
 * TanStack mutation for initializing RevenueCat
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";
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

      addPackageBreadcrumb("subscription", "Initialize mutation started", {
        userId,
      });

      return SubscriptionManager.initialize(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });

        addPackageBreadcrumb(
          "subscription",
          "Initialize mutation success - packages invalidated",
          { userId }
        );
      }
    },
    onError: (error) => {
      trackPackageError(
        error instanceof Error ? error : new Error(String(error)),
        {
          packageName: "subscription",
          operation: "initialize_mutation",
          userId: userId ?? "NO_USER",
        }
      );
    },
  });
};
