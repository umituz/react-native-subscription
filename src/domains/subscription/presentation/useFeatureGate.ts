import { useCallback, useEffect } from "react";
import type { UseFeatureGateParams, UseFeatureGateResult } from "./useFeatureGate.types";
import { DEFAULT_REQUIRED_CREDITS, canExecuteAuthAction, canExecutePurchaseAction } from "../application/featureGate/featureGateBusinessRules";
import { executeFeatureAction } from "./featureGateActions";
import { useFeatureGateRefs, updateLiveRefs } from "./hooks/useFeatureGateState";

export function useFeatureGate(params: UseFeatureGateParams): UseFeatureGateResult {
  const {
    isAuthenticated,
    onShowAuthModal,
    hasSubscription = false,
    creditBalance,
    requiredCredits = DEFAULT_REQUIRED_CREDITS,
    isCreditsLoaded = true,
  } = params;

  const state = useFeatureGateRefs(params);

  // Update live refs when params change
  useEffect(() => {
    updateLiveRefs(state, params);
  });

  // Handle post-auth credit loading and action execution
  useEffect(() => {
    const shouldExecute = canExecuteAuthAction(
      state.isWaitingForAuthCreditsRef.current,
      isCreditsLoaded,
      !!state.pendingActionRef.current,
      hasSubscription,
      creditBalance,
      requiredCredits
    );

    if (shouldExecute) {
      state.isWaitingForAuthCreditsRef.current = false;
      const action = state.pendingActionRef.current!;
      state.pendingActionRef.current = null;
      action();
      return;
    }

    if (state.isWaitingForAuthCreditsRef.current && isCreditsLoaded && state.pendingActionRef.current) {
      state.isWaitingForAuthCreditsRef.current = false;
      state.isWaitingForPurchaseRef.current = true;
      state.onShowPaywallRef.current(state.requiredCreditsRef.current);
    }
  }, [isCreditsLoaded, creditBalance, hasSubscription, requiredCredits, state]);

  // Handle post-purchase action execution
  useEffect(() => {
    const shouldExecute = canExecutePurchaseAction(
      state.isWaitingForPurchaseRef.current,
      creditBalance,
      state.prevCreditBalanceRef.current ?? 0,
      hasSubscription,
      state.prevHasSubscriptionRef.current,
      !!state.pendingActionRef.current
    );

    if (shouldExecute) {
      const action = state.pendingActionRef.current!;
      state.pendingActionRef.current = null;
      state.isWaitingForPurchaseRef.current = false;
      action();
    }

    // Update prev refs AFTER check for next render
    state.prevCreditBalanceRef.current = creditBalance;
    state.prevHasSubscriptionRef.current = hasSubscription;
  }, [creditBalance, hasSubscription, state]);

  const requireFeature = useCallback(
    (action: () => void | Promise<void>): boolean => {
      return executeFeatureAction(
        action,
        isAuthenticated,
        onShowAuthModal,
        state
      );
    },
    [isAuthenticated, onShowAuthModal, state]
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
