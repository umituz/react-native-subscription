import { useCallback, useRef, useEffect } from "react";
import type { UseFeatureGateParams, UseFeatureGateResult } from "./useFeatureGate.types";
import { DEFAULT_REQUIRED_CREDITS, canExecuteAuthAction, canExecutePurchaseAction } from "../application/featureGate/featureGateBusinessRules";
import { useSyncedRefs } from "./featureGateRefs";
import { executeFeatureAction } from "./featureGateActions";

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
  // Separate ref to track previous subscription state for canExecutePurchaseAction.
  // NOTE: Must NOT use hasSubscriptionRef from useSyncedRefs here because useSyncedRefs
  // effects run BEFORE this effect (React runs effects in definition order), so
  // hasSubscriptionRef.current would already be the NEW value when we check it.
  const prevHasSubscriptionRef = useRef(hasSubscription);
  const isWaitingForPurchaseRef = useRef(false);
  const isWaitingForAuthCreditsRef = useRef(false);

  const { creditBalanceRef, hasSubscriptionRef, onShowPaywallRef, requiredCreditsRef, isCreditsLoadedRef } = useSyncedRefs(creditBalance, hasSubscription, onShowPaywall, requiredCredits, isCreditsLoaded);

  useEffect(() => {
    const shouldExecute = canExecuteAuthAction(
      isWaitingForAuthCreditsRef.current,
      isCreditsLoaded,
      !!pendingActionRef.current,
      hasSubscription,
      creditBalance,
      requiredCredits
    );

    if (shouldExecute) {
      isWaitingForAuthCreditsRef.current = false;
      const action = pendingActionRef.current!;
      pendingActionRef.current = null;
      action();
      return;
    }

    if (isWaitingForAuthCreditsRef.current && isCreditsLoaded && pendingActionRef.current) {
      isWaitingForAuthCreditsRef.current = false;
      isWaitingForPurchaseRef.current = true;
      // Use ref to avoid unstable callback dependency
      onShowPaywallRef.current(requiredCreditsRef.current);
    }
    // Removed onShowPaywall from dependencies - using ref instead
  }, [isCreditsLoaded, creditBalance, hasSubscription, requiredCredits, onShowPaywallRef, requiredCreditsRef]);

  useEffect(() => {
    // Use prevHasSubscriptionRef (updated AFTER check) not hasSubscriptionRef from useSyncedRefs
    // (which is already updated to new value before this effect runs - race condition fix)
    const shouldExecute = canExecutePurchaseAction(
      isWaitingForPurchaseRef.current,
      creditBalance,
      prevCreditBalanceRef.current ?? 0,
      hasSubscription,
      prevHasSubscriptionRef.current,
      !!pendingActionRef.current
    );

    if (shouldExecute) {
      const action = pendingActionRef.current!;
      pendingActionRef.current = null;
      isWaitingForPurchaseRef.current = false;
      action();
    }

    // Update AFTER check so next render has correct "prev" values
    prevCreditBalanceRef.current = creditBalance;
    prevHasSubscriptionRef.current = hasSubscription;
     
  }, [creditBalance, hasSubscription]);

  const requireFeature = useCallback(
    (action: () => void | Promise<void>): boolean => {
      return executeFeatureAction(
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
