/**
 * Pending Purchase Handler Hook
 * Automatically executes pending purchase after successful authentication
 */

import { useEffect } from "react";
import { usePendingPurchaseStore } from "../../infrastructure/stores/PendingPurchaseStore";
import { usePremium } from "./usePremium";

declare const __DEV__: boolean;

export interface UsePendingPurchaseHandlerParams {
  userId: string | undefined;
  isAuthenticated: boolean;
}

/**
 * Hook to handle pending purchases after authentication
 * Call this in app root after auth initialization
 */
export const usePendingPurchaseHandler = ({
  userId,
  isAuthenticated,
}: UsePendingPurchaseHandlerParams): void => {
  const {
    getPendingPurchase,
    clearPendingPurchase,
    hasPendingPurchase,
  } = usePendingPurchaseStore();
  const { purchasePackage } = usePremium();

  useEffect(() => {
    if (!isAuthenticated || !userId || !hasPendingPurchase()) {
      return;
    }

    const executePendingPurchase = async () => {
      const pending = getPendingPurchase();

      if (!pending) {
        return;
      }

      if (__DEV__) {
        console.log(
          "[usePendingPurchaseHandler] Executing pending purchase:",
          {
            packageId: pending.package.identifier,
            source: pending.source,
            selectedAt: new Date(pending.selectedAt).toISOString(),
          }
        );
      }

      try {
        await purchasePackage(pending.package);
      } catch (error) {
        if (__DEV__) {
          console.error(
            "[usePendingPurchaseHandler] Failed to execute pending purchase:",
            error
          );
        }
      } finally {
        clearPendingPurchase();
      }
    };

    void executePendingPurchase();
  }, [
    isAuthenticated,
    userId,
    hasPendingPurchase,
    getPendingPurchase,
    clearPendingPurchase,
    purchasePackage,
  ]);
};
