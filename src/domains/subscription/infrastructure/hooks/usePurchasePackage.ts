/**
 * Purchase Package Hook
 * TanStack mutation for purchasing subscription packages
 * Credits are initialized by CustomerInfoListener (not here to avoid duplicates)
 * Auth info automatically read from @umituz/react-native-auth
 */

import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import Purchases, { type PurchasesPackage } from "react-native-purchases";
import { useAlert } from "@umituz/react-native-design-system";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { subscriptionStatusQueryKeys } from "../../presentation/useSubscriptionStatus";
import { creditsQueryKeys } from "../../../credits/presentation/creditsQueryKeys";
import { ERROR_MESSAGES } from "../../core/RevenueCatConstants";
import type { RevenueCatPurchaseErrorInfo } from "../../core/RevenueCatTypes";

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
        // Type assertion for RevenueCat error
        const rcError = error as RevenueCatPurchaseErrorInfo;
        const errorCode = rcError.code || rcError.readableErrorCode;

        // Get user-friendly message from constants if available
        if (errorCode && errorCode in ERROR_MESSAGES) {
          const errorInfo = ERROR_MESSAGES[errorCode];
          title = errorInfo.title;
          message = errorInfo.message;
        } else {
          // Fallback to specific error code checks using Purchases enum
          const code = errorCode;

          if (code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
            return; // Don't show error for user cancellation
          } else if (code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) {
            title = "Purchase Not Allowed";
            message = "In-app purchases are disabled on this device.";
          } else if (code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR) {
            title = "Invalid Purchase";
            message = "The purchase is invalid. Please contact support.";
          } else if (code === Purchases.PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
            title = "Already Purchased";
            message = "You already own this subscription. Restoring...";
          } else if (code === Purchases.PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR) {
            title = "Product Unavailable";
            message = "This product is not available for purchase.";
          } else if (code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
            title = "Network Error";
            message = "Please check your internet connection and try again.";
          } else if (code === Purchases.PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR) {
            title = "Receipt Already Used";
            message = "This receipt is already associated with another account.";
          } else if (code === Purchases.PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR) {
            title = "Configuration Error";
            message = "App is not configured correctly. Please contact support.";
          } else if (code === Purchases.PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR) {
            title = "Server Error";
            message = "The server returned an unexpected response. Please try again later.";
          } else if (code === Purchases.PURCHASES_ERROR_CODE.CONFIGURATION_ERROR) {
            title = "Configuration Error";
            message = "RevenueCat is not configured correctly. Please contact support.";
          } else {
            // Use error message if no specific code matched
            message = error.message || message;
          }
        }
      }

      showError(title, message);
    },
  });
};
