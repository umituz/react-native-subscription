/**
 * usePremiumGate Hook
 *
 * Simplified hook for premium-only apps (no credit system).
 * Provides screen-level and action-level premium gates.
 *
 * @example Screen-Level Gate
 * ```tsx
 * const { isPremium, requireScreen } = usePremiumGate();
 *
 * useEffect(() => {
 *   requireScreen(); // Auto-opens paywall if not premium
 * }, [requireScreen]);
 *
 * if (!isPremium) return null;
 * ```
 *
 * @example Action-Level Gate
 * ```tsx
 * const { requirePremium } = usePremiumGate();
 *
 * const handleAction = () => {
 *   requirePremium(() => {
 *     // Action code here
 *   });
 * };
 * ```
 */

import { useCallback, useEffect } from "react";
import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { paywallControl } from "./usePaywallVisibility";

export interface UsePremiumGateResult {
  /** Whether user has premium access */
  isPremium: boolean;
  /** Whether subscription status is loading */
  isLoading: boolean;
  /** Action-level gate: runs callback only if user has premium */
  requirePremium: (onSuccess: () => void) => void;
  /** Screen-level gate: opens paywall if not premium */
  requireScreen: () => void;
}

export const usePremiumGate = (): UsePremiumGateResult => {
  const { isPremium, isLoading } = useSubscriptionStatus();

  const requirePremium = useCallback(
    (onSuccess: () => void) => {
      if (isLoading) {
        return;
      }

      if (isPremium) {
        onSuccess();
        return;
      }

      paywallControl.open();
    },
    [isPremium, isLoading]
  );

  const requireScreen = useCallback(() => {
    if (!isLoading && !isPremium) {
      paywallControl.open();
    }
  }, [isPremium, isLoading]);

  return {
    isPremium,
    isLoading,
    requirePremium,
    requireScreen,
  };
};

/**
 * useSubscription Hook (Alias for usePremiumGate)
 *
 * Simpler name for premium-only apps.
 * Same functionality as usePremiumGate.
 */
export const useSubscription = usePremiumGate;
