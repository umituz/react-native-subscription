/**
 * Auth-Aware Purchase Hook
 * Handles purchase flow with authentication requirement
 */

import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";
import type { PurchaseSource } from "../core/SubscriptionConstants";
import { authPurchaseStateManager } from "../infrastructure/utils/authPurchaseState";

declare const __DEV__: boolean;

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
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useAuthAwarePurchase] handlePurchase called", {
          productId: pkg.product.identifier,
          source: source || params?.source,
        });
      }

      const authProvider = authPurchaseStateManager.getProvider();

      if (!authProvider) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.error("[useAuthAwarePurchase] ❌ No auth provider configured");
        }
        return false;
      }

      const isAuth = authProvider.isAuthenticated();

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useAuthAwarePurchase] Auth status:", { isAuth });
      }

      if (!isAuth) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[useAuthAwarePurchase] 🔐 User not authenticated, saving purchase and showing auth modal");
        }
        authPurchaseStateManager.savePurchase(pkg, source || params?.source || "settings");
        authProvider.showAuthModal();
        return false;
      }

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useAuthAwarePurchase] ✅ User authenticated, proceeding with purchase");
      }

      const result = await purchasePackage(pkg);

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useAuthAwarePurchase] Purchase result:", result);
      }

      return result;
    },
    [purchasePackage, params?.source]
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useAuthAwarePurchase] handleRestore called");
    }

    const authProvider = authPurchaseStateManager.getProvider();

    if (!authProvider) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.error("[useAuthAwarePurchase] ❌ No auth provider configured");
      }
      return false;
    }

    if (!authProvider.isAuthenticated()) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useAuthAwarePurchase] 🔐 User not authenticated, showing auth modal");
      }
      authProvider.showAuthModal();
      return false;
    }

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useAuthAwarePurchase] ✅ User authenticated, proceeding with restore");
    }

    const result = await restorePurchase();

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useAuthAwarePurchase] Restore result:", result);
    }

    return result;
  }, [restorePurchase]);

  const executeSavedPurchase = useCallback(async (): Promise<boolean> => {
    const saved = authPurchaseStateManager.getSavedPurchase();
    if (!saved) {
      return false;
    }

    const result = await purchasePackage(saved.pkg);
    if (result) {
      authPurchaseStateManager.clearSavedPurchase();
    }
    return result;
  }, [purchasePackage]);

  return {
    handlePurchase,
    handleRestore,
    executeSavedPurchase,
  };
};
