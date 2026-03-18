/**
 * Paywall Actions Utilities
 * Helper functions for paywall purchase/restore operations
 */

import { useSubscriptionStatus } from "../../subscription/presentation/useSubscriptionStatus";
import { useCredits } from "../../credits/presentation/useCredits";

export function usePremiumVerification() {
  const { refetch: refetchStatus } = useSubscriptionStatus();
  const { refetch: refetchCredits } = useCredits();

  const verifyPremiumStatus = async (): Promise<boolean> => {
    if (__DEV__) {
      console.log('[PremiumVerification] 🔍 Checking premium status as fallback...');
    }

    const [statusResult, creditsResult] = await Promise.all([
      refetchStatus(),
      refetchCredits()
    ]);

    const isSubscriptionPremium = statusResult.data?.isPremium ?? false;
    const isCreditsPremium = creditsResult.data?.isPremium ?? false;
    const isActuallySuccessful = isSubscriptionPremium || isCreditsPremium;

    if (__DEV__) {
      console.log('[PremiumVerification] 📊 Fallback check result:', {
        isSubscriptionPremium,
        isCreditsPremium,
        isActuallySuccessful
      });
    }

    return isActuallySuccessful;
  };

  return { verifyPremiumStatus };
}
