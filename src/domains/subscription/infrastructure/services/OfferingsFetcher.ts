import Purchases, { type PurchasesOffering } from "react-native-purchases";

interface OfferingsFetcherDeps {
  isInitialized: () => boolean;
}

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
      return offerings.current;
    }

    const allOfferings = Object.values(offerings.all);
    if (allOfferings.length > 0) {
      return allOfferings[0];
    }

    return null;
  } catch (error) {
    throw new Error(`Failed to fetch offerings: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
