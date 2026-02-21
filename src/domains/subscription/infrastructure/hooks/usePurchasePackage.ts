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

interface PurchaseMutationResult {
  success: boolean;
  productId: string;
}

export const usePurchasePackage = () => {
  const userId = useAuthStore(selectUserId);
  const isAnonymous = useAuthStore(selectIsAnonymous);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlert();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage): Promise<PurchaseMutationResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (isAnonymous) {
        throw new Error("Anonymous users cannot purchase subscriptions");
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
      const errorInfo = getErrorMessage(error);

      if (!errorInfo.shouldShowAlert) {
        return;
      }

      showError(errorInfo.title, errorInfo.message);
    },
  });
};
