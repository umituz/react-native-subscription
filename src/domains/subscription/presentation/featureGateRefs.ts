import { useRef, useEffect, type MutableRefObject } from "react";

export interface FeatureGateRefs {
  creditBalanceRef: MutableRefObject<number>;
  hasSubscriptionRef: MutableRefObject<boolean>;
  onShowPaywallRef: MutableRefObject<(requiredCredits?: number) => void>;
  requiredCreditsRef: MutableRefObject<number>;
  isCreditsLoadedRef: MutableRefObject<boolean>;
}

export const useSyncedRefs = (
  creditBalance: number,
  hasSubscription: boolean,
  onShowPaywall: (requiredCredits?: number) => void,
  requiredCredits: number,
  isCreditsLoaded: boolean
): FeatureGateRefs => {
  const creditBalanceRef = useRef(creditBalance);
  const hasSubscriptionRef = useRef(hasSubscription);
  const onShowPaywallRef = useRef(onShowPaywall);
  const requiredCreditsRef = useRef(requiredCredits);
  const isCreditsLoadedRef = useRef(isCreditsLoaded);

  useEffect(() => { creditBalanceRef.current = creditBalance; }, [creditBalance]);
  useEffect(() => { hasSubscriptionRef.current = hasSubscription; }, [hasSubscription]);
  useEffect(() => { onShowPaywallRef.current = onShowPaywall; }, [onShowPaywall]);
  useEffect(() => { requiredCreditsRef.current = requiredCredits; }, [requiredCredits]);
  useEffect(() => { isCreditsLoadedRef.current = isCreditsLoaded; }, [isCreditsLoaded]);

  return { creditBalanceRef, hasSubscriptionRef, onShowPaywallRef, requiredCreditsRef, isCreditsLoadedRef };
};
