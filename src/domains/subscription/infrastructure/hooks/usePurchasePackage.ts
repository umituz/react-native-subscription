/**
 * Purchase Package Hook
 * TanStack mutation for purchasing subscription packages
 * Credits are initialized by CustomerInfoListener (not here to avoid duplicates)
 * Auth info automatically read from @umituz/react-native-auth
 */

import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { useAlert } from "@umituz/react-native-design-system";
import {
  useAuthStore,
  selectUserId,
  selectIsAnonymous,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { subscriptionStatusQueryKeys } from "../../presentation/useSubscriptionStatus";
import { creditsQueryKeys } from "../../../credits/presentation/creditsQueryKeys";
import { getErrorMessage } from "../../../revenuecat/core/errors";

declare const __DEV__: boolean;

/** Purchase mutation result - simplified for presentation layer */
export interface PurchaseMutationResult {
  success: boolean;
  productId: string;
}


/**
 * Purchase a subscription package
 * Credits are initialized by CustomerInfoListener when entitlement becomes active
 * Auth info automatically read from auth store
 */
export const usePurchasePackage = () => {
  const userId = useAuthStore(selectUserId);
  const isAnonymous = useAuthStore(selectIsAnonymous);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlert();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage): Promise<PurchaseMutationResult> => {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[Purchase] ========================================");
        console.log("[Purchase] mutationFn called:", {
          productId: pkg.product.identifier,
          userId,
          isAnonymous,
        });
      }

      if (!userId) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[Purchase] ERROR: User not authenticated");
        }
        throw new Error("User not authenticated");
      }

      if (isAnonymous) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[Purchase] ERROR: Anonymous users cannot purchase");
        }
        throw new Error("Anonymous users cannot purchase subscriptions");
      }

      const productId = pkg.product.identifier;
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[Purchase] Calling SubscriptionManager.purchasePackage()");
      }

      const success = await SubscriptionManager.purchasePackage(pkg);

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[Purchase] Purchase completed:", { success, productId });
      }

      return { success, productId };
    },
    onSuccess: (result) => {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[Purchase] onSuccess called:", result);
      }

      if (result.success) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[Purchase] ✅ Purchase successful! Invalidating queries...");
        }
        showSuccess("Purchase Successful", "Your subscription is now active!");
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });
        if (userId) {
          queryClient.invalidateQueries({
            queryKey: subscriptionStatusQueryKeys.user(userId),
          });
          queryClient.invalidateQueries({
            queryKey: creditsQueryKeys.user(userId),
          });
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log("[Purchase] Queries invalidated - credits should reload now");
          }
        }
      } else {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[Purchase] ❌ Purchase failed");
        }
        showError("Purchase Failed", "Unable to complete purchase. Please try again.");
      }
    },
    onError: (error) => {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[Purchase] onError called:", error);
      }

      // Use map-based lookup - O(1) complexity
      const errorInfo = getErrorMessage(error);

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[Purchase] Error info:", errorInfo);
      }

      // Don't show alert for user cancellation
      if (!errorInfo.shouldShowAlert) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[Purchase] User cancelled - not showing alert");
        }
        return;
      }

      showError(errorInfo.title, errorInfo.message);
    },
  });
};
