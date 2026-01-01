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
    isInitialized: deps.isInitialized(),
  });

  if (!deps.isInitialized()) {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();

    const packagesCount = offerings.current?.availablePackages?.length ?? 0;

      hasCurrent: !!offerings.current,
      packagesCount,
    });

    return offerings.current;
  } catch (error) {
      error instanceof Error ? error : new Error(String(error)),
      {
        packageName: "subscription",
        operation: "fetch_offerings",
      }
    );
    return null;
  }
}
