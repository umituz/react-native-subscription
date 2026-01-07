import { useCallback, useState } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePurchasePackage } from "../../../revenuecat/presentation/hooks/usePurchasePackage";
import { useRestorePurchase } from "../../../revenuecat/presentation/hooks/useRestorePurchase";

declare const __DEV__: boolean;

interface UsePaywallActionsProps {
  userId?: string;
  isAnonymous: boolean;
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
  const [pendingPackage, setPendingPackage] = useState<PurchasesPackage | null>(null);

  const handlePurchase = useCallback(async (pkg: PurchasesPackage) => {
    if (isAnonymous) {
      if (__DEV__) console.log("[PaywallActions] Anonymous user, storing package:", pkg.identifier);
      setPendingPackage(pkg);
      onAuthRequired?.();
      return;
    }

    try {
      if (__DEV__) console.log("[PaywallActions] Purchase started:", pkg.identifier);
      const res = await purchasePackage(pkg);
      if (res.success) {
        onPurchaseSuccess?.();
        onClose();
      }
    } catch (err: any) {
      onPurchaseError?.(err.message || String(err));
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
    } catch (err: any) {
      onPurchaseError?.(err.message || String(err));
    }
  }, [restorePurchases, onClose, onPurchaseSuccess, onPurchaseError]);

  return { handlePurchase, handleRestore, pendingPackage, setPendingPackage, purchasePackage };
};
