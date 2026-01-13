/**
 * useCreditsGate Hook
 *
 * Single responsibility: Credits gating
 * Checks if user has enough credits before allowing actions.
 *
 * @example
 * ```typescript
 * const { requireCredits, hasCredits } = useCreditsGate({
 *   hasCredits: canAfford(cost),
 *   creditBalance: credits,
 *   requiredCredits: cost,
 *   onCreditsRequired: (required) => showPaywall(required),
 * });
 *
 * const handleGenerate = () => {
 *   requireCredits(() => generate());
 * };
 * ```
 */

import { useCallback } from "react";

export interface UseCreditsGateParams {
  /** Whether user has enough credits for the action */
  hasCredits: boolean;
  /** Current credit balance */
  creditBalance: number;
  /** Credits required for this action (optional, for display) */
  requiredCredits?: number;
  /** Callback when credits are required - receives required amount */
  onCreditsRequired: (requiredCredits?: number) => void;
}

export interface UseCreditsGateResult {
  /** Whether user has enough credits */
  hasCredits: boolean;
  /** Current credit balance */
  creditBalance: number;
  /** Gate action behind credits - executes if has credits, else shows paywall */
  requireCredits: (action: () => void | Promise<void>) => boolean;
}

export function useCreditsGate(
  params: UseCreditsGateParams
): UseCreditsGateResult {
  const { hasCredits, creditBalance, requiredCredits, onCreditsRequired } =
    params;

  const requireCredits = useCallback(
    (_action: () => void | Promise<void>): boolean => {
      if (!hasCredits) {
        onCreditsRequired(requiredCredits);
        return false;
      }
      return true;
    },
    [hasCredits, requiredCredits, onCreditsRequired]
  );

  return {
    hasCredits,
    creditBalance,
    requireCredits,
  };
}
