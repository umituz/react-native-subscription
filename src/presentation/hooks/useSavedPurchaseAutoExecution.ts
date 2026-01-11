/**
 * Saved Purchase Auto-Execution Hook
 * Automatically executes saved purchase when user converts from anonymous to authenticated
 */

import { useEffect, useRef, useCallback } from "react";
import { getSavedPurchase, clearSavedPurchase } from "./useAuthAwarePurchase";
import { usePremium } from "./usePremium";
import { SubscriptionManager } from "../../revenuecat";

declare const __DEV__: boolean;

export interface UseSavedPurchaseAutoExecutionParams {
  userId?: string;
  isAnonymous?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseSavedPurchaseAutoExecutionResult {
  isExecuting: boolean;
}

export const useSavedPurchaseAutoExecution = (
  params: UseSavedPurchaseAutoExecutionParams
): UseSavedPurchaseAutoExecutionResult => {
  const { userId, isAnonymous, onSuccess, onError } = params;
  const { purchasePackage } = usePremium(userId);

  const prevIsAnonymousRef = useRef<boolean | undefined>(undefined);
  const isExecutingRef = useRef(false);

  const executeWithWait = useCallback(async () => {
    const savedPurchase = getSavedPurchase();
    if (!savedPurchase) return;

    if (__DEV__) {
      console.log(
        "[SavedPurchaseAutoExecution] Waiting for RevenueCat initialization..."
      );
    }

    isExecutingRef.current = true;

    const maxAttempts = 20;
    const delayMs = 500;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const isReady = SubscriptionManager.isInitializedForUser(userId);

      if (__DEV__) {
        console.log(
          `[SavedPurchaseAutoExecution] Attempt ${attempt + 1}/${maxAttempts}, isReady: ${isReady}`
        );
      }

      if (isReady) {
        const pkg = savedPurchase.pkg;
        clearSavedPurchase();

        if (__DEV__) {
          console.log(
            "[SavedPurchaseAutoExecution] RevenueCat ready, executing purchase:",
            pkg.product.identifier
          );
        }

        try {
          const success = await purchasePackage(pkg);

          if (__DEV__) {
            console.log("[SavedPurchaseAutoExecution] Purchase result:", success);
          }

          if (success && onSuccess) {
            onSuccess();
          }
        } catch (error) {
          if (__DEV__) {
            console.error("[SavedPurchaseAutoExecution] Purchase failed:", error);
          }
          if (onError && error instanceof Error) {
            onError(error);
          }
        } finally {
          isExecutingRef.current = false;
        }

        return;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (__DEV__) {
      console.log(
        "[SavedPurchaseAutoExecution] Timeout waiting for RevenueCat, clearing saved purchase"
      );
    }
    clearSavedPurchase();
    isExecutingRef.current = false;
  }, [userId, purchasePackage, onSuccess, onError]);

  useEffect(() => {
    const isAuthenticated = !!userId && !isAnonymous;
    const prevIsAnonymous = prevIsAnonymousRef.current;
    const savedPurchase = getSavedPurchase();

    const wasAnonymous = prevIsAnonymous === true;
    const becameAuthenticated = wasAnonymous && isAuthenticated;

    if (__DEV__) {
      console.log("[SavedPurchaseAutoExecution] Check:", {
        userId: userId?.slice(0, 8),
        prevIsAnonymous,
        isAnonymous,
        isAuthenticated,
        wasAnonymous,
        becameAuthenticated,
        hasSavedPurchase: !!savedPurchase,
        willExecute: becameAuthenticated && !!savedPurchase && !isExecutingRef.current,
      });
    }

    if (becameAuthenticated && savedPurchase && !isExecutingRef.current) {
      executeWithWait();
    }

    prevIsAnonymousRef.current = isAnonymous;
  }, [userId, isAnonymous, executeWithWait]);

  return {
    isExecuting: isExecutingRef.current,
  };
};
