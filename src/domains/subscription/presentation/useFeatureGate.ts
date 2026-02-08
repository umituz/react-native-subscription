/**
 * useFeatureGate Hook
 * Unified feature gate: Auth → Subscription → Credits
 * Uses ref pattern to avoid stale closure issues.
 * Event-driven approach - no polling, no waiting.
 */

import { useCallback, useRef, useEffect } from "react";

export interface UseFeatureGateParams {
  readonly isAuthenticated: boolean;
  readonly onShowAuthModal: (pendingCallback: () => void | Promise<void>) => void;
  readonly hasSubscription?: boolean;
  readonly creditBalance: number;
  readonly requiredCredits?: number;
  readonly onShowPaywall: (requiredCredits?: number) => void;
  readonly isCreditsLoaded?: boolean;
}

export interface UseFeatureGateResult {
  readonly requireFeature: (action: () => void | Promise<void>) => void;
  readonly isAuthenticated: boolean;
  readonly hasSubscription: boolean;
  readonly hasCredits: boolean;
  readonly creditBalance: number;
  readonly canAccess: boolean;
}

export function useFeatureGate(params: UseFeatureGateParams): UseFeatureGateResult {
  const {
    isAuthenticated,
    onShowAuthModal,
    hasSubscription = false,
    creditBalance,
    requiredCredits = 1,
    onShowPaywall,
    isCreditsLoaded = true,
  } = params;

  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const prevCreditBalanceRef = useRef(creditBalance);
  const isWaitingForPurchaseRef = useRef(false);
  const isWaitingForAuthCreditsRef = useRef(false);

  const creditBalanceRef = useRef(creditBalance);
  const hasSubscriptionRef = useRef(hasSubscription);
  const onShowPaywallRef = useRef(onShowPaywall);
  const requiredCreditsRef = useRef(requiredCredits);

  useEffect(() => {
    creditBalanceRef.current = creditBalance;
  }, [creditBalance]);

  useEffect(() => {
    hasSubscriptionRef.current = hasSubscription;
  }, [hasSubscription]);

  useEffect(() => {
    onShowPaywallRef.current = onShowPaywall;
  }, [onShowPaywall]);

  useEffect(() => {
    requiredCreditsRef.current = requiredCredits;
  }, [requiredCredits]);

  useEffect(() => {
    if (!isWaitingForAuthCreditsRef.current || !isCreditsLoaded || !pendingActionRef.current) {
      return;
    }

    isWaitingForAuthCreditsRef.current = false;

    if (hasSubscription || creditBalance >= requiredCredits) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
      return;
    }

    isWaitingForPurchaseRef.current = true;
    onShowPaywall(requiredCredits);
  }, [isCreditsLoaded, creditBalance, hasSubscription, requiredCredits, onShowPaywall]);

  useEffect(() => {
    const prevBalance = prevCreditBalanceRef.current ?? 0;
    const creditsIncreased = creditBalance > prevBalance;
    const subscriptionAcquired = hasSubscription && !hasSubscriptionRef.current;

    if (isWaitingForPurchaseRef.current && (creditsIncreased || subscriptionAcquired) && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      isWaitingForPurchaseRef.current = false;
      action();
    }

    prevCreditBalanceRef.current = creditBalance;
    hasSubscriptionRef.current = hasSubscription;
  }, [creditBalance, hasSubscription]);

  const requireFeature = useCallback(
    (action: () => void | Promise<void>) => {
      if (!isAuthenticated) {
        const postAuthAction = () => {
          pendingActionRef.current = action;
          isWaitingForAuthCreditsRef.current = true;
        };
        onShowAuthModal(postAuthAction);
        return;
      }

      // Use ref values to avoid stale closure
      const currentHasSubscription = hasSubscriptionRef.current;
      const currentBalance = creditBalanceRef.current;
      const currentRequiredCredits = requiredCreditsRef.current;

      if (currentHasSubscription) {
        action();
        return;
      }

      if (currentBalance < currentRequiredCredits) {
        pendingActionRef.current = action;
        isWaitingForPurchaseRef.current = true;
        onShowPaywallRef.current(currentRequiredCredits);
        return;
      }

      action();
    },
    [isAuthenticated, onShowAuthModal, isCreditsLoaded]
  );

  const hasCredits = creditBalance >= requiredCredits;

  return {
    requireFeature,
    isAuthenticated,
    hasSubscription,
    hasCredits,
    creditBalance,
    canAccess: isAuthenticated && (hasSubscription || hasCredits),
  };
}
