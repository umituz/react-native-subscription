import Purchases, { type PurchasesOffering } from "react-native-purchases";

export interface OfferingsFetcherDeps {
  isInitialized: () => boolean;
}

export async function fetchOfferings(deps: OfferingsFetcherDeps): Promise<PurchasesOffering | null> {
  if (!deps.isInitialized()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('[OfferingsFetcher] Failed to fetch offerings', { error });
    return null;
  }
}
