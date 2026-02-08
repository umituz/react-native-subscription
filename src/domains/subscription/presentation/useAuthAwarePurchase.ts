/**
 * Auth-Aware Purchase Hook
 * Handles purchase flow with authentication requirement
 */

import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";
import type { PurchaseSource } from "../../domain/entities/Credits";

export interface PurchaseAuthProvider {
  isAuthenticated: () => boolean;
  showAuthModal: () => void;
}

let globalAuthProvider: PurchaseAuthProvider | null = null;

interface SavedPurchaseState {
  pkg: PurchasesPackage;
  source: PurchaseSource;
  timestamp: number;
}

const SAVED_PURCHASE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
let savedPurchaseState: SavedPurchaseState | null = null;

export const configureAuthProvider = (provider: PurchaseAuthProvider): void => {
  globalAuthProvider = provider;
};

/**
 * Cleanup method to reset global auth provider state
 * Call this when app is shutting down or auth system is being reset
 */
export const cleanupAuthProvider = (): void => {
  if (__DEV__) {
    console.log("[useAuthAwarePurchase] Cleaning up auth provider");
  }
  globalAuthProvider = null;
  clearSavedPurchase();
};

const savePurchase = (pkg: PurchasesPackage, source: PurchaseSource): void => {
  savedPurchaseState = { pkg, source, timestamp: Date.now() };
};

export const getSavedPurchase = (): { pkg: PurchasesPackage; source: PurchaseSource } | null => {
  if (!savedPurchaseState) {
    return null;
  }

  const isExpired = Date.now() - savedPurchaseState.timestamp > SAVED_PURCHASE_EXPIRY_MS;
  if (isExpired) {
    savedPurchaseState = null;
    return null;
  }

  return { pkg: savedPurchaseState.pkg, source: savedPurchaseState.source };
};

export const clearSavedPurchase = (): void => {
  savedPurchaseState = null;
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
        console.log("[useAuthAwarePurchase] handlePurchase:", {
          productId: pkg.product.identifier,
          hasAuthProvider: !!globalAuthProvider,
        });
      }

      if (!globalAuthProvider) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.error("[useAuthAwarePurchase] Auth provider not configured");
        }
        return false;
      }

      const isAuth = globalAuthProvider.isAuthenticated();

      if (!isAuth) {
        savePurchase(pkg, source || params?.source || "settings");
        globalAuthProvider.showAuthModal();
        return false;
      }

      return purchasePackage(pkg);
    },
    [purchasePackage, params?.source]
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    if (!globalAuthProvider) {
      return false;
    }

    if (!globalAuthProvider.isAuthenticated()) {
      globalAuthProvider.showAuthModal();
      return false;
    }

    return restorePurchase();
  }, [restorePurchase]);

  const executeSavedPurchase = useCallback(async (): Promise<boolean> => {
    const saved = getSavedPurchase();
    if (!saved) {
      return false;
    }

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useAuthAwarePurchase] Executing saved purchase:", saved.pkg.product.identifier);
    }

    try {
      const result = await purchasePackage(saved.pkg);
      // Only clear after successful purchase
      if (result) {
        clearSavedPurchase();
      }
      return result;
    } catch (error) {
      // Don't clear on error - allow retry
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.error("[useAuthAwarePurchase] Saved purchase failed:", error);
      }
      throw error;
    }
  }, [purchasePackage]);

  return {
    handlePurchase,
    handleRestore,
    executeSavedPurchase,
  };
};
