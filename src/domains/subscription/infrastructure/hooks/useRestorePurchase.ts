import { useMutation, useQueryClient } from "@umituz/react-native-design-system/tanstack";
import { useAlert } from "@umituz/react-native-design-system/molecules";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { getErrorMessage } from "../../../revenuecat/core/errors/RevenueCatErrorHandler";

interface RestoreResult {
  success: boolean;
  productId: string | null;
}

export const useRestorePurchase = () => {
  const userId = useAuthStore(selectUserId);
  const queryClient = useQueryClient();
  const { showSuccess, showInfo, showError } = useAlert();

  return useMutation({
    mutationFn: async (): Promise<RestoreResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const result = await SubscriptionManager.restore(userId);
      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate packages cache (no event listener for packages)
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.packages });

        // Credits and subscription status are invalidated via events:
        // - CREDITS_UPDATED event (SubscriptionSyncProcessor → useCredits)
        // - PREMIUM_STATUS_CHANGED event (SubscriptionSyncProcessor → useSubscriptionStatus)
        // No manual invalidation needed here

        if (result.productId) {
          showSuccess("Restore Successful", "Your subscription has been restored!");
        } else {
          showInfo("No Subscriptions Found", "No active subscriptions found to restore.");
        }
      }
    },
    onError: (error) => {
      const errorInfo = getErrorMessage(error);
      showError(errorInfo.title, errorInfo.message);
    },
  });
};
