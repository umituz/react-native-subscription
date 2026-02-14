import Purchases, { type PurchasesOffering } from "react-native-purchases";

export interface OfferingsFetcherDeps {
  isInitialized: () => boolean;
}

declare const __DEV__: boolean;

export async function fetchOfferings(deps: OfferingsFetcherDeps): Promise<PurchasesOffering | null> {
  if (!deps.isInitialized()) return null;
  try {
    const offerings = await Purchases.getOfferings();

    if (__DEV__) {
      console.log('[OfferingsFetcher] Offerings received:', {
        hasCurrent: !!offerings.current,
        currentId: offerings.current?.identifier,
        allOfferingsCount: Object.keys(offerings.all).length,
        allOfferingIds: Object.keys(offerings.all),
      });
    }

    if (offerings.current) {
      if (__DEV__) {
        console.log('[OfferingsFetcher] Using current offering:', {
          id: offerings.current.identifier,
          packagesCount: offerings.current.availablePackages.length,
        });
      }
      return offerings.current;
    }

    const allOfferings = Object.values(offerings.all);
    if (allOfferings.length > 0) {
      if (__DEV__) {
        console.log('[OfferingsFetcher] No current offering, using first from all:', {
          id: allOfferings[0].identifier,
          packagesCount: allOfferings[0].availablePackages.length,
        });
      }
      return allOfferings[0];
    }

    if (__DEV__) {
      console.warn('[OfferingsFetcher] No offerings available!');
    }

    return null;
  } catch (error) {
    if (__DEV__) {
      console.error('[OfferingsFetcher] Error:', error);
    }
    throw new Error(`Failed to fetch offerings: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
