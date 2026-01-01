/**
 * Restore Purchase Hook
 * TanStack mutation for restoring previous purchases
 * Credits are initialized by CustomerInfoListener (not here to avoid duplicates)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { SUBSCRIPTION_QUERY_KEYS } from "./subscriptionQueryKeys";
import { creditsQueryKeys } from "../../../presentation/hooks/useCredits";

interface RestoreResult {
  success: boolean;
  productId: string | null;
}

/**
 * Restore previous purchases
 * Credits are initialized by CustomerInfoListener when entitlement becomes active
 */
export const useRestorePurchase = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<RestoreResult> => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      if (__DEV__) {
        console.log('[DEBUG useRestorePurchase] Starting restore:', { userId });
      }

      const result = await SubscriptionManager.restore();

      if (result.success) {
        if (__DEV__) {
          console.log('[DEBUG useRestorePurchase] Restore successful:', {
            userId,
            productId: result.productId,
          });
        }
        // Credits will be initialized by CustomerInfoListener
      } else {
        if (__DEV__) {
          console.log('[DEBUG useRestorePurchase] Restore failed:', { userId });
        }
      }

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
    onError: (error) => {
      if (__DEV__) {
        console.error('[DEBUG useRestorePurchase] Restore mutation failed:', {
          error,
          userId: userId ?? "ANONYMOUS",
        });
      }
    },
  });
};
