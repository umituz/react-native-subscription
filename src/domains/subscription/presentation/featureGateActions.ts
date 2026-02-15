import type { MutableRefObject } from "react";

export const executeFeatureAction = (
  action: () => void | Promise<void>,
  isAuthenticated: boolean,
  onShowAuthModal: (callback: () => void | Promise<void>) => void,
  hasSubscriptionRef: MutableRefObject<boolean>,
  creditBalanceRef: MutableRefObject<number>,
  requiredCreditsRef: MutableRefObject<number>,
  onShowPaywallRef: MutableRefObject<(requiredCredits?: number) => void>,
  pendingActionRef: MutableRefObject<(() => void | Promise<void>) | null>,
  isWaitingForAuthCreditsRef: MutableRefObject<boolean>,
  isWaitingForPurchaseRef: MutableRefObject<boolean>,
  isCreditsLoadedRef: MutableRefObject<boolean>
): boolean => {

  if (!isAuthenticated) {
    const postAuthAction = () => {
      if (hasSubscriptionRef.current || creditBalanceRef.current >= requiredCreditsRef.current) {
        action();
        return;
      }

      if (isCreditsLoadedRef.current) {
        pendingActionRef.current = action;
        isWaitingForPurchaseRef.current = true;
        onShowPaywallRef.current(requiredCreditsRef.current);
        return;
      }
      pendingActionRef.current = action;
      isWaitingForAuthCreditsRef.current = true;
    };
    onShowAuthModal(postAuthAction);
    return false;
  }

  if (hasSubscriptionRef.current) {
    action();
    return true;
  }

  if (creditBalanceRef.current < requiredCreditsRef.current) {
    pendingActionRef.current = action;
    isWaitingForPurchaseRef.current = true;
    onShowPaywallRef.current(requiredCreditsRef.current);
    return false;
  }
  action();
  return true;
};
