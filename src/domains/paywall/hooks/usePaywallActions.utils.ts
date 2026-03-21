/**
 * Paywall Actions Utilities
 * Helper functions for paywall purchase/restore operations
 */

import { useSubscriptionStatus } from "../../subscription/presentation/useSubscriptionStatus";
import { useCredits } from "../../credits/presentation/useCredits";
import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("PremiumVerification");

export function usePremiumVerification() {
  const { isPremium: isSubscriptionPremium } = useSubscriptionStatus();
  const { credits } = useCredits();

  const verifyPremiumStatus = async (): Promise<boolean> => {
    logger.debug("Checking premium status as fallback...");

    // With real-time sync, data is already up-to-date via onSnapshot
    // No need to manually refetch - just check current state
    const isCreditsPremium = credits?.isPremium ?? false;
    const isActuallySuccessful = isSubscriptionPremium || isCreditsPremium;

    logger.debug("Fallback check result", {
      isSubscriptionPremium,
      isCreditsPremium,
      isActuallySuccessful
    });

    return isActuallySuccessful;
  };

  return { verifyPremiumStatus };
}
