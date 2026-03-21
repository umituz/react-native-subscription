/**
 * Paywall Purchase Handler
 *
 * Extracted purchase logic from usePaywallActions for better modularity.
 */

import { useCallback } from "react";
import type { UsePaywallActionsParams } from "./usePaywallActions.types";
import { usePremiumVerification } from "./usePaywallActions.utils";
import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("usePurchaseHandler");

interface UsePurchaseHandlerParams {
  selectedPlanId: string | null;
  isProcessingRef: React.MutableRefObject<boolean>;
  callbacksRef: React.MutableRefObject<UsePaywallActionsParams>;
}

/**
 * Hook to handle purchase operations.
 * Extracted for better testability and modularity.
 */
export function usePurchaseHandler({
  selectedPlanId,
  isProcessingRef,
  callbacksRef,
}: UsePurchaseHandlerParams) {
  const { verifyPremiumStatus } = usePremiumVerification();

  const handlePurchase = useCallback(async () => {
    const currentSelectedId = selectedPlanId;
    if (!currentSelectedId) return;
    if (isProcessingRef.current) return;

    const pkg = callbacksRef.current.packages?.find((p) => p.product.identifier === currentSelectedId);
    if (!pkg) {
      callbacksRef.current.onPurchaseError?.(new Error(`Package not found: ${currentSelectedId}`));
      return;
    }

    logger.debug("Starting purchase", {
      productId: pkg.product.identifier,
    });

    try {
      const success = await callbacksRef.current.purchasePackage(pkg);

      logger.debug("Purchase completed", { success });

      let isActuallySuccessful = success === true;

      if (success === undefined) {
        isActuallySuccessful = await verifyPremiumStatus();
      }

      if (isActuallySuccessful) {
        logger.debug("Purchase successful, closing paywall");
        callbacksRef.current.onPurchaseSuccess?.();
        callbacksRef.current.onClose?.();
      } else {
        logger.warn("Purchase did not indicate success");
      }
    } catch (error) {
      logger.error("Purchase error", error);
      callbacksRef.current.onPurchaseError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [selectedPlanId, verifyPremiumStatus, callbacksRef, isProcessingRef]);

  return handlePurchase;
}
