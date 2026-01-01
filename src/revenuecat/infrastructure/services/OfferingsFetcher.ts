/**
 * Offerings Fetcher
 * Handles RevenueCat offerings retrieval
 */

import Purchases, { type PurchasesOffering } from "react-native-purchases";

export interface OfferingsFetcherDeps {
    isInitialized: () => boolean;
    isUsingTestStore: () => boolean;
}

export async function fetchOfferings(
    deps: OfferingsFetcherDeps
): Promise<PurchasesOffering | null> {
    if (!deps.isInitialized()) {
        return null;
    }

    try {
        const offerings = await Purchases.getOfferings();
        return offerings.current;
    } catch {
        return null;
    }
}
