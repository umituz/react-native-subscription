import type { MutableRefObject } from "react";

declare const __DEV__: boolean;

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
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[FeatureGate] executeFeatureAction called:", {
      isAuthenticated,
      hasSubscription: hasSubscriptionRef.current,
      creditBalance: creditBalanceRef.current,
      requiredCredits: requiredCreditsRef.current,
      isCreditsLoaded: isCreditsLoadedRef.current,
    });
  }

  if (!isAuthenticated) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[FeatureGate] User not authenticated, showing auth modal");
    }
    const postAuthAction = () => {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[FeatureGate] Post-auth action called");
      }
      if (hasSubscriptionRef.current || creditBalanceRef.current >= requiredCreditsRef.current) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[FeatureGate] Post-auth: User has access, executing action");
        }
        action();
        return;
      }

      if (isCreditsLoadedRef.current) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("[FeatureGate] Post-auth: Credits loaded, showing paywall");
        }
        pendingActionRef.current = action;
        isWaitingForPurchaseRef.current = true;
        onShowPaywallRef.current(requiredCreditsRef.current);
        return;
      }

      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.log("[FeatureGate] Post-auth: Waiting for credits to load");
      }
      pendingActionRef.current = action;
      isWaitingForAuthCreditsRef.current = true;
    };
    onShowAuthModal(postAuthAction);
    return false;
  }

  if (hasSubscriptionRef.current) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[FeatureGate] User has subscription, executing action");
    }
    action();
    return true;
  }

  if (creditBalanceRef.current < requiredCreditsRef.current) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("[FeatureGate] Insufficient credits, showing paywall");
    }
    pendingActionRef.current = action;
    isWaitingForPurchaseRef.current = true;
    onShowPaywallRef.current(requiredCreditsRef.current);
    return false;
  }

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log("[FeatureGate] User has enough credits, executing action");
  }
  action();
  return true;
};
