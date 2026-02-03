import { Purchases, type PurchasesOffering } from "../utils/PurchasesSDK";

export interface OfferingsFetcherDeps {
  isInitialized: () => boolean;
}

export async function fetchOfferings(deps: OfferingsFetcherDeps): Promise<PurchasesOffering | null> {
  if (!deps.isInitialized()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}
