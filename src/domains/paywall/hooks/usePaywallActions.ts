/**
 * Paywall Actions Hook
 *
 * Handles purchase and restore operations with premium verification.
 * Ref management and success checking extracted to utilities.
 */

import { useState, useCallback, useRef, useMemo } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremiumVerification } from "./usePaywallActions.utils";

interface UsePaywallActionsParams {
  packages?: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  source?: string; // PurchaseSource
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: Error | string) => void;
  onAuthRequired?: () => void;
  onClose?: () => void;
}

export function usePaywallActions({
  packages = [],
  purchasePackage,
  restorePurchase,
  onPurchaseSuccess,
  onPurchaseError,
  onAuthRequired,
  onClose,
}: UsePaywallActionsParams) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isProcessingRef = useRef(isProcessing);
  isProcessingRef.current = isProcessing;

  const { verifyPremiumStatus } = usePremiumVerification();

  // Ref management
  const callbacksRef = useRef({
    purchasePackage,
    restorePurchase,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    onClose,
    packages,
  });

  // Update refs
  callbacksRef.current = {
    purchasePackage,
    restorePurchase,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    onClose,
    packages,
  };

  // ─────────────────────────────────────────────────────────────
  // PURCHASE HANDLER
  // ─────────────────────────────────────────────────────────────

  const handlePurchase = useCallback(async () => {
    const currentSelectedId = selectedPlanId;
    if (!currentSelectedId) return;
    if (isProcessingRef.current) return;

    const pkg = callbacksRef.current.packages.find((p) => p.product.identifier === currentSelectedId);
    if (!pkg) {
      callbacksRef.current.onPurchaseError?.(new Error(`Package not found: ${currentSelectedId}`));
      return;
    }

    if (__DEV__) {
      console.log('[usePaywallActions] 🛒 Starting purchase', {
        productId: pkg.product.identifier,
      });
    }

    setIsProcessing(true);

    try {
      const success = await callbacksRef.current.purchasePackage(pkg);

      if (__DEV__) {
        console.log('[usePaywallActions] ✅ Purchase completed', { success });
      }

      let isActuallySuccessful = success === true;

      // Fallback verification if success is undefined
      if (success === undefined) {
        isActuallySuccessful = await verifyPremiumStatus();
      }

      if (isActuallySuccessful) {
        if (__DEV__) {
          console.log('[usePaywallActions] 🎉 Purchase successful, closing paywall');
        }
        callbacksRef.current.onPurchaseSuccess?.();
        callbacksRef.current.onClose?.();
      } else {
        if (__DEV__) {
          console.warn('[usePaywallActions] ⚠️ Purchase did not indicate success');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[usePaywallActions] ❌ Purchase error:', error);
      }
      callbacksRef.current.onPurchaseError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlanId, verifyPremiumStatus]);

  // ─────────────────────────────────────────────────────────────
  // RESTORE HANDLER
  // ─────────────────────────────────────────────────────────────

  const handleRestore = useCallback(async () => {
    if (isProcessingRef.current) return;

    if (__DEV__) {
      console.log('[usePaywallActions] 🔄 Starting restore');
    }

    setIsProcessing(true);

    try {
      const success = await callbacksRef.current.restorePurchase();

      if (__DEV__) {
        console.log('[usePaywallActions] ✅ Restore completed', { success });
      }

      let isActuallySuccessful = success === true;

      // Fallback verification if success is undefined
      if (success === undefined) {
        isActuallySuccessful = await verifyPremiumStatus();
      }

      if (isActuallySuccessful) {
        if (__DEV__) {
          console.log('[usePaywallActions] 🎉 Restore successful, closing paywall');
        }
        callbacksRef.current.onPurchaseSuccess?.();
        callbacksRef.current.onClose?.();
      } else {
        if (__DEV__) {
          console.warn('[usePaywallActions] ⚠️ Restore did not indicate success');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[usePaywallActions] ❌ Restore error:', error);
      }
      callbacksRef.current.onPurchaseError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsProcessing(false);
    }
  }, [verifyPremiumStatus]);

  // ─────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────

  const resetState = useCallback(() => {
    if (__DEV__) {
      console.log('[usePaywallActions] 🧹 Resetting state');
    }
    setSelectedPlanId(null);
    setIsProcessing(false);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────

  return useMemo(() => ({
    selectedPlanId,
    setSelectedPlanId,
    isProcessing,
    handlePurchase,
    handleRestore,
    resetState,
  }), [selectedPlanId, isProcessing, handlePurchase, handleRestore, resetState]);
}
