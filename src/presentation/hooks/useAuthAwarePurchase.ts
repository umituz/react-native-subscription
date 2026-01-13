/**
 * Auth-Aware Purchase Hook
 * Handles purchase flow with authentication requirement
 */

import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";
import type { PurchaseSource } from "../../domain/entities/Credits";

declare const __DEV__: boolean;

export interface PurchaseAuthProvider {
  isAuthenticated: () => boolean;
  showAuthModal: () => void;
}

let globalAuthProvider: PurchaseAuthProvider | null = null;
let savedPackage: PurchasesPackage | null = null;
let savedSource: PurchaseSource | null = null;

export const configureAuthProvider = (provider: PurchaseAuthProvider): void => {
  globalAuthProvider = provider;
};

export const getSavedPurchase = (): { pkg: PurchasesPackage; source: PurchaseSource } | null => {
  if (savedPackage && savedSource) {
    return { pkg: savedPackage, source: savedSource };
  }
  return null;
};

export const clearSavedPurchase = (): void => {
  savedPackage = null;
  savedSource = null;
};

export interface UseAuthAwarePurchaseParams {
  source?: PurchaseSource;
  userId?: string;
}

export interface UseAuthAwarePurchaseResult {
  handlePurchase: (pkg: PurchasesPackage, source?: PurchaseSource) => Promise<boolean>;
  handleRestore: () => Promise<boolean>;
  executeSavedPurchase: () => Promise<boolean>;
}

export const useAuthAwarePurchase = (
  params?: UseAuthAwarePurchaseParams
): UseAuthAwarePurchaseResult => {
  const { purchasePackage, restorePurchase } = usePremium(params?.userId);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage, source?: PurchaseSource): Promise<boolean> => {
      if (__DEV__) {
        console.log("[useAuthAwarePurchase] handlePurchase called:", {
          productId: pkg.product.identifier,
          hasAuthProvider: !!globalAuthProvider,
        });
      }

      if (!globalAuthProvider) {
        if (__DEV__) {
          console.error("[useAuthAwarePurchase] Auth provider not configured");
        }
        return false;
      }

      const isAuth = globalAuthProvider.isAuthenticated();
      if (__DEV__) {
        console.log("[useAuthAwarePurchase] Auth check:", { isAuthenticated: isAuth });
      }

      if (!isAuth) {
        if (__DEV__) {
          console.log("[useAuthAwarePurchase] Not authenticated, saving and showing auth");
        }
        savedPackage = pkg;
        savedSource = source || params?.source || "settings";
        globalAuthProvider.showAuthModal();
        return false;
      }

      if (__DEV__) {
        console.log("[useAuthAwarePurchase] Calling purchasePackage");
      }
      const result = await purchasePackage(pkg);
      if (__DEV__) {
        console.log("[useAuthAwarePurchase] purchasePackage returned:", result);
      }
      return result;
    },
    [purchasePackage, params?.source]
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    if (!globalAuthProvider) {
      if (__DEV__) {
        console.error("[useAuthAwarePurchase] Auth provider not configured");
      }
      return false;
    }

    if (!globalAuthProvider.isAuthenticated()) {
      if (__DEV__) {
        console.log("[useAuthAwarePurchase] Not authenticated for restore");
      }
      globalAuthProvider.showAuthModal();
      return false;
    }

    return restorePurchase();
  }, [restorePurchase]);

  const executeSavedPurchase = useCallback(async (): Promise<boolean> => {
    const saved = getSavedPurchase();
    if (!saved) {
      if (__DEV__) {
        console.log("[useAuthAwarePurchase] No saved purchase to execute");
      }
      return false;
    }

    if (__DEV__) {
      console.log("[useAuthAwarePurchase] Executing saved purchase:", saved.pkg.product.identifier);
    }

    clearSavedPurchase();
    return purchasePackage(saved.pkg);
  }, [purchasePackage]);

  return {
    handlePurchase,
    handleRestore,
    executeSavedPurchase,
  };
};
