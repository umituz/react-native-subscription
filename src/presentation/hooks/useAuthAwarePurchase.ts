/**
 * Auth-Aware Purchase Hook
 * Uses globally configured auth provider
 * Configure once at app start with configureAuthProvider()
 */

import { useCallback } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePremium } from "./usePremium";
import { usePendingPurchaseStore } from "../../infrastructure/stores/PendingPurchaseStore";
import type { PurchaseSource } from "../../domain/entities/Credits";

declare const __DEV__: boolean;

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
};

export interface UseAuthAwarePurchaseParams {
  source?: PurchaseSource;
}

export interface UseAuthAwarePurchaseResult {
    handlePurchase: (pkg: PurchasesPackage, source?: PurchaseSource) => Promise<boolean>;
    handleRestore: () => Promise<boolean>;
}

export const useAuthAwarePurchase = (
  params?: UseAuthAwarePurchaseParams
): UseAuthAwarePurchaseResult => {
    const { purchasePackage, restorePurchase, closePaywall } = usePremium();
    const { setPendingPurchase } = usePendingPurchaseStore();

    const handlePurchase = useCallback(
        async (pkg: PurchasesPackage, source?: PurchaseSource): Promise<boolean> => {
            // SECURITY: Block purchase if auth provider not configured
            if (!globalAuthProvider) {
                if (__DEV__) {
                    console.error(
                        "[useAuthAwarePurchase] CRITICAL: Auth provider not configured. " +
                        "Call configureAuthProvider() at app start. Purchase blocked for security.",
                    );
                }
                return false;
            }

            // Block purchase if user not authenticated (anonymous users cannot purchase)
            if (!globalAuthProvider.isAuthenticated()) {
                if (__DEV__) {
                    console.log(
                        "[useAuthAwarePurchase] User not authenticated, saving pending purchase and opening auth modal",
                    );
                }

                // Save pending purchase
                setPendingPurchase({
                  package: pkg,
                  source: source || params?.source || "settings",
                  selectedAt: Date.now(),
                });

                closePaywall();
                globalAuthProvider.showAuthModal();
                return false;
            }

            return purchasePackage(pkg);
        },
        [purchasePackage, closePaywall, setPendingPurchase, params?.source],
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
