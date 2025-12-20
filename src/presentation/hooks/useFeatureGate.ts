/**
 * useFeatureGate Hook
 *
 * Feature gating with TanStack Query for server state.
 * Checks auth and premium status before allowing actions.
 *
 * Flow:
 * 1. NOT authenticated → onShowAuthModal(callback)
 * 2. Authenticated but not premium → onShowPaywall()
 * 3. Authenticated and premium → Execute action
 *
 * @example
 * ```typescript
 * const { requireFeature } = useFeatureGate({
 *   userId: user?.uid,
 *   isAuthenticated: !!user,
 *   onShowAuthModal: (cb) => authModal.show(cb),
 *   onShowPaywall: () => setShowPaywall(true),
 * });
 *
 * // Gate a premium feature
 * const handleGenerate = () => {
 *   requireFeature(() => generateContent());
 * };
 * ```
 */

import { useCallback } from "react";
import { useCredits } from "./useCredits";

declare const __DEV__: boolean;

export interface UseFeatureGateParams {
  /** User ID for credits check */
  userId: string | undefined;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Callback to show auth modal with pending action */
  onShowAuthModal: (pendingCallback: () => void | Promise<void>) => void;
  /** Callback to show paywall */
  onShowPaywall: () => void;
}

export interface UseFeatureGateResult {
  /** Gate a feature - checks auth first, then premium (credits) */
  requireFeature: (action: () => void | Promise<void>) => void;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user has premium access (has credits) */
  isPremium: boolean;
  /** Whether feature access is allowed */
  canAccess: boolean;
  /** Loading state */
  isLoading: boolean;
}

export function useFeatureGate(
  params: UseFeatureGateParams
): UseFeatureGateResult {
  const { userId, isAuthenticated, onShowAuthModal, onShowPaywall } = params;

  // Use TanStack Query to get credits (server state)
  const { credits, isLoading } = useCredits({
    userId,
    enabled: isAuthenticated && !!userId,
  });

  // User is premium if they have credits
  const isPremium = credits !== null;

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    // eslint-disable-next-line no-console
    console.log("[useFeatureGate] Hook state", {
      userId,
      isAuthenticated,
      isPremium,
      hasCredits: credits !== null,
      isLoading,
    });
  }

  const requireFeature = useCallback(
    (action: () => void | Promise<void>) => {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        // eslint-disable-next-line no-console
        console.log("[useFeatureGate] requireFeature() called", {
          isAuthenticated,
          isPremium,
        });
      }

      // Step 1: Check authentication
      if (!isAuthenticated) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          // eslint-disable-next-line no-console
          console.log("[useFeatureGate] NOT authenticated → showing auth modal");
        }
        // After auth, re-check premium before executing
        onShowAuthModal(() => {
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            // eslint-disable-next-line no-console
            console.log(
              "[useFeatureGate] Auth successful. Component will re-render to check premium status."
            );
          }
          // We NO LONGER call action() blindly here.
          // The component will re-render with the new auth state,
          // and the user should be allowed to try the action again.
          // This avoids executing actions before credits are loaded or verified.
        });
        return;
      }

      // Step 2: Check premium (has credits from TanStack Query)
      if (!isPremium) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          // eslint-disable-next-line no-console
          console.log("[useFeatureGate] NOT premium → showing paywall");
        }
        onShowPaywall();
        return;
      }

      // Step 3: User is authenticated and premium - execute action
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        // eslint-disable-next-line no-console
        console.log("[useFeatureGate] PREMIUM user → executing action");
      }
      action();
    },
    [isAuthenticated, isPremium, onShowAuthModal, onShowPaywall]
  );

  return {
    requireFeature,
    isAuthenticated,
    isPremium,
    canAccess: isAuthenticated && isPremium,
    isLoading,
  };
}
