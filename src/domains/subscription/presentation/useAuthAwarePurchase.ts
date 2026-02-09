/**
 * Auth-Aware Purchase Hook
 * Handles purchase flow with authentication requirement
 */

import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";
import type { PurchaseSource } from "../core/SubscriptionConstants";
import { authPurchaseStateManager } from "../infrastructure/utils/authPurchaseState";

export type { PurchaseAuthProvider } from "../infrastructure/utils/authPurchaseState";

export const configureAuthProvider = (provider: import("../infrastructure/utils/authPurchaseState").PurchaseAuthProvider): void => {
  authPurchaseStateManager.configure(provider);
};

export const cleanupAuthProvider = (): void => {
  authPurchaseStateManager.cleanup();
};

export const getSavedPurchase = (): { pkg: PurchasesPackage; source: PurchaseSource } | null => {
  return authPurchaseStateManager.getSavedPurchase();
};

export const clearSavedPurchase = (): void => {
  authPurchaseStateManager.clearSavedPurchase();
};

export interface UseAuthAwarePurchaseParams {
  source?: PurchaseSource;
}

export interface UseAuthAwarePurchaseResult {
  handlePurchase: (pkg: PurchasesPackage, source?: PurchaseSource) => Promise<boolean>;
  handleRestore: () => Promise<boolean>;
  executeSavedPurchase: () => Promise<boolean>;
}

export const useAuthAwarePurchase = (
  params?: UseAuthAwarePurchaseParams
): UseAuthAwarePurchaseResult => {
  const { purchasePackage, restorePurchase } = usePremium();

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

      return purchasePackage(pkg);
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

    return restorePurchase();
  }, [restorePurchase]);

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
    } catch (error) {
      throw error;
    }
  }, [purchasePackage]);

  return {
    handlePurchase,
    handleRestore,
    executeSavedPurchase,
  };
};
