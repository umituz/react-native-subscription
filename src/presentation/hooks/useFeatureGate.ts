/**
 * useFeatureGate Hook
 * Unified feature gate: Auth → Subscription → Credits
 * Uses ref pattern to avoid stale closure issues.
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
  } = params;

  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const prevCreditBalanceRef = useRef(creditBalance);
  const isWaitingForPurchaseRef = useRef(false);

  const creditBalanceRef = useRef(creditBalance);
  const hasSubscriptionRef = useRef(hasSubscription);
  const onShowPaywallRef = useRef(onShowPaywall);

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
        });
      }

      if (!isAuthenticated) {
        const postAuthAction = async () => {
          // Wait for free credits to initialize after registration (max 3 seconds)
          const maxWaitTime = 3000;
          const checkInterval = 100;
          let waited = 0;

          while (waited < maxWaitTime) {
            await new Promise((resolve) => setTimeout(resolve, checkInterval));
            waited += checkInterval;

            if (creditBalanceRef.current > 0 || hasSubscriptionRef.current) {
              if (typeof __DEV__ !== "undefined" && __DEV__) {
                console.log("[useFeatureGate] Credits/subscription detected after auth", {
                  credits: creditBalanceRef.current,
                  hasSubscription: hasSubscriptionRef.current,
                  waitedMs: waited,
                });
              }
              break;
            }
          }

          if (hasSubscriptionRef.current) {
            action();
            return;
          }

          const currentBalance = creditBalanceRef.current;
          if (currentBalance < requiredCredits) {
            if (typeof __DEV__ !== "undefined" && __DEV__) {
              console.log("[useFeatureGate] No credits after waiting, showing paywall", {
                credits: currentBalance,
                waitedMs: waited,
              });
            }
            pendingActionRef.current = action;
            isWaitingForPurchaseRef.current = true;
            onShowPaywallRef.current(requiredCredits);
            return;
          }

          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log("[useFeatureGate] Proceeding with action after auth", {
              credits: currentBalance,
            });
          }
          action();
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
    [isAuthenticated, hasSubscription, requiredCredits, onShowAuthModal, onShowPaywall]
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
