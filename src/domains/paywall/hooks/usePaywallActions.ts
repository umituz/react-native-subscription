import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { useRestorePurchase } from "../../../revenuecat/presentation/hooks/useRestorePurchase";
import { useAuthAwarePurchase } from "../../../presentation/hooks/useAuthAwarePurchase";
import type { PurchaseSource } from "../../../domain/entities/Credits";

declare const __DEV__: boolean;

interface UsePaywallActionsProps {
  userId?: string;
  isAnonymous: boolean;
  source?: PurchaseSource;
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: string) => void;
  onAuthRequired?: () => void;
  onClose: () => void;
}

export const usePaywallActions = ({
  userId,
  isAnonymous,
  source,
  onPurchaseSuccess,
  onPurchaseError,
  onAuthRequired,
  onClose,
}: UsePaywallActionsProps) => {
  const { handlePurchase: authAwarePurchase } = useAuthAwarePurchase({ source });
  const { mutateAsync: restorePurchases } = useRestorePurchase(userId);

  const handlePurchase = useCallback(async (pkg: PurchasesPackage) => {
    if (isAnonymous) {
      if (__DEV__) console.log("[PaywallActions] Anonymous user, redirecting to auth");
      onAuthRequired?.();
      return;
    }

    try {
      if (__DEV__) console.log("[PaywallActions] Purchase started:", pkg.product.identifier);
      const res = await authAwarePurchase(pkg, source);
      if (res) {
        onPurchaseSuccess?.();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      onPurchaseError?.(message);
    }
  }, [isAnonymous, authAwarePurchase, source, onClose, onPurchaseSuccess, onPurchaseError, onAuthRequired]);

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

  return { handlePurchase, handleRestore };
};
