/**
 * Purchase Package Hook
 * TanStack mutation for purchasing subscription packages
 * Credits are initialized by CustomerInfoListener (not here to avoid duplicates)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PurchasesPackage } from "react-native-purchases";
import { useAlert } from "@umituz/react-native-design-system";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { creditsQueryKeys } from "../../../presentation/hooks/useCredits";

declare const __DEV__: boolean;

export interface PurchaseResult {
  success: boolean;
  productId: string;
}


/**
 * Purchase a subscription package
 * Credits are initialized by CustomerInfoListener when entitlement becomes active
 */
export const usePurchasePackage = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlert();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const productId = pkg.product.identifier;

      if (__DEV__) {
        console.log('[DEBUG usePurchasePackage] Starting purchase:', {
          packageId: pkg.identifier,
          productId,
          userId,
        });
      }

      const success = await SubscriptionManager.purchasePackage(pkg);

      if (__DEV__) {
        console.log('[DEBUG usePurchasePackage] Purchase result:', {
          success,
          packageId: pkg.identifier,
          productId,
          userId,
        });
      }

      return { success, productId };
    },
    onSuccess: (result) => {
      if (result.success) {
        if (__DEV__) {
          console.log('[DEBUG usePurchasePackage] onSuccess - invalidating queries');
        }
        showSuccess("Purchase Successful", "Your subscription is now active!");
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });
        if (userId) {
          queryClient.invalidateQueries({
            queryKey: creditsQueryKeys.user(userId),
          });
        }
      } else {
        if (__DEV__) {
          console.log('[DEBUG usePurchasePackage] onSuccess but result.success=false');
        }
        showError("Purchase Failed", "Unable to complete purchase. Please try again.");
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('[DEBUG usePurchasePackage] onError:', {
          error,
          userId: userId ?? "ANONYMOUS",
        });
      }
      const message = error instanceof Error ? error.message : "An error occurred";
      showError("Purchase Error", message);
    },
  });
};
