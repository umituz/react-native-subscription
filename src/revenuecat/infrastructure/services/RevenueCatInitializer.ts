/**
 * RevenueCat Initializer
 * Handles SDK initialization logic
 */

import Purchases, { LOG_LEVEL } from "react-native-purchases";
import type { InitializeResult } from "../../application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { getErrorMessage } from "../../domain/types/RevenueCatTypes";
import { resolveApiKey } from "../utils/ApiKeyResolver";

export interface InitializerDeps {
    config: RevenueCatConfig;
    isUsingTestStore: () => boolean;
    isInitialized: () => boolean;
    getCurrentUserId: () => string | null;
    setInitialized: (value: boolean) => void;
    setCurrentUserId: (userId: string) => void;
}

let isPurchasesConfigured = false;
let isLogHandlerConfigured = false;
// Mutex to prevent concurrent configuration
let configurationInProgress = false;

function configureLogHandler(): void {
    if (isLogHandlerConfigured) return;

    Purchases.setLogHandler((logLevel, message) => {
        const isAppTransactionError =
            message.includes("Purchase was cancelled") ||
            message.includes("AppTransaction") ||
            message.includes("Couldn't find previous transactions");

        if (isAppTransactionError) {
            return;
        }

        switch (logLevel) {
            case LOG_LEVEL.ERROR:
                break;
            default:
                break;
        }
    });

    isLogHandlerConfigured = true;
}

function buildSuccessResult(
    deps: InitializerDeps,
    customerInfo: any,
    offerings: any
): InitializeResult {
    const entitlementId = deps.config.entitlementIdentifier;
    const hasPremium = !!customerInfo.entitlements.active[entitlementId];
    return { success: true, offering: offerings.current, hasPremium };
}

export async function initializeSDK(
    deps: InitializerDeps,
    userId: string,
    apiKey?: string
): Promise<InitializeResult> {
    // Case 1: Already initialized with the same user ID
    if (deps.isInitialized() && deps.getCurrentUserId() === userId) {
        try {
            const [customerInfo, offerings] = await Promise.all([
                Purchases.getCustomerInfo(),
                Purchases.getOfferings(),
            ]);
            return buildSuccessResult(deps, customerInfo, offerings);
        } catch {
            return { success: false, offering: null, hasPremium: false };
        }
    }

    // Case 2: Already configured but different user or re-initializing
    if (isPurchasesConfigured) {
        try {
            const currentAppUserId = await Purchases.getAppUserID();

            let customerInfo;
            if (currentAppUserId !== userId) {
                const result = await Purchases.logIn(userId);
                customerInfo = result.customerInfo;
            } else {
                customerInfo = await Purchases.getCustomerInfo();
            }

            deps.setInitialized(true);
            deps.setCurrentUserId(userId);

            const offerings = await Purchases.getOfferings();
            return buildSuccessResult(deps, customerInfo, offerings);
        } catch {
            return { success: false, offering: null, hasPremium: false };
        }
    }

    // Case 3: First time configuration
    // Check mutex to prevent double configuration
    if (configurationInProgress) {
        // Wait a bit and retry - another thread is configuring
        await new Promise(resolve => setTimeout(resolve, 100));
        // After waiting, isPurchasesConfigured should be true
        if (isPurchasesConfigured) {
            return initializeSDK(deps, userId, apiKey);
        }
        return { success: false, offering: null, hasPremium: false };
    }

    const key = apiKey || resolveApiKey(deps.config);

    if (!key) {
        return { success: false, offering: null, hasPremium: false };
    }

    // Acquire mutex
    configurationInProgress = true;

    try {
        configureLogHandler();

        await Purchases.configure({
            apiKey: key,
            appUserID: userId,
        });
        isPurchasesConfigured = true;
        deps.setInitialized(true);
        deps.setCurrentUserId(userId);

        const [customerInfo, offerings] = await Promise.all([
            Purchases.getCustomerInfo(),
            Purchases.getOfferings(),
        ]);

        return buildSuccessResult(deps, customerInfo, offerings);
    } catch (error) {
        getErrorMessage(error, "RevenueCat init failed");
        return { success: false, offering: null, hasPremium: false };
    } finally {
        // Release mutex
        configurationInProgress = false;
    }
}
