/**
 * Paywall Actions Hook
 *
 * Main entry point that combines purchase and restore handlers.
 * Handlers extracted to separate modules for better maintainability.
 */

import { useState, useRef, useMemo, useCallback } from "react";
import type { UsePaywallActionsParams } from "./usePaywallActions.types";
import { usePurchaseHandler } from "./usePaywallPurchase";
import { useRestoreHandler } from "./usePaywallRestore";
import { createLogger } from "../../../shared/utils/logger";

const logger = createLogger("usePaywallActions");

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

  // Extracted handlers
  const handlePurchase = usePurchaseHandler({
    selectedPlanId,
    isProcessingRef,
    callbacksRef,
  });

  const handleRestore = useRestoreHandler({
    isProcessingRef,
    callbacksRef,
  });

  // Reset state - memoized with useCallback to prevent infinite loops
  const resetState = useCallback(() => {
    logger.debug("Resetting state");
    setSelectedPlanId(null);
    setIsProcessing(false);
  }, []);

  // Return API
  return useMemo(() => ({
    selectedPlanId,
    setSelectedPlanId,
    isProcessing,
    handlePurchase,
    handleRestore,
    resetState,
  }), [selectedPlanId, isProcessing, handlePurchase, handleRestore, resetState]);
}
