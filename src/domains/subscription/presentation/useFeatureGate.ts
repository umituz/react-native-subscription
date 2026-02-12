import { useCallback, useRef, useEffect } from "react";
import type { UseFeatureGateParams, UseFeatureGateResult } from "./useFeatureGate.types";
import { DEFAULT_REQUIRED_CREDITS, shouldExecuteAuthAction, shouldExecutePurchaseAction } from "./featureGateHelpers";
import { useSyncedRefs } from "./featureGateRefs";
import { executeFeatureAction } from "./featureGateActions";

export type { UseFeatureGateParams, UseFeatureGateResult } from "./useFeatureGate.types";

export function useFeatureGate(params: UseFeatureGateParams): UseFeatureGateResult {
  const {
    isAuthenticated,
    onShowAuthModal,
    hasSubscription = false,
    creditBalance,
    requiredCredits = DEFAULT_REQUIRED_CREDITS,
    onShowPaywall,
    isCreditsLoaded = true,
  } = params;

  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const prevCreditBalanceRef = useRef(creditBalance);
  const isWaitingForPurchaseRef = useRef(false);
  const isWaitingForAuthCreditsRef = useRef(false);

  const { creditBalanceRef, hasSubscriptionRef, onShowPaywallRef, requiredCreditsRef } = useSyncedRefs(creditBalance, hasSubscription, onShowPaywall, requiredCredits);

  useEffect(() => {
    if (shouldExecuteAuthAction(
      isWaitingForAuthCreditsRef.current,
      isCreditsLoaded,
      !!pendingActionRef.current,
      hasSubscription,
      creditBalance,
      requiredCredits
    )) {
      isWaitingForAuthCreditsRef.current = false;
      const action = pendingActionRef.current!;
      pendingActionRef.current = null;
      action();
      return;
    }

    if (isWaitingForAuthCreditsRef.current && isCreditsLoaded && pendingActionRef.current) {
      isWaitingForAuthCreditsRef.current = false;
      isWaitingForPurchaseRef.current = true;
      onShowPaywall(requiredCredits);
    }
  }, [isCreditsLoaded, creditBalance, hasSubscription, requiredCredits, onShowPaywall]);

  useEffect(() => {
    if (shouldExecutePurchaseAction(
      isWaitingForPurchaseRef.current,
      creditBalance,
      prevCreditBalanceRef.current ?? 0,
      hasSubscription,
      hasSubscriptionRef.current,
      !!pendingActionRef.current
    )) {
      const action = pendingActionRef.current!;
      pendingActionRef.current = null;
      isWaitingForPurchaseRef.current = false;
      action();
    }

    prevCreditBalanceRef.current = creditBalance;
    hasSubscriptionRef.current = hasSubscription;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditBalance, hasSubscription]);

  const requireFeature = useCallback(
    (action: () => void | Promise<void>) => {
      executeFeatureAction(
        action,
        isAuthenticated,
        onShowAuthModal,
        hasSubscriptionRef,
        creditBalanceRef,
        requiredCreditsRef,
        onShowPaywallRef,
        pendingActionRef,
        isWaitingForAuthCreditsRef,
        isWaitingForPurchaseRef
      );
    },
    [isAuthenticated, onShowAuthModal, hasSubscriptionRef, creditBalanceRef, requiredCreditsRef, onShowPaywallRef]
  );

  return {
    requireFeature,
    isAuthenticated,
    hasSubscription,
    hasCredits: creditBalance >= requiredCredits,
    creditBalance,
    canAccess: isAuthenticated && (hasSubscription || creditBalance >= requiredCredits),
  };
}
