/**
 * Paywall Logic Hook
 *
 * Generic business logic for handling paywall interactions.
 * Decouples logic from UI and specific App implementations.
 * Follows "Package Driven Design" by accepting dynamic props.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Alert } from "react-native";
import { useLocalization } from "@umituz/react-native-localization";
import { usePremium } from "./usePremium";
import type { PurchasesPackage } from "react-native-purchases";

export interface UsePaywallOperationsProps {
    /** Current User ID (or undefined) */
    userId: string | undefined;
    /** Whether the user is anonymous/guest */
    isAnonymous: boolean;
    /** Callback when paywall should close (e.g. close button pressed) */
    onPaywallClose?: () => void;
    /** Callback when purchase completes successfully */
    onPurchaseSuccess?: () => void;
    /** Callback when authentication is required (e.g. for purchase) */
    onAuthRequired?: () => void;
}

export interface UsePaywallOperationsResult {
    /** Package that was pending purchase before auth interrupt */
    pendingPackage: PurchasesPackage | null;
    /** Handle purchasing a package */
    handlePurchase: (pkg: PurchasesPackage) => Promise<boolean>;
    /** Handle restoring purchases */
    handleRestore: () => Promise<boolean>;
    /** Handle in-app purchase (with auto-close logic) */
    handleInAppPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
    /** Handle in-app restore (with auto-close logic) */
    handleInAppRestore: () => Promise<boolean>;
    /** Complete pending purchase after authentication */
    completePendingPurchase: () => Promise<boolean>;
    /** Clear pending package without purchasing */
    clearPendingPackage: () => void;
}

export function usePaywallOperations({
    userId,
    isAnonymous,
    onPaywallClose,
    onPurchaseSuccess,
    onAuthRequired,
}: UsePaywallOperationsProps): UsePaywallOperationsResult {
    const { t } = useLocalization();
    const { purchasePackage, restorePurchase, closePaywall } = usePremium(userId);
    const [pendingPackage, setPendingPackage] = useState<PurchasesPackage | null>(null);

    // Ref to always have latest purchasePackage function (avoids stale closure)
    const purchasePackageRef = useRef(purchasePackage);
    const onPurchaseSuccessRef = useRef(onPurchaseSuccess);

    useEffect(() => {
        purchasePackageRef.current = purchasePackage;
    }, [purchasePackage]);

    useEffect(() => {
        onPurchaseSuccessRef.current = onPurchaseSuccess;
    }, [onPurchaseSuccess]);

    /**
     * Check if action requires authentication
     * @returns true if authenticated, false if auth required
     */
    const checkAuth = useCallback((): boolean => {
        if (!userId || isAnonymous) {
            if (__DEV__) {
                console.log("[usePaywallOperations] User not authenticated, triggering onAuthRequired");
            }
            if (onAuthRequired) {
                onAuthRequired();
            }
            return false;
        }
        return true;
    }, [userId, isAnonymous, onAuthRequired]);

    /**
     * Execute purchase flow with Alerts
     */
    const executePurchase = useCallback(
        async (pkg: PurchasesPackage, onSuccess?: () => void): Promise<boolean> => {
            // 1. Auth Check
            if (!checkAuth()) {
                setPendingPackage(pkg);
                return false;
            }

            // 2. Purchase
            const success = await purchasePackage(pkg);

            // 3. Handle Result
            if (success) {
                if (onSuccess) onSuccess();
            } else {
                Alert.alert(
                    t("premium.purchaseError"),
                    t("premium.purchaseErrorMessage")
                );
            }
            return success;
        },
        [checkAuth, purchasePackage, t]
    );

    /**
     * Execute restore flow with Alerts
     */
    const executeRestore = useCallback(
        async (onSuccess?: () => void): Promise<boolean> => {
            // 1. Restore
            const success = await restorePurchase();

            // 2. Alert Result
            Alert.alert(
                success ? t("premium.restoreSuccess") : t("premium.restoreError"),
                success
                    ? t("premium.restoreMessage")
                    : t("premium.restoreErrorMessage")
            );

            // 3. Handle Success
            if (success) {
                if (onSuccess) onSuccess();
            }
            return success;
        },
        [restorePurchase, t]
    );

    // ============================================================================
    // Public Handlers
    // ============================================================================

    const handlePurchase = useCallback(
        async (pkg: PurchasesPackage): Promise<boolean> => {
            const result = await executePurchase(pkg, onPurchaseSuccess);
            if (!result && !checkAuth()) {
                if (onPaywallClose) onPaywallClose();
            }
            return result;
        },
        [executePurchase, onPurchaseSuccess, checkAuth, onPaywallClose]
    );

    const handleRestore = useCallback(
        async (): Promise<boolean> => executeRestore(onPurchaseSuccess),
        [executeRestore, onPurchaseSuccess]
    );

    const handleInAppPurchase = useCallback(
        async (pkg: PurchasesPackage): Promise<boolean> => {
            const result = await executePurchase(pkg, closePaywall);
            if (!result && !checkAuth()) {
                closePaywall();
            }
            return result;
        },
        [executePurchase, closePaywall, checkAuth]
    );

    const handleInAppRestore = useCallback(
        async (): Promise<boolean> => executeRestore(closePaywall),
        [executeRestore, closePaywall]
    );

    const completePendingPurchase = useCallback(async (): Promise<boolean> => {
        if (!pendingPackage) {
            if (__DEV__) {
                console.log("[usePaywallOperations] No pending package to complete");
            }
            return false;
        }

        if (__DEV__) {
            console.log("[usePaywallOperations] Completing pending purchase:", pendingPackage.identifier);
        }

        const pkg = pendingPackage;
        setPendingPackage(null);

        // Use ref to get latest purchasePackage (avoids stale closure after auth)
        const success = await purchasePackageRef.current(pkg);

        if (success) {
            // Use ref to get latest callback
            if (onPurchaseSuccessRef.current) onPurchaseSuccessRef.current();
        } else {
            Alert.alert(
                t("premium.purchaseError"),
                t("premium.purchaseErrorMessage")
            );
        }

        return success;
    }, [pendingPackage, t]);

    const clearPendingPackage = useCallback(() => {
        setPendingPackage(null);
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
