/**
 * Auth-Aware Purchase Hook
 * Generic hook that works with any auth provider
 * Ensures user is authenticated before allowing purchases
 */

import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";

export interface PurchaseAuthProvider {
    isAuthenticated: () => boolean;
    showAuthModal: () => void;
}

export interface UseAuthAwarePurchaseParams {
    authProvider: PurchaseAuthProvider;
}

export interface UseAuthAwarePurchaseResult {
    handlePurchase: (pkg: PurchasesPackage) => Promise<boolean>;
    handleRestore: () => Promise<boolean>;
}

export const useAuthAwarePurchase = ({
    authProvider,
}: UseAuthAwarePurchaseParams): UseAuthAwarePurchaseResult => {
    const { purchasePackage, restorePurchase, closePaywall } = usePremium();

    const handlePurchase = useCallback(
        async (pkg: PurchasesPackage): Promise<boolean> => {
            if (!authProvider.isAuthenticated()) {
                if (__DEV__) {
                    console.log(
                        "[useAuthAwarePurchase] User not authenticated, opening auth modal",
                    );
                }
                closePaywall();
                authProvider.showAuthModal();
                return false;
            }

            return purchasePackage(pkg);
        },
        [purchasePackage, closePaywall, authProvider],
    );

    const handleRestore = useCallback(async (): Promise<boolean> => {
        if (!authProvider.isAuthenticated()) {
            if (__DEV__) {
                console.log(
                    "[useAuthAwarePurchase] User not authenticated, opening auth modal",
                );
            }
            closePaywall();
            authProvider.showAuthModal();
            return false;
        }

        return restorePurchase();
    }, [restorePurchase, closePaywall, authProvider]);

    return {
        handlePurchase,
        handleRestore,
    };
};
