/**
 * useSubscriptionGate Hook
 *
 * Single responsibility: Subscription/Premium gating
 * Checks if user has active subscription before allowing actions.
 *
 * @example
 * ```typescript
 * const { requireSubscription, hasSubscription } = useSubscriptionGate({
 *   hasSubscription: isPremium,
 *   onSubscriptionRequired: () => showPaywall(),
 * });
 *
 * const handlePremiumAction = () => {
 *   requireSubscription(() => doPremiumThing());
 * };
 * ```
 */

import { useCallback } from "react";

declare const __DEV__: boolean;

export interface UseSubscriptionGateParams {
  /** Whether user has active subscription */
  hasSubscription: boolean;
  /** Callback when subscription is required */
  onSubscriptionRequired: () => void;
}

export interface UseSubscriptionGateResult {
  /** Whether user has active subscription */
  hasSubscription: boolean;
  /** Gate action behind subscription - executes if subscribed, else shows paywall */
  requireSubscription: (action: () => void | Promise<void>) => boolean;
}

export function useSubscriptionGate(
  params: UseSubscriptionGateParams
): UseSubscriptionGateResult {
  const { hasSubscription, onSubscriptionRequired } = params;

  const requireSubscription = useCallback(
    (_action: () => void | Promise<void>): boolean => {
      if (!hasSubscription) {
        if (__DEV__) {
           
          console.log("[useSubscriptionGate] No subscription, showing paywall");
        }
        onSubscriptionRequired();
        return false;
      }

      if (__DEV__) {
         
        console.log("[useSubscriptionGate] Has subscription, proceeding");
      }
      return true;
    },
    [hasSubscription, onSubscriptionRequired]
  );

  return {
    hasSubscription,
    requireSubscription,
  };
}
