/**
 * useFeatureGate Hook
 * Combines auth, subscription, and credits gates into a unified feature gate.
 */

import { useCallback, useRef, useEffect } from "react";
import { useAuthGate } from "./useAuthGate";
import { useSubscriptionGate } from "./useSubscriptionGate";
import { useCreditsGate } from "./useCreditsGate";

declare const __DEV__: boolean;



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

  // Store pending action for execution after purchase
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const prevCreditBalanceRef = useRef(creditBalance);
  const isWaitingForPurchaseRef = useRef(false);

  // Refs to always get current values in closures
  const hasCreditsRef = useRef(hasCredits);
  const hasSubscriptionRef = useRef(hasSubscription);
  const onShowPaywallRef = useRef(onShowPaywall);

  useEffect(() => {
    hasCreditsRef.current = hasCredits;
  }, [hasCredits]);

  useEffect(() => {
    hasSubscriptionRef.current = hasSubscription;
  }, [hasSubscription]);

  useEffect(() => {
    onShowPaywallRef.current = onShowPaywall;
  }, [onShowPaywall]);

  // Execute pending action when credits increase after purchase
  useEffect(() => {
    const prevBalance = prevCreditBalanceRef.current;
    const currentBalance = creditBalance;
    const creditsIncreased = currentBalance > prevBalance;

    if (isWaitingForPurchaseRef.current && creditsIncreased && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      isWaitingForPurchaseRef.current = false;

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useFeatureGate] Credits increased, executing pending action");
      }
      action();
    }

    prevCreditBalanceRef.current = creditBalance;
  }, [creditBalance]);

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
        // Wrap action to re-check credits after auth succeeds
        // Using refs to get current values when callback executes
        const postAuthAction = () => {
          // Subscription check (bypasses credits if subscribed)
          if (hasSubscriptionRef.current) {
            if (typeof __DEV__ !== "undefined" && __DEV__) {
              console.log("[useFeatureGate] User has subscription, executing action");
            }
            action();
            return;
          }

          // Credits check
          if (!hasCreditsRef.current) {
            pendingActionRef.current = action;
            isWaitingForPurchaseRef.current = true;
            onShowPaywallRef.current(requiredCredits);
            return;
          }

          // All checks passed
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log("[useFeatureGate] User has credits, executing action");
          }
          action();
        };
        onShowAuthModal(postAuthAction);
        return;
      }

      // Step 2: Subscription check (bypasses credits if subscribed)
      if (hasSubscription) {
        action();
        return;
      }

      // Step 3: Credits check
      if (!creditsGate.requireCredits(() => {})) {
        // Store pending action for execution after purchase
        pendingActionRef.current = action;
        isWaitingForPurchaseRef.current = true;
        return;
      }

      // Step 4: All checks passed, execute action
      action();
    },
    [
      authGate,
      creditsGate,
      hasSubscription,
      requiredCredits,
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
