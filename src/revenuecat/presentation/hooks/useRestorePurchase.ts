/**
 * Restore Purchase Hook
 * TanStack mutation for restoring previous purchases
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";

/**
 * Restore previous purchases
 */
export const useRestorePurchase = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      addPackageBreadcrumb("subscription", "Restore started", {
        userId,
      });

      addPackageBreadcrumb("subscription", "Restore mutation started", {
        userId,
      });

      const success = await SubscriptionManager.restore();

      if (success) {
        addPackageBreadcrumb("subscription", "Restore success", {
          userId,
        });

        addPackageBreadcrumb("subscription", "Restore mutation success", {
          userId,
        });
      } else {
        addPackageBreadcrumb("subscription", "Restore mutation failed", {
          userId,
        });
      }

      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
      });
    },
    onError: (error) => {
      trackPackageError(
        error instanceof Error ? error : new Error(String(error)),
        {
          packageName: "subscription",
          operation: "restore_mutation",
          userId: userId ?? "NO_USER",
        }
      );
    },
  });
};
