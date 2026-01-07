/**
 * usePremiumWithCredits Hook
 *
 * Combined hook for premium subscription with credits system.
 * Ensures premium users always have credits initialized.
 */

import { useEffect, useCallback } from "react";
import { useCredits, type UseCreditsResult } from "./useCredits";
import { useInitializeCredits } from "./useInitializeCredits";

export interface UsePremiumWithCreditsParams {
  userId: string | undefined;
  isPremium: boolean;
}

export interface UsePremiumWithCreditsResult extends UseCreditsResult {
  ensureCreditsInitialized: () => Promise<void>;
}

export const usePremiumWithCredits = ({
  userId,
  isPremium,
}: UsePremiumWithCreditsParams): UsePremiumWithCreditsResult => {
  const creditsResult = useCredits({ userId });
  const { initializeCredits, isInitializing } = useInitializeCredits({
    userId,
  });

  const ensureCreditsInitialized = useCallback(async () => {
    if (!userId || !isPremium) return;
    if (creditsResult.credits) return;
    if (isInitializing) return;

    await initializeCredits();
  }, [userId, isPremium, creditsResult.credits, isInitializing, initializeCredits]);

  useEffect(() => {
    if (isPremium && userId && !creditsResult.credits && !creditsResult.isLoading) {
      ensureCreditsInitialized();
    }
  }, [isPremium, userId, creditsResult.credits, creditsResult.isLoading, ensureCreditsInitialized]);

  return {
    ...creditsResult,
    ensureCreditsInitialized,
  };
};
