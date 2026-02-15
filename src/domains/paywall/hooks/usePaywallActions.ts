/**
 * usePaywallActions Hook
 * Encapsulates purchase and restore flow for the paywall.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePurchaseLoadingStore } from "../../subscription/presentation/stores";
import type { PurchaseSource } from "../../subscription/core/SubscriptionConstants";

export interface UsePaywallActionsParams {
  packages?: PurchasesPackage[];
  onPurchase?: (pkg: PurchasesPackage) => Promise<void | boolean>;
  onRestore?: () => Promise<void | boolean>;
  source?: PurchaseSource;
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: Error | string) => void;
  onAuthRequired?: () => void;
  onClose?: () => void;
}

export function usePaywallActions({
  packages = [],
  onPurchase,
  onRestore,
  onPurchaseSuccess,
  onPurchaseError,
  onAuthRequired,
  onClose,
}: UsePaywallActionsParams) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);

  const { startPurchase, endPurchase } = usePurchaseLoadingStore();
  const isGlobalPurchasing = usePurchaseLoadingStore((state) => state.isPurchasing());

  const isProcessing = isLocalProcessing || isGlobalPurchasing;

  const onPurchaseRef = useRef(onPurchase);
  const onRestoreRef = useRef(onRestore);
  const onPurchaseSuccessRef = useRef(onPurchaseSuccess);
  const onPurchaseErrorRef = useRef(onPurchaseError);
  const onAuthRequiredRef = useRef(onAuthRequired);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onPurchaseRef.current = onPurchase;
    onRestoreRef.current = onRestore;
    onPurchaseSuccessRef.current = onPurchaseSuccess;
    onPurchaseErrorRef.current = onPurchaseError;
    onAuthRequiredRef.current = onAuthRequired;
    onCloseRef.current = onClose;
  });

  const handlePurchase = useCallback(async () => {
    if (!selectedPlanId || !onPurchaseRef.current || isProcessing) {
      if (!selectedPlanId && onAuthRequiredRef.current) {
        onAuthRequiredRef.current();
      }
      return;
    }

    setIsLocalProcessing(true);
    startPurchase(selectedPlanId, "manual");

    try {
      const pkg = packages.find((p) => p.product.identifier === selectedPlanId);

      if (pkg) {
        const success = await onPurchaseRef.current(pkg);

        if (success !== false) {
          onPurchaseSuccessRef.current?.();
          onCloseRef.current?.();
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onPurchaseErrorRef.current?.(err);
    } finally {
      setIsLocalProcessing(false);
      endPurchase(selectedPlanId);
    }
  }, [selectedPlanId, packages, isProcessing, startPurchase, endPurchase]);

  const handleRestore = useCallback(async () => {
    if (!onRestoreRef.current || isProcessing) return;

    setIsLocalProcessing(true);
    try {
      const success = await onRestoreRef.current();
      if (success !== false) {
        onPurchaseSuccessRef.current?.();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onPurchaseErrorRef.current?.(err);
    } finally {
      setIsLocalProcessing(false);
    }
  }, [isProcessing]);

  const resetState = useCallback(() => {
    setSelectedPlanId(null);
    setIsLocalProcessing(false);
  }, []);

  return {
    selectedPlanId,
    setSelectedPlanId,
    isProcessing,
    handlePurchase,
    handleRestore,
    resetState,
  };
}
