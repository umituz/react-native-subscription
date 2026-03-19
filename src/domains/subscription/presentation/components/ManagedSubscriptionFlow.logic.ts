/**
 * ManagedSubscriptionFlow - State Transition Logic
 *
 * Extracted state transition useEffect hooks for better separation.
 */

import { useEffect } from "react";
import { useSubscriptionFlowStore, SubscriptionFlowStatus } from "../useSubscriptionFlow";

interface UseStateTransitionsParams {
  status: SubscriptionFlowStatus;
  isPremium: boolean;
  isSyncing: boolean;
  showFeedback: boolean;
}

/**
 * Hook containing all state transition logic.
 * Extracted for better testability and separation of concerns.
 */
export function useStateTransitions({
  status,
  isPremium,
  isSyncing,
  showFeedback,
}: UseStateTransitionsParams) {
  const completePaywall = useSubscriptionFlowStore((s) => s.completePaywall);
  const showPaywall = useSubscriptionFlowStore((s) => s.showPaywall);
  const showFeedbackScreen = useSubscriptionFlowStore((s) => s.showFeedbackScreen);

  // Transition from CHECK_PREMIUM to appropriate state
  useEffect(() => {
    if (status === SubscriptionFlowStatus.CHECK_PREMIUM && !isSyncing) {
      const paywallShown = useSubscriptionFlowStore.getState().paywallShown;

      if (isPremium) {
        completePaywall(true);
      } else if (!paywallShown) {
        showPaywall();
      } else {
        completePaywall(false);
      }
    }
  }, [status, isPremium, isSyncing, showPaywall, completePaywall]);

  // Show feedback screen when ready
  useEffect(() => {
    if (status === SubscriptionFlowStatus.READY && showFeedback) {
      showFeedbackScreen();
    }
  }, [status, showFeedback, showFeedbackScreen]);
}
