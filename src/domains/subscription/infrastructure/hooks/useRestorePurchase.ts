/**
 * Restore Purchase Hook
 * TanStack mutation for restoring previous purchases
 * Credits are initialized by CustomerInfoListener (not here to avoid duplicates)
 * Auth info automatically read from @umituz/react-native-auth
 */

import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
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
  const isAnonymous = useAuthStore(selectIsAnonymous);
  const queryClient = useQueryClient();
  const { showSuccess, showInfo, showError } = useAlert();

  return useMutation({
    mutationFn: async (): Promise<RestoreResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (isAnonymous) {
        throw new Error("Anonymous users cannot restore purchases");
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
      // Use map-based lookup - O(1) complexity
      const errorInfo = getErrorMessage(error);
      showError(errorInfo.title, errorInfo.message);
    },
  });
};
