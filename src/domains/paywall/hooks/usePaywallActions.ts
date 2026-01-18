import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { useRestorePurchase } from "../../../revenuecat/presentation/hooks/useRestorePurchase";
import { useAuthAwarePurchase } from "../../../presentation/hooks/useAuthAwarePurchase";
import type { PurchaseSource } from "../../../domain/entities/Credits";

declare const __DEV__: boolean;

interface UsePaywallActionsProps {
  source?: PurchaseSource;
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: string) => void;
  onAuthRequired?: () => void;
  onClose: () => void;
}

export const usePaywallActions = ({
  source,
  onPurchaseSuccess,
  onPurchaseError,
  onAuthRequired: _onAuthRequired,
  onClose,
}: UsePaywallActionsProps) => {
  const { handlePurchase: authAwarePurchase } = useAuthAwarePurchase({ source });
  const { mutateAsync: restorePurchases } = useRestorePurchase();

  const handlePurchase = useCallback(async (pkg: PurchasesPackage) => {
    try {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[PaywallActions] Purchase started:", pkg.product.identifier);
      }
      const res = await authAwarePurchase(pkg, source);
      if (res) {
        onPurchaseSuccess?.();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      onPurchaseError?.(message);
    }
  }, [authAwarePurchase, source, onClose, onPurchaseSuccess, onPurchaseError]);

  const handleRestore = useCallback(async () => {
    try {
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
