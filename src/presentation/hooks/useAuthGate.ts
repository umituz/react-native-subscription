/**
 * useAuthGate Hook
 *
 * Single responsibility: Authentication gating
 * Checks if user is authenticated before allowing actions.
 *
 * @example
 * ```typescript
 * const { requireAuth, isAuthenticated } = useAuthGate({
 *   isAuthenticated: !!user && !user.isAnonymous,
 *   onAuthRequired: (callback) => showAuthModal(callback),
 * });
 *
 * const handleAction = () => {
 *   requireAuth(() => doSomething());
 * };
 * ```
 */

import { useCallback } from "react";

declare const __DEV__: boolean;

export interface UseAuthGateParams {
  /** Whether user is authenticated (not guest/anonymous) */
  isAuthenticated: boolean;
  /** Callback when auth is required - receives pending action callback */
  onAuthRequired: (pendingCallback: () => void | Promise<void>) => void;
}

export interface UseAuthGateResult {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Gate action behind auth - executes if authenticated, else shows auth modal */
  requireAuth: (action: () => void | Promise<void>) => boolean;
}

export function useAuthGate(params: UseAuthGateParams): UseAuthGateResult {
  const { isAuthenticated, onAuthRequired } = params;

  const requireAuth = useCallback(
    (action: () => void | Promise<void>): boolean => {
      if (!isAuthenticated) {
        if (__DEV__) {
           
          console.log("[useAuthGate] Not authenticated, showing auth modal");
        }
        onAuthRequired(action);
        return false;
      }

      if (__DEV__) {
         
        console.log("[useAuthGate] Authenticated, proceeding");
      }
      return true;
    },
    [isAuthenticated, onAuthRequired]
  );

  return {
    isAuthenticated,
    requireAuth,
  };
}
