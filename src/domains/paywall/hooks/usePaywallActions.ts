/**
 * usePaywallActions Hook
 * Encapsulates purchase and restore flow for the paywall.
 */
import { useState, useCallback } from "react";
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
  const isGlobalPurchasing = usePurchaseLoadingStore((state) => state.isPurchasing);

  const isProcessing = isLocalProcessing || isGlobalPurchasing;

  const handlePurchase = useCallback(async () => {
    // If no plan selected, use the first available one as fallback or return
    const planId = selectedPlanId || (packages.length > 0 ? packages[0]?.product.identifier : null);
    
    if (!planId || !onPurchase || isProcessing) {
        if (!planId && onAuthRequired) onAuthRequired();
        return;
    }

    setIsLocalProcessing(true);
    // Map PurchaseSource to store's expected "manual" | "auto-execution"
    startPurchase(planId, "manual");

    try {
      const pkg = packages.find((p) => p.product.identifier === planId);
      if (pkg) {
        const success = await onPurchase(pkg);
        if (success !== false) {
          onPurchaseSuccess?.();
          onClose?.(); // Close on success if provided
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onPurchaseError?.(err);
      if (__DEV__) {
        console.error("[usePaywallActions] Purchase failed:", err);
      }
    } finally {
      setIsLocalProcessing(false);
      endPurchase();
    }
  }, [selectedPlanId, packages, onPurchase, isProcessing, startPurchase, endPurchase, onPurchaseSuccess, onPurchaseError, onAuthRequired, onClose]);

  const handleRestore = useCallback(async () => {
    if (!onRestore || isProcessing) return;

    setIsLocalProcessing(true);
    try {
      const success = await onRestore();
      if (success !== false) {
        onPurchaseSuccess?.();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onPurchaseError?.(err);
    } finally {
      setIsLocalProcessing(false);
    }
  }, [onRestore, isProcessing, onPurchaseSuccess, onPurchaseError]);

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
