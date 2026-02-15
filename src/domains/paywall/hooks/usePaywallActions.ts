/**
 * usePaywallActions Hook
 * Encapsulates purchase and restore flow for the paywall.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePurchaseLoadingStore } from "../../subscription/presentation/stores";
import type { PurchaseSource } from "../../subscription/core/SubscriptionConstants";

declare const __DEV__: boolean;

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
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[usePaywallActions] handlePurchase called", {
        selectedPlanId,
        hasOnPurchase: !!onPurchaseRef.current,
        isProcessing,
        packagesCount: packages.length,
      });
    }

    if (!selectedPlanId) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn("[usePaywallActions] ❌ No plan selected");
      }
      return;
    }

    if (!onPurchaseRef.current) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.error("[usePaywallActions] ❌ No onPurchase callback provided");
      }
      const err = new Error("Purchase handler not configured");
      onPurchaseErrorRef.current?.(err);
      return;
    }

    if (isProcessing) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn("[usePaywallActions] ⚠️ Already processing, ignoring duplicate request");
      }
      return;
    }

    const pkg = packages.find((p) => p.product.identifier === selectedPlanId);

    if (!pkg) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.error("[usePaywallActions] ❌ Package not found", {
          selectedPlanId,
          availablePackages: packages.map(p => p.product.identifier),
        });
      }
      const err = new Error(`Package not found: ${selectedPlanId}`);
      onPurchaseErrorRef.current?.(err);
      return;
    }

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[usePaywallActions] ✅ Starting purchase", {
        productId: pkg.product.identifier,
        title: pkg.product.title,
      });
    }

    setIsLocalProcessing(true);
    startPurchase(selectedPlanId, "manual");

    try {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[usePaywallActions] 🚀 Calling onPurchase callback");
      }

      const success = await onPurchaseRef.current(pkg);

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[usePaywallActions] 📦 Purchase result:", { success, type: typeof success });
      }

      if (success === true) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[usePaywallActions] ✅ Purchase successful, calling success callbacks");
        }
        onPurchaseSuccessRef.current?.();
        onCloseRef.current?.();
      } else if (success === false) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.warn("[usePaywallActions] ⚠️ Purchase returned false (user cancelled or failed)");
        }
      } else {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.error("[usePaywallActions] ❌ Purchase returned unexpected value:", success);
        }
      }
    } catch (error) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.error("[usePaywallActions] ❌ Purchase error:", error);
      }
      const err = error instanceof Error ? error : new Error(String(error));
      onPurchaseErrorRef.current?.(err);
    } finally {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[usePaywallActions] 🏁 Purchase completed, cleaning up");
      }
      setIsLocalProcessing(false);
      endPurchase(selectedPlanId);
    }
  }, [selectedPlanId, packages, isProcessing, startPurchase, endPurchase]);

  const handleRestore = useCallback(async () => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[usePaywallActions] handleRestore called", {
        hasOnRestore: !!onRestoreRef.current,
        isProcessing,
      });
    }

    if (!onRestoreRef.current) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.error("[usePaywallActions] ❌ No onRestore callback provided");
      }
      const err = new Error("Restore handler not configured");
      onPurchaseErrorRef.current?.(err);
      return;
    }

    if (isProcessing) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn("[usePaywallActions] ⚠️ Already processing, ignoring restore request");
      }
      return;
    }

    setIsLocalProcessing(true);
    try {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[usePaywallActions] 🚀 Calling onRestore callback");
      }

      const success = await onRestoreRef.current();

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[usePaywallActions] 📦 Restore result:", { success, type: typeof success });
      }

      if (success === true) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[usePaywallActions] ✅ Restore successful");
        }
        onPurchaseSuccessRef.current?.();
      } else if (success === false) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.warn("[usePaywallActions] ⚠️ Restore returned false");
        }
      } else {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.error("[usePaywallActions] ❌ Restore returned unexpected value:", success);
        }
      }
    } catch (error) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.error("[usePaywallActions] ❌ Restore error:", error);
      }
      const err = error instanceof Error ? error : new Error(String(error));
      onPurchaseErrorRef.current?.(err);
    } finally {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[usePaywallActions] 🏁 Restore completed");
      }
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
