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
    console.log('🔵 [usePaywallActions] handlePurchase called', {
      selectedPlanId,
      packagesCount: packages.length,
      isProcessing,
      hasOnPurchase: !!onPurchaseRef.current
    });

    const planId = selectedPlanId || (packages.length > 0 ? packages[0]?.product.identifier : null);

    if (!planId || !onPurchaseRef.current || isProcessing) {
        console.log('⚠️ [usePaywallActions] Purchase blocked', {
          noPlanId: !planId,
          noCallback: !onPurchaseRef.current,
          isProcessing
        });
        if (!planId && onAuthRequiredRef.current) onAuthRequiredRef.current();
        return;
    }

    console.log('🟢 [usePaywallActions] Starting purchase', { planId });
    setIsLocalProcessing(true);
    startPurchase(planId, "manual");

    try {
      const pkg = packages.find((p) => p.product.identifier === planId);
      console.log('📦 [usePaywallActions] Package found:', !!pkg);

      if (pkg) {
        console.log('🚀 [usePaywallActions] Calling onPurchase callback');
        const success = await onPurchaseRef.current(pkg);
        console.log('✅ [usePaywallActions] onPurchase completed', { success });

        if (success !== false) {
          onPurchaseSuccessRef.current?.();
          onCloseRef.current?.();
        }
      }
    } catch (error) {
      console.error('❌ [usePaywallActions] Purchase error:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      onPurchaseErrorRef.current?.(err);
    } finally {
      console.log('🏁 [usePaywallActions] Purchase flow finished');
      setIsLocalProcessing(false);
      endPurchase(planId);
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
