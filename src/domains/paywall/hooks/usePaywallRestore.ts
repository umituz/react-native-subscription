/**
 * Paywall Restore Handler
 *
 * Extracted restore logic from usePaywallActions for better modularity.
 */

import { useCallback } from "react";
import type { UsePaywallActionsParams } from "./usePaywallActions.types";
import { usePremiumVerification } from "./usePaywallActions.utils";

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

    if (__DEV__) {
      console.log('[useRestoreHandler] 🔄 Starting restore');
    }

    try {
      const success = await callbacksRef.current.restorePurchase();

      if (__DEV__) {
        console.log('[useRestoreHandler] ✅ Restore completed', { success });
      }

      let isActuallySuccessful = success === true;

      if (success === undefined) {
        isActuallySuccessful = await verifyPremiumStatus();
      }

      if (isActuallySuccessful) {
        if (__DEV__) {
          console.log('[useRestoreHandler] 🎉 Restore successful, closing paywall');
        }
        callbacksRef.current.onPurchaseSuccess?.();
        callbacksRef.current.onClose?.();
      } else {
        if (__DEV__) {
          console.warn('[useRestoreHandler] ⚠️ Restore did not indicate success');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[useRestoreHandler] ❌ Restore error:', error);
      }
      callbacksRef.current.onPurchaseError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [verifyPremiumStatus, callbacksRef, isProcessingRef]);

  return handleRestore;
}
