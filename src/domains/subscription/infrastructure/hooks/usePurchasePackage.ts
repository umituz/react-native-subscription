import { useMutation, useQueryClient } from "@umituz/react-native-design-system/tanstack";
import type { PurchasesPackage } from "react-native-purchases";
import { useAlert } from "@umituz/react-native-design-system/molecules";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { getErrorMessage } from "../../../revenuecat/core/errors/RevenueCatErrorHandler";

interface PurchaseMutationResult {
  success: boolean;
  productId: string;
}

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
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log(`[Purchase] Initializing and purchasing. User: ${userId}`);
      }

      const success = await SubscriptionManager.purchasePackage(pkg, userId);

      return { success, productId };
    },
    onSuccess: (result) => {
      if (result.success) {
        showSuccess("Purchase Successful", "Your subscription is now active!");

        // Invalidate packages cache (no event listener for packages)
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.packages });

        // Credits and subscription status are invalidated via events:
        // - CREDITS_UPDATED event (SubscriptionSyncProcessor → useCredits)
        // - PREMIUM_STATUS_CHANGED event (SubscriptionSyncProcessor → useSubscriptionStatus)
        // No manual invalidation needed here
      } else {
        showError("Purchase Failed", "Unable to complete purchase. Please try again.");
      }
    },
    onError: (error) => {
      const errorInfo = getErrorMessage(error);

      if (!errorInfo.shouldShowAlert) {
        return;
      }

      showError(errorInfo.title, errorInfo.message);
    },
  });
};
