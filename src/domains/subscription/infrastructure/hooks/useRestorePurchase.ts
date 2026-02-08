/**
 * Restore Purchase Hook
 * TanStack mutation for restoring previous purchases
 * Credits are initialized by CustomerInfoListener (not here to avoid duplicates)
 * Auth info automatically read from @umituz/react-native-auth
 */

import { useMutation, useQueryClient } from "@umituz/react-native-design-system";
import {
  useAuthStore,
  selectUserId,
} from "@umituz/react-native-auth";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { creditsQueryKeys } from "../../../credits/presentation/useCredits";

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
        queryClient.invalidateQueries({
          queryKey: SUBSCRIPTION_QUERY_KEYS.packages,
        });
        if (userId) {
          queryClient.invalidateQueries({
            queryKey: creditsQueryKeys.user(userId),
          });
        }
      }
    },
  });
};
