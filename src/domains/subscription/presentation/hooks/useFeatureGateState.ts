import { useRef } from "react";
import type { UseFeatureGateParams } from "../useFeatureGate.types";

/**
 * Internal state management for useFeatureGate hook.
 * Encapsulates all refs and state to reduce parameter passing.
 */
export interface FeatureGateState {
  // Action queue
  pendingActionRef: React.MutableRefObject<(() => void | Promise<void>) | null>;

  // Previous values for change detection
  prevCreditBalanceRef: React.MutableRefObject<number | undefined>;
  prevHasSubscriptionRef: React.MutableRefObject<boolean>;

  // Waiting flags for async operations
  isWaitingForAuthCreditsRef: React.MutableRefObject<boolean>;
  isWaitingForPurchaseRef: React.MutableRefObject<boolean>;

  // Live refs (synced with current values)
  creditBalanceRef: React.MutableRefObject<number>;
  hasSubscriptionRef: React.MutableRefObject<boolean>;
  onShowPaywallRef: React.MutableRefObject<(requiredCredits?: number) => void>;
  requiredCreditsRef: React.MutableRefObject<number>;
  isCreditsLoadedRef: React.MutableRefObject<boolean>;
}

/**
 * Creates and initializes all refs for useFeatureGate.
 * This encapsulates ref creation and initialization logic.
 */
export function useFeatureGateRefs(params: UseFeatureGateParams): FeatureGateState {
  const {
    creditBalance,
    hasSubscription = false,
    onShowPaywall,
    requiredCredits = 1,
    isCreditsLoaded = true,
  } = params;

  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const prevCreditBalanceRef = useRef(creditBalance);
  const prevHasSubscriptionRef = useRef(hasSubscription);
  const isWaitingForAuthCreditsRef = useRef(false);
  const isWaitingForPurchaseRef = useRef(false);

  return {
    pendingActionRef,
    prevCreditBalanceRef,
    prevHasSubscriptionRef,
    isWaitingForAuthCreditsRef,
    isWaitingForPurchaseRef,
    creditBalanceRef: useRef(creditBalance),
    hasSubscriptionRef: useRef(hasSubscription),
    onShowPaywallRef: useRef(onShowPaywall),
    requiredCreditsRef: useRef(requiredCredits),
    isCreditsLoadedRef: useRef(isCreditsLoaded),
  };
}

/**
 * Updates live refs when their source values change.
 * Call this in a useEffect or when values update.
 */
export function updateLiveRefs(
  state: FeatureGateState,
  params: Pick<UseFeatureGateParams, 'creditBalance' | 'hasSubscription' | 'onShowPaywall' | 'requiredCredits' | 'isCreditsLoaded'>
): void {
  const { creditBalance, hasSubscription, onShowPaywall, requiredCredits, isCreditsLoaded } = params;

  state.creditBalanceRef.current = creditBalance;
  state.hasSubscriptionRef.current = hasSubscription ?? false;
  state.onShowPaywallRef.current = onShowPaywall;
  state.requiredCreditsRef.current = requiredCredits ?? 0;
  state.isCreditsLoadedRef.current = isCreditsLoaded ?? false;
}
