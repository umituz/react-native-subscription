import type { FeatureGateState } from "./hooks/useFeatureGateState";

/**
 * Executes a feature action with proper auth, subscription, and credit checks.
 * Queues the action if waiting for auth completion or purchase flow.
 *
 * @param action - The action to execute when conditions are met
 * @param isAuthenticated - Whether user is authenticated
 * @param onShowAuthModal - Callback to show auth modal
 * @param state - Feature gate state containing all refs and flags
 * @returns true if action was executed immediately, false if queued/pending
 */
export function executeFeatureAction(
  action: () => void | Promise<void>,
  isAuthenticated: boolean,
  onShowAuthModal: (callback: () => void | Promise<void>) => void,
  state: FeatureGateState
): boolean {

  if (!isAuthenticated) {
    const postAuthAction = () => {
      if (state.hasSubscriptionRef.current || state.creditBalanceRef.current >= state.requiredCreditsRef.current) {
        action();
        return;
      }

      if (state.isCreditsLoadedRef.current) {
        state.pendingActionRef.current = action;
        state.isWaitingForPurchaseRef.current = true;
        state.onShowPaywallRef.current(state.requiredCreditsRef.current);
        return;
      }
      state.pendingActionRef.current = action;
      state.isWaitingForAuthCreditsRef.current = true;
    };
    onShowAuthModal(postAuthAction);
    return false;
  }

  if (state.hasSubscriptionRef.current) {
    action();
    return true;
  }

  if (state.creditBalanceRef.current < state.requiredCreditsRef.current) {
    state.pendingActionRef.current = action;
    state.isWaitingForPurchaseRef.current = true;
    state.onShowPaywallRef.current(state.requiredCreditsRef.current);
    return false;
  }
  action();
  return true;
}
