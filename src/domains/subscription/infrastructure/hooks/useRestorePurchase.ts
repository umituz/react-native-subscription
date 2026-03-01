import { useMutation, useQueryClient } from "@umituz/react-native-design-system/tanstack";
import { useAlert } from "@umituz/react-native-design-system/molecules";
import {
  useAuthStore,
  selectUserId,
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
