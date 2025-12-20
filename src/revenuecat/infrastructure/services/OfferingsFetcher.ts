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
  if (__DEV__) {
    console.log(
      "[RevenueCat] fetchOfferings() called, isInitialized:",
      deps.isInitialized()
    );
  }

  if (!deps.isInitialized()) {
    if (__DEV__) {
      console.log("[RevenueCat] fetchOfferings() - NOT initialized");
    }
    return null;
  }



  try {
    const offerings = await Purchases.getOfferings();

    if (__DEV__) {
      console.log("[RevenueCat] fetchOfferings() result:", {
        hasCurrent: !!offerings.current,
        packagesCount: offerings.current?.availablePackages?.length ?? 0,
      });
    }

    return offerings.current;
  } catch (error) {
    if (__DEV__) {
      console.log("[RevenueCat] fetchOfferings() error:", error);
    }
    return null;
  }
}
