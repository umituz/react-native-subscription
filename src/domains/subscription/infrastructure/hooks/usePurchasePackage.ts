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
} from "@umituz/react-native-auth";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { subscriptionStatusQueryKeys } from "../../presentation/useSubscriptionStatus";
import { creditsQueryKeys } from "../../../credits/presentation/useCredits";

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
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlert();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage): Promise<PurchaseMutationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const productId = pkg.product.identifier;
      const success = await SubscriptionManager.purchasePackage(pkg);

      return { success, productId };
    },
    onSuccess: (result) => {
      if (result.success) {
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
        }
      } else {
        showError("Purchase Failed", "Unable to complete purchase. Please try again.");
      }
    },
    onError: (error) => {
      let title = "Purchase Error";
      let message = "Unable to complete purchase. Please try again.";

      if (error instanceof Error) {
        // Handle RevenueCat-specific error codes
        const errorCode = (error as any).code;
        const errorMessage = error.message;

        switch (errorCode) {
          case "PURCHASE_CANCELLED":
            title = "Purchase Cancelled";
            message = "The purchase was cancelled.";
            break;
          case "PURCHASE_INVALID":
            title = "Invalid Purchase";
            message = "The purchase is invalid. Please contact support.";
            break;
          case "PRODUCT_ALREADY_OWNED":
            title = "Already Owned";
            message = "You already own this subscription. Please restore your purchase.";
            break;
          case "NETWORK_ERROR":
            title = "Network Error";
            message = "Please check your internet connection and try again.";
            break;
          case "INVALID_CREDENTIALS":
            title = "Configuration Error";
            message = "App is not configured correctly. Please contact support.";
            break;
          default:
            message = errorMessage || message;
        }
      }

      showError(title, message);
    },
  });
};
