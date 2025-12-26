/**
 * useFeatureGate Hook
 *
 * Feature gating with TanStack Query for server state.
 * Checks auth, premium status, AND credit balance before allowing actions.
 *
 * Flow:
 * 1. NOT authenticated → onShowAuthModal(callback)
 * 2. Authenticated but no credits → onShowPaywall()
 * 3. Authenticated with credits → Execute action
 *
 * @example
 * ```typescript
 * const { requireFeature } = useFeatureGate({
 *   userId: user?.uid,
 *   isAuthenticated: !!user,
 *   onShowAuthModal: (cb) => authModal.show(cb),
 *   onShowPaywall: () => setShowPaywall(true),
 *   creditType: 'image', // or 'text'
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
import type { CreditType } from "../../domain/entities/Credits";

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
  /** Credit type to check (default: 'image') */
  creditType?: CreditType;
}

export interface UseFeatureGateResult {
  /** Gate a feature - checks auth first, then credits balance */
  requireFeature: (action: () => void | Promise<void>) => void;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user has credits remaining */
  hasCredits: boolean;
  /** Whether feature access is allowed */
  canAccess: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Current credit balance for the specified type */
  creditBalance: number;
}

export function useFeatureGate(
  params: UseFeatureGateParams
): UseFeatureGateResult {
  const {
    userId,
    isAuthenticated,
    onShowAuthModal,
    onShowPaywall,
    creditType = "image",
  } = params;

  // Use TanStack Query to get credits (server state)
  const { credits, isLoading, hasImageCredits, hasTextCredits } = useCredits({
    userId,
    enabled: isAuthenticated && !!userId,
  });

  // Check actual credit balance, not just existence
  const hasCredits = creditType === "image" ? hasImageCredits : hasTextCredits;
  const creditBalance =
    creditType === "image"
      ? credits?.imageCredits ?? 0
      : credits?.textCredits ?? 0;

  if (__DEV__) {
    console.log("[useFeatureGate] Hook state", {
      userId,
      isAuthenticated,
      creditType,
      hasCredits,
      creditBalance,
      isLoading,
    });
  }

  const requireFeature = useCallback(
    (action: () => void | Promise<void>) => {
      if (__DEV__) {
        console.log("[useFeatureGate] requireFeature called", {
          isAuthenticated,
          hasCredits,
          creditBalance,
          creditType,
        });
      }

      // Step 1: Check authentication
      if (!isAuthenticated) {
        if (__DEV__) {
          console.log("[useFeatureGate] Not authenticated, showing auth modal");
        }
        onShowAuthModal(() => {
          // We NO LONGER call action() blindly here.
          // The component will re-render with the new auth state,
          // and the user should be allowed to try the action again.
        });
        return;
      }

      // Step 2: Check credit balance (not just existence)
      if (!hasCredits) {
        if (__DEV__) {
          console.log("[useFeatureGate] No credits, showing paywall", {
            creditBalance,
            creditType,
          });
        }
        onShowPaywall();
        return;
      }

      // Step 3: User is authenticated with credits - execute action
      if (__DEV__) {
        console.log("[useFeatureGate] Access granted, executing action");
      }
      action();
    },
    [
      isAuthenticated,
      hasCredits,
      creditBalance,
      creditType,
      onShowAuthModal,
      onShowPaywall,
    ]
  );

  return {
    requireFeature,
    isAuthenticated,
    hasCredits,
    canAccess: isAuthenticated && hasCredits,
    isLoading,
    creditBalance,
  };
}
