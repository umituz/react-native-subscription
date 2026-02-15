import { useCallback, useRef, useEffect } from "react";
import type { UseFeatureGateParams, UseFeatureGateResult } from "./useFeatureGate.types";
import { DEFAULT_REQUIRED_CREDITS, shouldExecuteAuthAction, shouldExecutePurchaseAction } from "./featureGateHelpers";
import { useSyncedRefs } from "./featureGateRefs";
import { executeFeatureAction } from "./featureGateActions";

export type { UseFeatureGateParams, UseFeatureGateResult } from "./useFeatureGate.types";

declare const __DEV__: boolean;

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

  const { creditBalanceRef, hasSubscriptionRef, onShowPaywallRef, requiredCreditsRef, isCreditsLoadedRef } = useSyncedRefs(creditBalance, hasSubscription, onShowPaywall, requiredCredits, isCreditsLoaded);

  useEffect(() => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[FeatureGate] Auth completion useEffect triggered:", {
        isWaitingForAuthCredits: isWaitingForAuthCreditsRef.current,
        isCreditsLoaded,
        hasPendingAction: !!pendingActionRef.current,
        hasSubscription,
        creditBalance,
        requiredCredits,
      });
    }

    const shouldExecute = shouldExecuteAuthAction(
      isWaitingForAuthCreditsRef.current,
      isCreditsLoaded,
      !!pendingActionRef.current,
      hasSubscription,
      creditBalance,
      requiredCredits
    );

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[FeatureGate] shouldExecuteAuthAction:", shouldExecute);
    }

    if (shouldExecute) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[FeatureGate] ✅ EXECUTING PENDING ACTION after auth!");
      }
      isWaitingForAuthCreditsRef.current = false;
      const action = pendingActionRef.current!;
      pendingActionRef.current = null;
      action();
      return;
    }

    if (isWaitingForAuthCreditsRef.current && isCreditsLoaded && pendingActionRef.current) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[FeatureGate] Auth credits loaded but insufficient, showing paywall");
      }
      isWaitingForAuthCreditsRef.current = false;
      isWaitingForPurchaseRef.current = true;
      onShowPaywall(requiredCredits);
    }
  }, [isCreditsLoaded, creditBalance, hasSubscription, requiredCredits, onShowPaywall]);

  useEffect(() => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[FeatureGate] Purchase completion useEffect triggered:", {
        creditBalance,
        prevCreditBalance: prevCreditBalanceRef.current,
        hasSubscription,
        prevHasSubscription: hasSubscriptionRef.current,
        isWaitingForPurchase: isWaitingForPurchaseRef.current,
        hasPendingAction: !!pendingActionRef.current,
      });
    }

    const shouldExecute = shouldExecutePurchaseAction(
      isWaitingForPurchaseRef.current,
      creditBalance,
      prevCreditBalanceRef.current ?? 0,
      hasSubscription,
      hasSubscriptionRef.current,
      !!pendingActionRef.current
    );

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[FeatureGate] shouldExecutePurchaseAction:", shouldExecute);
    }

    if (shouldExecute) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[FeatureGate] ✅ EXECUTING PENDING ACTION after purchase!");
      }
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
        isWaitingForPurchaseRef,
        isCreditsLoadedRef
      );
    },
    [isAuthenticated, onShowAuthModal, hasSubscriptionRef, creditBalanceRef, requiredCreditsRef, onShowPaywallRef, isCreditsLoadedRef]
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
