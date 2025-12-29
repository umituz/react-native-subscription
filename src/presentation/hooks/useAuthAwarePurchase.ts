/**
 * Auth-Aware Purchase Hook
 * Uses globally configured auth provider
 * Configure once at app start with configureAuthProvider()
 */

import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";

export interface PurchaseAuthProvider {
    isAuthenticated: () => boolean;
    showAuthModal: () => void;
}

// Global auth provider - configured once at app start
let globalAuthProvider: PurchaseAuthProvider | null = null;

/**
 * Configure auth provider for purchases
 * Call this once at app initialization
 */
export const configureAuthProvider = (provider: PurchaseAuthProvider): void => {
    globalAuthProvider = provider;
    if (__DEV__) {
        console.log("[useAuthAwarePurchase] Auth provider configured");
    }
};

export interface UseAuthAwarePurchaseResult {
    handlePurchase: (pkg: PurchasesPackage) => Promise<boolean>;
    handleRestore: () => Promise<boolean>;
}

export const useAuthAwarePurchase = (): UseAuthAwarePurchaseResult => {
    const { purchasePackage, restorePurchase, closePaywall } = usePremium();

    const handlePurchase = useCallback(
        async (pkg: PurchasesPackage): Promise<boolean> => {
            // SECURITY: Block purchase if auth provider not configured
            if (!globalAuthProvider) {
                if (__DEV__) {
                    console.error(
                        "[useAuthAwarePurchase] CRITICAL: Auth provider not configured. " +
                        "Call configureAuthProvider() at app start. Purchase blocked for security.",
                    );
                }
                // Block purchase - never allow without auth provider
                return false;
            }

            // Block purchase if user not authenticated (anonymous users cannot purchase)
            if (!globalAuthProvider.isAuthenticated()) {
                if (__DEV__) {
                    console.log(
                        "[useAuthAwarePurchase] User not authenticated, opening auth modal",
                    );
                }
                closePaywall();
                globalAuthProvider.showAuthModal();
                return false;
            }

            return purchasePackage(pkg);
        },
        [purchasePackage, closePaywall],
    );

    const handleRestore = useCallback(async (): Promise<boolean> => {
        // SECURITY: Block restore if auth provider not configured
        if (!globalAuthProvider) {
            if (__DEV__) {
                console.error(
                    "[useAuthAwarePurchase] CRITICAL: Auth provider not configured. " +
                    "Call configureAuthProvider() at app start. Restore blocked for security.",
                );
            }
            // Block restore - never allow without auth provider
            return false;
        }

        // Block restore if user not authenticated
        if (!globalAuthProvider.isAuthenticated()) {
            if (__DEV__) {
                console.log(
                    "[useAuthAwarePurchase] User not authenticated, opening auth modal",
                );
            }
            closePaywall();
            globalAuthProvider.showAuthModal();
            return false;
        }

        return restorePurchase();
    }, [restorePurchase, closePaywall]);

    return {
        handlePurchase,
        handleRestore,
    };
};
