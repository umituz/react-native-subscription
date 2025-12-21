/**
 * Offerings Fetcher
 * Handles RevenueCat offerings retrieval
 */

import Purchases, { type PurchasesOffering } from "react-native-purchases";
import {
  trackPackageError,
  addPackageBreadcrumb,
  trackPackageWarning,
} from "@umituz/react-native-sentry";

export interface OfferingsFetcherDeps {
  isInitialized: () => boolean;
  isUsingTestStore: () => boolean;
}

export async function fetchOfferings(
  deps: OfferingsFetcherDeps
): Promise<PurchasesOffering | null> {
  addPackageBreadcrumb("subscription", "Fetch offerings started", {
    isInitialized: deps.isInitialized(),
  });

  if (__DEV__) {
    console.log(
      "[RevenueCat] fetchOfferings() called, isInitialized:",
      deps.isInitialized()
    );
  }

  if (!deps.isInitialized()) {
    trackPackageWarning("subscription", "Fetch offerings called before initialization", {});

    if (__DEV__) {
      console.log("[RevenueCat] fetchOfferings() - NOT initialized");
    }
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();

    const packagesCount = offerings.current?.availablePackages?.length ?? 0;

    addPackageBreadcrumb("subscription", "Fetch offerings success", {
      hasCurrent: !!offerings.current,
      packagesCount,
    });

    if (__DEV__) {
      console.log("[RevenueCat] fetchOfferings() result:", {
        hasCurrent: !!offerings.current,
        packagesCount,
      });
    }

    return offerings.current;
  } catch (error) {
    trackPackageError(
      error instanceof Error ? error : new Error(String(error)),
      {
        packageName: "subscription",
        operation: "fetch_offerings",
      }
    );

    if (__DEV__) {
      console.log("[RevenueCat] fetchOfferings() error:", error);
    }
    return null;
  }
}
