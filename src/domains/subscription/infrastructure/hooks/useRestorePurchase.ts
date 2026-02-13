/**
 * Restore Purchase Hook
 * TanStack mutation for restoring previous purchases
 * Credits are initialized by CustomerInfoListener (not here to avoid duplicates)
 * Auth info automatically read from @umituz/react-native-auth
 */

import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import Purchases from "react-native-purchases";
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

interface RestoreResult {
  success: boolean;
  productId: string | null;
}

/**
 * Restore previous purchases
 * Credits are initialized by CustomerInfoListener when entitlement becomes active
 * Auth info automatically read from auth store
 */
export const useRestorePurchase = () => {
  const userId = useAuthStore(selectUserId);
  const queryClient = useQueryClient();
  const { showSuccess, showInfo, showError } = useAlert();

  return useMutation({
    mutationFn: async (): Promise<RestoreResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const result = await SubscriptionManager.restore();
      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refresh data
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

        // Show user feedback
        if (result.productId) {
          showSuccess("Restore Successful", "Your subscription has been restored!");
        } else {
          showInfo("No Subscriptions Found", "No active subscriptions found to restore.");
        }
      }
    },
    onError: (error) => {
      let title = "Restore Error";
      let message = "Unable to restore purchases. Please try again.";

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
          // Fallback to specific error code checks
          const code = errorCode;

          if (code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR) {
            title = "Network Error";
            message = "Please check your internet connection and try again.";
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
