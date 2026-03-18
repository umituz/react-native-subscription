import { useMutation } from "@umituz/react-native-design-system/tanstack";
import type { PurchasesPackage } from "react-native-purchases";
import { useAlert } from "@umituz/react-native-design-system/molecules";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { getErrorMessage } from "../../../revenuecat/core/errors/RevenueCatErrorHandler";

interface PurchaseMutationResult {
  success: boolean;
  productId: string;
}

export const usePurchasePackage = () => {
  const userId = useAuthStore(selectUserId);
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
