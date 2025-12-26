/**
 * Purchase Package Hook
 * TanStack mutation for purchasing subscription packages
 * Credits are initialized by CustomerInfoListener (not here to avoid duplicates)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PurchasesPackage } from "react-native-purchases";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import {
  trackPackageError,
  addPackageBreadcrumb,
} from "@umituz/react-native-sentry";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { creditsQueryKeys } from "../../../presentation/hooks/useCredits";

interface PurchaseResult {
  success: boolean;
  productId: string;
}

/**
 * Purchase a subscription package
 * Credits are initialized by CustomerInfoListener when entitlement becomes active
 */
export const usePurchasePackage = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const productId = pkg.product.identifier;

      addPackageBreadcrumb("subscription", "Purchase started", {
        packageId: pkg.identifier,
        productId,
        userId,
      });

      const success = await SubscriptionManager.purchasePackage(pkg);

      if (success) {
        addPackageBreadcrumb("subscription", "Purchase success", {
          packageId: pkg.identifier,
          productId,
          userId,
        });
        // Credits will be initialized by CustomerInfoListener
      } else {
        addPackageBreadcrumb("subscription", "Purchase cancelled", {
          packageId: pkg.identifier,
          userId,
        });
      }

      return { success, productId };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });
        if (userId) {
          queryClient.invalidateQueries({
            queryKey: creditsQueryKeys.user(userId),
          });
        }
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
