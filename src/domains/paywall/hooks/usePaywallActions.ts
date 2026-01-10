import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePurchasePackage } from "../../../revenuecat/presentation/hooks/usePurchasePackage";
import { useRestorePurchase } from "../../../revenuecat/presentation/hooks/useRestorePurchase";

declare const __DEV__: boolean;

interface UsePaywallActionsProps {
  userId?: string;
  isAnonymous: boolean;
  source?: string;
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: string) => void;
  onAuthRequired?: () => void;
  onClose: () => void;
}

export const usePaywallActions = ({
  userId,
  isAnonymous,
  onPurchaseSuccess,
  onPurchaseError,
  onAuthRequired,
  onClose,
}: UsePaywallActionsProps) => {
  const { mutateAsync: purchasePackage } = usePurchasePackage(userId);
  const { mutateAsync: restorePurchases } = useRestorePurchase(userId);

  const handlePurchase = useCallback(async (pkg: PurchasesPackage) => {
    if (isAnonymous) {
      if (__DEV__) console.log("[PaywallActions] Anonymous user, redirecting to auth");
      onAuthRequired?.();
      return;
    }

    try {
      if (__DEV__) console.log("[PaywallActions] Purchase started:", pkg.product.identifier);
      const res = await purchasePackage(pkg);
      if (res.success) {
        onPurchaseSuccess?.();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      onPurchaseError?.(message);
    }
  }, [isAnonymous, purchasePackage, onClose, onPurchaseSuccess, onPurchaseError, onAuthRequired]);

  const handleRestore = useCallback(async () => {
    try {
      if (__DEV__) console.log("[PaywallActions] Restore started");
      const res = await restorePurchases();
      if (res.success) {
        onPurchaseSuccess?.();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      onPurchaseError?.(message);
    }
  }, [restorePurchases, onClose, onPurchaseSuccess, onPurchaseError]);

  return { handlePurchase, handleRestore, purchasePackage };
};
