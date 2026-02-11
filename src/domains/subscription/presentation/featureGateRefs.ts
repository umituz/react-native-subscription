import { useRef, useEffect, type MutableRefObject } from "react";

export interface FeatureGateRefs {
  creditBalanceRef: MutableRefObject<number>;
  hasSubscriptionRef: MutableRefObject<boolean>;
  onShowPaywallRef: MutableRefObject<(requiredCredits?: number) => void>;
  requiredCreditsRef: MutableRefObject<number>;
}

export const useSyncedRefs = (
  creditBalance: number,
  hasSubscription: boolean,
  onShowPaywall: (requiredCredits?: number) => void,
  requiredCredits: number
): FeatureGateRefs => {
  const creditBalanceRef = useRef(creditBalance);
  const hasSubscriptionRef = useRef(hasSubscription);
  const onShowPaywallRef = useRef(onShowPaywall);
  const requiredCreditsRef = useRef(requiredCredits);

  useEffect(() => { creditBalanceRef.current = creditBalance; }, [creditBalance]);
  useEffect(() => { hasSubscriptionRef.current = hasSubscription; }, [hasSubscription]);
  useEffect(() => { onShowPaywallRef.current = onShowPaywall; }, [onShowPaywall]);
  useEffect(() => { requiredCreditsRef.current = requiredCredits; }, [requiredCredits]);

  return { creditBalanceRef, hasSubscriptionRef, onShowPaywallRef, requiredCreditsRef };
};
