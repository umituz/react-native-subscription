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
    throw new Error(`Failed to fetch offerings: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
