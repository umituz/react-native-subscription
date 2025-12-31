import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useLocalization } from "@umituz/react-native-localization";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "../usePremium";
import { usePaywallRefs } from "./usePaywallRefs";
import type {
  PurchaseSource,
  PaywallOperationsProps,
  PaywallOperationsResult,
} from "./types";

const RERENDER_DELAY_MS = 100;

export function usePaywallOperations({
  userId,
  isAnonymous,
  onPaywallClose,
  onPurchaseSuccess,
  onAuthRequired,
}: PaywallOperationsProps): PaywallOperationsResult {
  const { t } = useLocalization();
  const { purchasePackage, restorePurchase, closePaywall } = usePremium(userId);

  const [pendingPackage, setPendingPackage] = useState<PurchasesPackage | null>(null);
  const [pendingSource, setPendingSource] = useState<PurchaseSource>(null);

  const refs = usePaywallRefs({
    userId,
    isAnonymous,
    purchasePackage,
    closePaywall,
    onPurchaseSuccess,
  });

  const isAuthenticated = useCallback((): boolean => {
    return !!refs.userIdRef.current && !refs.isAnonymousRef.current;
  }, [refs]);

  const showError = useCallback(() => {
    Alert.alert(t("premium.purchaseError"), t("premium.purchaseErrorMessage"));
  }, [t]);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      if (!isAuthenticated()) {
        setPendingPackage(pkg);
        setPendingSource("postOnboarding");
        onAuthRequired?.();
        onPaywallClose?.();
        return false;
      }
      const success = await purchasePackage(pkg);
      if (success) onPurchaseSuccess?.();
      else showError();
      return success;
    },
    [isAuthenticated, purchasePackage, onPurchaseSuccess, onPaywallClose, onAuthRequired, showError]
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    const success = await restorePurchase();
    Alert.alert(
      success ? t("premium.restoreSuccess") : t("premium.restoreError"),
      success ? t("premium.restoreMessage") : t("premium.restoreErrorMessage")
    );
    if (success) onPurchaseSuccess?.();
    return success;
  }, [restorePurchase, onPurchaseSuccess, t]);

  const handleInAppPurchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      if (!isAuthenticated()) {
        setPendingPackage(pkg);
        setPendingSource("inApp");
        onAuthRequired?.();
        return false;
      }
      const success = await purchasePackage(pkg);
      if (success) closePaywall();
      else showError();
      return success;
    },
    [isAuthenticated, purchasePackage, closePaywall, onAuthRequired, showError]
  );

  const handleInAppRestore = useCallback(async (): Promise<boolean> => {
    const success = await restorePurchase();
    Alert.alert(
      success ? t("premium.restoreSuccess") : t("premium.restoreError"),
      success ? t("premium.restoreMessage") : t("premium.restoreErrorMessage")
    );
    if (success) closePaywall();
    return success;
  }, [restorePurchase, closePaywall, t]);

  const completePendingPurchase = useCallback(async (): Promise<boolean> => {
    if (!pendingPackage) {
      if (__DEV__) console.log("[usePaywallOperations] No pending package");
      return false;
    }

    const pkg = pendingPackage;
    const source = pendingSource;
    setPendingPackage(null);
    setPendingSource(null);

    await new Promise((resolve) => setTimeout(resolve, RERENDER_DELAY_MS));

    if (__DEV__) {
      console.log("[usePaywallOperations] Completing:", pkg.identifier, source);
    }

    const success = await refs.purchasePackageRef.current(pkg);

    if (success) {
      source === "inApp"
        ? refs.closePaywallRef.current()
        : refs.onPurchaseSuccessRef.current?.();
    } else {
      showError();
    }
    return success;
  }, [pendingPackage, pendingSource, refs, showError]);

  const clearPendingPackage = useCallback(() => {
    setPendingPackage(null);
    setPendingSource(null);
  }, []);

  return {
    pendingPackage,
    handlePurchase,
    handleRestore,
    handleInAppPurchase,
    handleInAppRestore,
    completePendingPurchase,
    clearPendingPackage,
  };
}
