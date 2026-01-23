/**
 * useFeatureGate Hook
 * Unified feature gate: Auth → Subscription → Credits
 * Uses ref pattern to avoid stale closure issues.
 * Event-driven approach - no polling, no waiting.
 */

import { useCallback, useRef, useEffect } from "react";

declare const __DEV__: boolean;

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
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useFeatureGate] Auth credits effect", {
        isWaiting: isWaitingForAuthCreditsRef.current,
        isLoaded: isCreditsLoaded,
        hasPending: !!pendingActionRef.current,
        credits: creditBalance,
      });
    }

    if (!isWaitingForAuthCreditsRef.current || !isCreditsLoaded || !pendingActionRef.current) {
      return;
    }

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useFeatureGate] Credits loaded after auth", {
        credits: creditBalance,
        hasSubscription,
        isCreditsLoaded,
      });
    }

    isWaitingForAuthCreditsRef.current = false;

    if (hasSubscription || creditBalance >= requiredCredits) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useFeatureGate] Proceeding with action after auth", {
          credits: creditBalance,
          hasSubscription,
        });
      }
      action();
      return;
    }

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[useFeatureGate] No credits after auth, showing paywall", {
        credits: creditBalance,
      });
    }
    isWaitingForPurchaseRef.current = true;
    onShowPaywall(requiredCredits);
  }, [isCreditsLoaded, creditBalance, hasSubscription, requiredCredits, onShowPaywall]);

  useEffect(() => {
    const prevBalance = prevCreditBalanceRef.current ?? 0;
    const creditsIncreased = creditBalance > prevBalance;

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

  const requireFeature = useCallback(
    (action: () => void | Promise<void>) => {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[useFeatureGate] requireFeature", {
          isAuthenticated,
          hasSubscription,
          creditBalance: creditBalanceRef.current,
          requiredCredits,
          isCreditsLoaded,
        });
      }

      if (!isAuthenticated) {
        const postAuthAction = () => {
          pendingActionRef.current = action;
          isWaitingForAuthCreditsRef.current = true;

          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log("[useFeatureGate] Auth completed, waiting for credits to load");
          }
        };
        onShowAuthModal(postAuthAction);
        return;
      }

      if (hasSubscription) {
        action();
        return;
      }

      const currentBalance = creditBalanceRef.current;
      if (currentBalance < requiredCredits) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[useFeatureGate] No credits, showing paywall");
        }
        pendingActionRef.current = action;
        isWaitingForPurchaseRef.current = true;
        onShowPaywall(requiredCredits);
        return;
      }

      action();
    },
    [isAuthenticated, hasSubscription, requiredCredits, onShowAuthModal, onShowPaywall, isCreditsLoaded]
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
