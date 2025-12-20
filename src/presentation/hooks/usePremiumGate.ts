/**
 * usePremiumGate Hook
 *
 * Feature gating hook for premium-only features
 * Provides a simple way to gate features behind premium subscription
 *
 * @example
 * ```typescript
 * const { requirePremium, isPremium } = usePremiumGate({
 *   isPremium: subscriptionStore.isPremium,
 *   onPremiumRequired: () => navigation.navigate('Paywall'),
 * });
 *
 * const handleGenerate = () => {
 *   requirePremium(() => {
 *     // This only runs if user is premium
 *     generateContent();
 *   });
 * };
 * ```
 */

import { useCallback, useMemo } from "react";

export interface UsePremiumGateParams {
  /** Whether user has premium access */
  isPremium: boolean;
  /** Callback when premium is required but user is not premium */
  onPremiumRequired: () => void;
  /** Optional: Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Optional: Callback when auth is required but user is not authenticated */
  onAuthRequired?: () => void;
}

export interface UsePremiumGateResult {
  /** Whether user has premium access */
  isPremium: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Gate a feature behind premium - executes action if premium, else calls onPremiumRequired */
  requirePremium: (action: () => void) => void;
  /** Gate a feature behind auth - executes action if authenticated, else calls onAuthRequired */
  requireAuth: (action: () => void) => void;
  /** Gate a feature behind both auth and premium */
  requirePremiumWithAuth: (action: () => void) => void;
  /** Check if feature is accessible (premium check only) */
  canAccess: boolean;
  /** Check if feature is accessible (auth + premium) */
  canAccessWithAuth: boolean;
}

export function usePremiumGate(
  params: UsePremiumGateParams
): UsePremiumGateResult {
  const {
    isPremium,
    onPremiumRequired,
    isAuthenticated = true,
    onAuthRequired,
  } = params;

  const requirePremium = useCallback(
    (action: () => void) => {
      if (isPremium) {
        action();
      } else {
        onPremiumRequired();
      }
    },
    [isPremium, onPremiumRequired]
  );

  const requireAuth = useCallback(
    (action: () => void) => {
      if (isAuthenticated) {
        action();
      } else {
        onAuthRequired?.();
      }
    },
    [isAuthenticated, onAuthRequired]
  );

  const requirePremiumWithAuth = useCallback(
    (action: () => void) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      if (!isPremium) {
        onPremiumRequired();
        return;
      }
      action();
    },
    [isAuthenticated, isPremium, onAuthRequired, onPremiumRequired]
  );

  const canAccess = useMemo(() => isPremium, [isPremium]);

  const canAccessWithAuth = useMemo(
    () => isAuthenticated && isPremium,
    [isAuthenticated, isPremium]
  );

  return {
    isPremium,
    isAuthenticated,
    requirePremium,
    requireAuth,
    requirePremiumWithAuth,
    canAccess,
    canAccessWithAuth,
  };
}
