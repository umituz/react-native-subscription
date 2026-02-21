import { useCallback, useEffect, useRef } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";
import type { PurchaseSource } from "../core/SubscriptionConstants";
import { authPurchaseStateManager } from "../infrastructure/utils/authPurchaseState";

export const configureAuthProvider = (provider: import("../infrastructure/utils/authPurchaseState").PurchaseAuthProvider): void => {
  authPurchaseStateManager.configure(provider);
};

export const getSavedPurchase = (): { pkg: PurchasesPackage; source: PurchaseSource } | null => {
  return authPurchaseStateManager.getSavedPurchase();
};

export const clearSavedPurchase = (): void => {
  authPurchaseStateManager.clearSavedPurchase();
};

interface UseAuthAwarePurchaseParams {
  source?: PurchaseSource;
}

interface UseAuthAwarePurchaseResult {
  handlePurchase: (pkg: PurchasesPackage, source?: PurchaseSource) => Promise<boolean>;
  handleRestore: () => Promise<boolean>;
  executeSavedPurchase: () => Promise<boolean>;
}

export const useAuthAwarePurchase = (
  params?: UseAuthAwarePurchaseParams
): UseAuthAwarePurchaseResult => {
  const { purchasePackage, restorePurchase } = usePremium();
  const isExecutingSavedRef = useRef(false);

  const executeSavedPurchase = useCallback(async (): Promise<boolean> => {
    const saved = authPurchaseStateManager.getSavedPurchase();
    if (!saved) {
      return false;
    }

    try {
      const result = await purchasePackage(saved.pkg);
      if (result) {
        authPurchaseStateManager.clearSavedPurchase();
      }
      return result;
    } catch {
      authPurchaseStateManager.clearSavedPurchase();
      return false;
    }
  }, [purchasePackage]);

  useEffect(() => {
    const authProvider = authPurchaseStateManager.getProvider();
    if (!authProvider) return;

    const isAuth = authProvider.isAuthenticated();
    const hasSavedPurchase = !!authPurchaseStateManager.getSavedPurchase();

    if (isAuth && hasSavedPurchase && !isExecutingSavedRef.current) {
      isExecutingSavedRef.current = true;
      executeSavedPurchase().finally(() => {
        isExecutingSavedRef.current = false;
      });
    }
  }, [executeSavedPurchase]);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage, source?: PurchaseSource): Promise<boolean> => {
      const authProvider = authPurchaseStateManager.getProvider();

      if (!authProvider) {
        return false;
      }

      const isAuth = authProvider.isAuthenticated();

      if (!isAuth) {
        authPurchaseStateManager.savePurchase(pkg, source || params?.source || "settings");
        authProvider.showAuthModal();
        return false;
      }

      const result = await purchasePackage(pkg);

      return result;
    },
    [purchasePackage, params?.source]
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    const authProvider = authPurchaseStateManager.getProvider();

    if (!authProvider) {
      return false;
    }

    if (!authProvider.isAuthenticated()) {
      authProvider.showAuthModal();
      return false;
    }

    const result = await restorePurchase();

    return result;
  }, [restorePurchase]);

  return {
    handlePurchase,
    handleRestore,
    executeSavedPurchase,
  };
};
