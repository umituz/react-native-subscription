/**
 * useFeatureGate Hook
 * Combines auth, subscription, and credits gates into a unified feature gate.
 */

import { useCallback } from "react";
import { useAuthGate } from "./useAuthGate";
import { useSubscriptionGate } from "./useSubscriptionGate";
import { useCreditsGate } from "./useCreditsGate";



export interface UseFeatureGateParams {
  /** Whether user is authenticated (not guest/anonymous) */
  isAuthenticated: boolean;
  /** Callback to show auth modal with pending action */
  onShowAuthModal: (pendingCallback: () => void | Promise<void>) => void;
  /** Whether user has active subscription (optional, defaults to false) */
  hasSubscription?: boolean;
  /** Whether user has enough credits for the action */
  hasCredits: boolean;
  /** Current credit balance */
  creditBalance: number;
  /** Credits required for this action (optional, for paywall display) */
  requiredCredits?: number;
  /** Callback to show paywall - receives required credits */
  onShowPaywall: (requiredCredits?: number) => void;
}

export interface UseFeatureGateResult {
  /** Gate a feature - checks auth, subscription, then credits */
  requireFeature: (action: () => void | Promise<void>) => void;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user has active subscription */
  hasSubscription: boolean;
  /** Whether user has enough credits */
  hasCredits: boolean;
  /** Current credit balance */
  creditBalance: number;
  /** Whether feature access is allowed */
  canAccess: boolean;
}

export function useFeatureGate(
  params: UseFeatureGateParams
): UseFeatureGateResult {
  const {
    isAuthenticated,
    onShowAuthModal,
    hasSubscription = false,
    hasCredits,
    creditBalance,
    requiredCredits,
    onShowPaywall,
  } = params;

  // Compose individual gates
  const authGate = useAuthGate({
    isAuthenticated,
    onAuthRequired: onShowAuthModal,
  });

  const subscriptionGate = useSubscriptionGate({
    hasSubscription,
    onSubscriptionRequired: () => onShowPaywall(requiredCredits),
  });

  const creditsGate = useCreditsGate({
    hasCredits,
    creditBalance,
    requiredCredits,
    onCreditsRequired: onShowPaywall,
  });

  const requireFeature = useCallback(
    (action: () => void | Promise<void>) => {

      // Step 1: Auth check
      if (!authGate.requireAuth(() => {})) {
        onShowAuthModal(action);
        return;
      }

      // Step 2: Subscription check (bypasses credits if subscribed)
      if (hasSubscription) {
        action();
        return;
      }

      // Step 3: Credits check
      if (!creditsGate.requireCredits(() => {})) {
        return;
      }

      // Step 4: All checks passed, execute action
      action();
    },
    [
      authGate,
      creditsGate,
      hasSubscription,
      onShowAuthModal,
    ]
  );

  return {
    requireFeature,
    isAuthenticated: authGate.isAuthenticated,
    hasSubscription: subscriptionGate.hasSubscription,
    hasCredits: creditsGate.hasCredits,
    creditBalance: creditsGate.creditBalance,
    canAccess: isAuthenticated && (hasSubscription || hasCredits),
  };
}

// Re-export individual gates for standalone use
export { useAuthGate, useSubscriptionGate, useCreditsGate };
export type {
  UseAuthGateParams,
  UseAuthGateResult,
} from "./useAuthGate";
export type {
  UseSubscriptionGateParams,
  UseSubscriptionGateResult,
} from "./useSubscriptionGate";
export type {
  UseCreditsGateParams,
  UseCreditsGateResult,
} from "./useCreditsGate";
