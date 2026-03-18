import { useState, useCallback, useRef, useMemo } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import type { PurchaseSource } from "../../subscription/core/SubscriptionConstants";
import { useSubscriptionStatus } from "../../subscription/presentation/useSubscriptionStatus";
import { useCredits } from "../../credits/presentation/useCredits";

interface UsePaywallActionsParams {
  packages?: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  source?: PurchaseSource;
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

  const { refetch: refetchStatus } = useSubscriptionStatus();
  const { refetch: refetchCredits } = useCredits();

  const purchasePackageRef = useRef(purchasePackage);
  const restorePurchaseRef = useRef(restorePurchase);
  const onPurchaseSuccessRef = useRef(onPurchaseSuccess);
  const onPurchaseErrorRef = useRef(onPurchaseError);
  const onAuthRequiredRef = useRef(onAuthRequired);
  const onCloseRef = useRef(onClose);
  const packagesRef = useRef(packages);

  purchasePackageRef.current = purchasePackage;
  restorePurchaseRef.current = restorePurchase;
  onPurchaseSuccessRef.current = onPurchaseSuccess;
  onPurchaseErrorRef.current = onPurchaseError;
  onAuthRequiredRef.current = onAuthRequired;
  onCloseRef.current = onClose;
  packagesRef.current = packages;

  const handlePurchase = useCallback(async () => {
    const currentSelectedId = selectedPlanId;
    if (!currentSelectedId) return;

    if (isProcessingRef.current) return;

    const pkg = packagesRef.current.find((p) => p.product.identifier === currentSelectedId);
    if (!pkg) {
      onPurchaseErrorRef.current?.(new Error(`Package not found: ${currentSelectedId}`));
      return;
    }

    if (__DEV__) {
      console.log('[usePaywallActions] 🛒 Starting purchase', {
        productId: pkg.product.identifier,
      });
    }

    setIsProcessing(true);

    try {
      const success = await purchasePackageRef.current(pkg);

      if (__DEV__) {
        console.log('[usePaywallActions] ✅ Purchase completed', { success });
      }

      let isActuallySuccessful = success === true;

      if (success === undefined) {
        if (__DEV__) {
          console.log('[usePaywallActions] 🔍 Checking premium status as fallback...');
        }

        const [statusResult, creditsResult] = await Promise.all([
          refetchStatus(),
          refetchCredits()
        ]);

        const isSubscriptionPremium = statusResult.data?.isPremium ?? false;
        const isCreditsPremium = creditsResult.data?.isPremium ?? false;

        isActuallySuccessful = isSubscriptionPremium || isCreditsPremium;

        if (__DEV__) {
          console.log('[usePaywallActions] 📊 Fallback check result:', {
            isSubscriptionPremium,
            isCreditsPremium,
            isActuallySuccessful
          });
        }
      }

      if (isActuallySuccessful) {
        if (__DEV__) {
          console.log('[usePaywallActions] 🎉 Purchase successful, closing paywall');
        }
        onPurchaseSuccessRef.current?.();
        onCloseRef.current?.();
      } else {
        if (__DEV__) {
          console.warn('[usePaywallActions] ⚠️ Purchase did not indicate success');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[usePaywallActions] ❌ Purchase error:', error);
      }
      onPurchaseErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlanId, refetchStatus, refetchCredits]);

  const handleRestore = useCallback(async () => {
    if (isProcessingRef.current) return;

    if (__DEV__) {
      console.log('[usePaywallActions] 🔄 Starting restore');
    }

    setIsProcessing(true);
    try {
      const success = await restorePurchaseRef.current();

      if (__DEV__) {
        console.log('[usePaywallActions] ✅ Restore completed', { success });
      }

      let isActuallySuccessful = success === true;

      if (success === undefined) {
        const [statusResult, creditsResult] = await Promise.all([
          refetchStatus(),
          refetchCredits()
        ]);
        isActuallySuccessful = (statusResult.data?.isPremium ?? false) || (creditsResult.data?.isPremium ?? false);
      }

      if (isActuallySuccessful) {
        if (__DEV__) {
          console.log('[usePaywallActions] 🎉 Restore successful, closing paywall');
        }
        onPurchaseSuccessRef.current?.();
        onCloseRef.current?.();
      } else {
        if (__DEV__) {
          console.warn('[usePaywallActions] ⚠️ Restore did not indicate success');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[usePaywallActions] ❌ Restore error:', error);
      }
      onPurchaseErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsProcessing(false);
    }
  }, [refetchStatus, refetchCredits]);

  const resetState = useCallback(() => {
    if (__DEV__) {
      console.log('[usePaywallActions] 🧹 Resetting state');
    }
    setSelectedPlanId(null);
    setIsProcessing(false);
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
