import { useState, useCallback, useRef, useMemo } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePurchaseLoadingStore, selectIsPurchasing } from "../../subscription/presentation/stores/purchaseLoadingStore";
import type { PurchaseSource } from "../../subscription/core/SubscriptionConstants";

interface UsePaywallActionsParams {
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

  // Use optimized selector for global purchasing state
  const isGlobalPurchasing = usePurchaseLoadingStore(selectIsPurchasing);
  
  // Combine processing states
  const isProcessing = isLocalProcessing || isGlobalPurchasing;
  
  // Use ref for isProcessing to keep callbacks stable without re-creating them
  const isProcessingRef = useRef(isProcessing);
  isProcessingRef.current = isProcessing;

  const { startPurchase, endPurchase } = usePurchaseLoadingStore();

  const onPurchaseRef = useRef(onPurchase);
  const onRestoreRef = useRef(onRestore);
  const onPurchaseSuccessRef = useRef(onPurchaseSuccess);
  const onPurchaseErrorRef = useRef(onPurchaseError);
  const onAuthRequiredRef = useRef(onAuthRequired);
  const onCloseRef = useRef(onClose);
  const packagesRef = useRef(packages);

  // Update refs in render body — always in sync
  onPurchaseRef.current = onPurchase;
  onRestoreRef.current = onRestore;
  onPurchaseSuccessRef.current = onPurchaseSuccess;
  onPurchaseErrorRef.current = onPurchaseError;
  onAuthRequiredRef.current = onAuthRequired;
  onCloseRef.current = onClose;
  packagesRef.current = packages;

  const handlePurchase = useCallback(async () => {
    // Access current state via refs to keep callback stable
    const currentSelectedId = selectedPlanId;
    if (!currentSelectedId) return;

    if (!onPurchaseRef.current) {
      onPurchaseErrorRef.current?.(new Error("Purchase handler not configured"));
      return;
    }

    if (isProcessingRef.current) return;

    const pkg = packagesRef.current.find((p) => p.product.identifier === currentSelectedId);

    if (!pkg) {
      onPurchaseErrorRef.current?.(new Error(`Package not found: ${currentSelectedId}`));
      return;
    }

    if (__DEV__) {
      console.log('[usePaywallActions] Starting purchase', {
        productId: pkg.product.identifier,
        hasOnClose: !!onCloseRef.current,
        hasOnSuccess: !!onPurchaseSuccessRef.current,
      });
    }

    setIsLocalProcessing(true);
    startPurchase(currentSelectedId, "manual");

    try {
      const success = await onPurchaseRef.current(pkg);
      if (__DEV__) {
        console.log('[usePaywallActions] Purchase completed', { success });
      }
      if (success === true) {
        if (__DEV__) {
          console.log('[usePaywallActions] Purchase successful, calling onPurchaseSuccess and onClose');
        }
        onPurchaseSuccessRef.current?.();
        // Always close paywall on successful purchase
        onCloseRef.current?.();
      } else {
        if (__DEV__) {
          console.warn('[usePaywallActions] Purchase returned false, not closing');
        }
      }
    } catch (error) {
      onPurchaseErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLocalProcessing(false);
      endPurchase(currentSelectedId);
    }
  }, [selectedPlanId, startPurchase, endPurchase]); // Only depend on state that must trigger re-creation if changed

  const handleRestore = useCallback(async () => {
    if (!onRestoreRef.current) {
      onPurchaseErrorRef.current?.(new Error("Restore handler not configured"));
      return;
    }

    if (isProcessingRef.current) return;

    if (__DEV__) {
      console.log('[usePaywallActions] Starting restore', {
        hasOnClose: !!onCloseRef.current,
        hasOnSuccess: !!onPurchaseSuccessRef.current,
      });
    }

    setIsLocalProcessing(true);
    try {
      const success = await onRestoreRef.current();
      if (__DEV__) {
        console.log('[usePaywallActions] Restore completed', { success });
      }
      if (success === true) {
        if (__DEV__) {
          console.log('[usePaywallActions] Restore successful, calling onPurchaseSuccess and onClose');
        }
        onPurchaseSuccessRef.current?.();
        onCloseRef.current?.();
      } else {
        if (__DEV__) {
          console.warn('[usePaywallActions] Restore returned false, not closing');
        }
      }
    } catch (error) {
      onPurchaseErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLocalProcessing(false);
    }
  }, []); // Truly stable callback

  const resetState = useCallback(() => {
    setSelectedPlanId(null);
    setIsLocalProcessing(false);
  }, []);

  return useMemo(() => ({
    selectedPlanId,
    setSelectedPlanId,
    isProcessing,
    handlePurchase,
    handleRestore,
    resetState,
  }), [selectedPlanId, isProcessing, handlePurchase, handleRestore, resetState]);
}
