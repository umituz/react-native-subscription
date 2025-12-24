/**
 * Purchase Package Hook
 * TanStack mutation for purchasing subscription packages
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PurchasesPackage } from "react-native-purchases";
import { SubscriptionManager } from '../../infrastructure/managers/SubscriptionManager';
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { creditsQueryKeys } from "../../../presentation/hooks/useCredits";

/**
 * Purchase a subscription package
 */
export const usePurchasePackage = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      addPackageBreadcrumb("subscription", "Purchase started", {
        packageId: pkg.identifier,
        userId,
      });

      addPackageBreadcrumb("subscription", "Purchase mutation started", {
        packageId: pkg.identifier,
        userId,
      });

      const success = await SubscriptionManager.purchasePackage(pkg);

      if (success) {
        addPackageBreadcrumb("subscription", "Purchase success", {
          packageId: pkg.identifier,
          userId,
        });

        addPackageBreadcrumb("subscription", "Purchase mutation success", {
          packageId: pkg.identifier,
          userId,
        });
      } else {
        addPackageBreadcrumb("subscription", "Purchase cancelled", {
          packageId: pkg.identifier,
          userId,
        });

        addPackageBreadcrumb("subscription", "Purchase mutation failed", {
          packageId: pkg.identifier,
          userId,
        });
      }

      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
      });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: creditsQueryKeys.user(userId),
        });
      }
    },
    onError: (error) => {
      trackPackageError(
        error instanceof Error ? error : new Error(String(error)),
        {
          packageName: "subscription",
          operation: "purchase_mutation",
          userId: userId ?? "ANONYMOUS",
        }
      );
    },
  });
};
