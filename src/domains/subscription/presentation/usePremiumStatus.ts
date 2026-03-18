import { useMemo } from 'react';
import type { UserCredits } from '../../credits/core/Credits';
import { useCredits } from '../../credits/presentation/useCredits';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import { isPremiumSyncPending } from '../utils/syncStatus';

export interface PremiumStatus {
  isPremium: boolean;
  credits: UserCredits | null;
  isSyncing: boolean;
}

/**
 * Read-only hook for premium status.
 * Combines subscription status and credits to determine overall premium state.
 *
 * This hook is focused on data reading only - no mutations or side effects.
 * Use this when you only need to know the premium status without triggering
 * purchases or other actions.
 */
export function usePremiumStatus(): PremiumStatus {
  const { isPremium: subscriptionActive, isLoading: statusLoading } = useSubscriptionStatus();
  const { credits, isLoading: creditsLoading } = useCredits();

  const isPremium = subscriptionActive || (credits?.isPremium ?? false);
  const isSyncing = isPremiumSyncPending({
    statusLoading,
    creditsLoading,
    subscriptionActive,
    credits,
  });

  return useMemo(() => ({
    isPremium,
    credits,
    isSyncing,
  }), [isPremium, credits, isSyncing]);
}
