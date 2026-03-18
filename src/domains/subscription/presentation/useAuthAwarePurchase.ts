import { useCallback, useEffect, useRef } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";
import type { PurchaseSource } from "../core/SubscriptionConstants";
import { authPurchaseStateManager } from "../infrastructure/utils/authPurchaseState";
import { requireAuthentication } from "./utils/authCheckUtils";

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

/**
 * Hook for purchase operations that handle authentication.
 * Automatically saves pending purchases and shows auth modal when needed.
 */
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

  // Auto-execute saved purchase when user authenticates
  useEffect(() => {
    const authProvider = authPurchaseStateManager.getProvider();
    const hasUser = authProvider && authProvider.hasFirebaseUser();
    const hasSavedPurchase = !!authPurchaseStateManager.getSavedPurchase();

    if (hasUser && hasSavedPurchase && !isExecutingSavedRef.current) {
      isExecutingSavedRef.current = true;
      executeSavedPurchase().finally(() => {
        isExecutingSavedRef.current = false;
      });
    }
  }, [executeSavedPurchase]);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage, source?: PurchaseSource): Promise<boolean> => {
      const authProvider = authPurchaseStateManager.getProvider();

      if (!requireAuthentication(authProvider)) {
        // User not authenticated, purchase saved and auth modal shown
        authPurchaseStateManager.savePurchase(pkg, source || params?.source || "settings");
        return false;
      }

      // User authenticated, proceed with purchase
      const result = await purchasePackage(pkg);
      return result;
    },
    [purchasePackage, params?.source]
  );

  const handleRestore = useCallback(async (): Promise<boolean> => {
    const authProvider = authPurchaseStateManager.getProvider();

    if (!requireAuthentication(authProvider)) {
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
