import Purchases, { type PurchasesOffering } from "react-native-purchases";
import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("OfferingsFetcher");

interface OfferingsFetcherDeps {
  isInitialized: () => boolean;
}

const MAX_FETCH_RETRIES = 2;
const FETCH_RETRY_DELAY_MS = 1500;

export async function fetchOfferings(deps: OfferingsFetcherDeps): Promise<PurchasesOffering | null> {
  if (!deps.isInitialized()) return null;

  for (let attempt = 0; attempt <= MAX_FETCH_RETRIES; attempt++) {
    try {
      const offerings = await Purchases.getOfferings();

      logger.debug("Offerings received", {
        attempt,
        hasCurrent: !!offerings.current,
        currentId: offerings.current?.identifier,
        allOfferingsCount: Object.keys(offerings.all).length,
        allOfferingIds: Object.keys(offerings.all),
      });

      if (offerings.current) {
        return offerings.current;
      }

      const allOfferings = Object.values(offerings.all);
      if (allOfferings.length > 0) {
        return allOfferings[0];
      }

      // No offerings found - retry after delay (RevenueCat may still be syncing)
      if (attempt < MAX_FETCH_RETRIES) {
        logger.debug("No offerings found, retrying...", { attempt: attempt + 1 });
        await new Promise<void>(resolve => setTimeout(resolve, FETCH_RETRY_DELAY_MS));
        continue;
      }

      logger.warn("No offerings found after all retries");
      return null;
    } catch (error) {
      if (attempt < MAX_FETCH_RETRIES) {
        logger.warn("Fetch failed, retrying...", error, { attempt: attempt + 1 });
        await new Promise<void>(resolve => setTimeout(resolve, FETCH_RETRY_DELAY_MS));
        continue;
      }
      logger.warn("Failed to fetch offerings after all retries", error);
      return null;
    }
  }

  return null;
}
