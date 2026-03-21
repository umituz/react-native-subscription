/**
 * Paywall Restore Handler
 *
 * Extracted restore logic from usePaywallActions for better modularity.
 */

import { useCallback } from "react";
import type { UsePaywallActionsParams } from "./usePaywallActions.types";
import { usePremiumVerification } from "./usePaywallActions.utils";
import { createLogger } from "../../../shared/utils/logger";

const logger = createLogger("useRestoreHandler");

interface UseRestoreHandlerParams {
  isProcessingRef: React.MutableRefObject<boolean>;
  callbacksRef: React.MutableRefObject<UsePaywallActionsParams>;
}

/**
 * Hook to handle restore operations.
 * Extracted for better testability and modularity.
 */
export function useRestoreHandler({
  isProcessingRef,
  callbacksRef,
}: UseRestoreHandlerParams) {
  const { verifyPremiumStatus } = usePremiumVerification();

  const handleRestore = useCallback(async () => {
    if (isProcessingRef.current) return;

    logger.debug("Starting restore");

    try {
      const success = await callbacksRef.current.restorePurchase();

      logger.debug("Restore completed", { success });

      let isActuallySuccessful = success === true;

      if (success === undefined) {
        isActuallySuccessful = await verifyPremiumStatus();
      }

      if (isActuallySuccessful) {
        logger.debug("Restore successful, closing paywall");
        callbacksRef.current.onPurchaseSuccess?.();
        callbacksRef.current.onClose?.();
      } else {
        logger.warn("Restore did not indicate success");
      }
    } catch (error) {
      logger.error("Restore error", error);
      callbacksRef.current.onPurchaseError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [verifyPremiumStatus, callbacksRef, isProcessingRef]);

  return handleRestore;
}
