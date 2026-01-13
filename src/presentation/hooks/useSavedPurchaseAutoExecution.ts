/**
 * Saved Purchase Auto-Execution Hook
 * Automatically executes saved purchase when user converts from anonymous to authenticated
 */

import { useEffect, useRef } from "react";
import { getSavedPurchase, clearSavedPurchase } from "./useAuthAwarePurchase";
import { usePremium } from "./usePremium";
import { SubscriptionManager } from "../../revenuecat";
import { usePurchaseLoadingStore } from "../stores";

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
  const { startPurchase, endPurchase } = usePurchaseLoadingStore();

  const prevIsAnonymousRef = useRef<boolean | undefined>(undefined);
  const isExecutingRef = useRef(false);
  const hasExecutedRef = useRef(false);

  // Store callbacks in refs to avoid dependency changes
  const purchasePackageRef = useRef(purchasePackage);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const startPurchaseRef = useRef(startPurchase);
  const endPurchaseRef = useRef(endPurchase);

  // Update refs when values change
  useEffect(() => {
    purchasePackageRef.current = purchasePackage;
  }, [purchasePackage]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    startPurchaseRef.current = startPurchase;
  }, [startPurchase]);

  useEffect(() => {
    endPurchaseRef.current = endPurchase;
  }, [endPurchase]);

  useEffect(() => {
    const isAuthenticated = !!userId && !isAnonymous;
    const prevIsAnonymous = prevIsAnonymousRef.current;
    const savedPurchase = getSavedPurchase();

    const wasAnonymous = prevIsAnonymous === true;
    const becameAuthenticated = wasAnonymous && isAuthenticated;

    // Only log when there's a state change worth noting
    const shouldLog = prevIsAnonymousRef.current !== isAnonymous;

    if (__DEV__ && shouldLog) {
      console.log("[SavedPurchaseAutoExecution] Auth state check:", {
        userId: userId?.slice(0, 8),
        prevIsAnonymous,
        isAnonymous,
        isAuthenticated,
        wasAnonymous,
        becameAuthenticated,
        hasSavedPurchase: !!savedPurchase,
        savedProductId: savedPurchase?.pkg.product.identifier,
        willExecute:
          becameAuthenticated &&
          !!savedPurchase &&
          !isExecutingRef.current &&
          !hasExecutedRef.current,
      });
    }

    // Execute only once when transitioning from anonymous to authenticated
    if (
      becameAuthenticated &&
      savedPurchase &&
      !isExecutingRef.current &&
      !hasExecutedRef.current
    ) {
      if (__DEV__) {
        console.log("[SavedPurchaseAutoExecution] Triggering auto-execution...");
      }

      hasExecutedRef.current = true;
      isExecutingRef.current = true;

      // Execute purchase flow
      const executeFlow = async () => {
        const currentUserId = userId;
        if (!currentUserId) {
          isExecutingRef.current = false;
          return;
        }

        if (__DEV__) {
          console.log(
            "[SavedPurchaseAutoExecution] Waiting for RevenueCat initialization...",
            {
              userId: currentUserId.slice(0, 8),
              productId: savedPurchase.pkg.product.identifier,
            }
          );
        }

        const maxAttempts = 20;
        const delayMs = 500;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const isReady = SubscriptionManager.isInitializedForUser(currentUserId);

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
                "[SavedPurchaseAutoExecution] RevenueCat ready, starting purchase...",
                { productId: pkg.product.identifier, userId: currentUserId.slice(0, 8) }
              );
            }

            startPurchaseRef.current(pkg.product.identifier, "auto-execution");

            try {
              if (__DEV__) {
                console.log("[SavedPurchaseAutoExecution] Calling purchasePackage...");
              }

              const success = await purchasePackageRef.current(pkg);

              if (__DEV__) {
                console.log("[SavedPurchaseAutoExecution] Purchase completed:", {
                  success,
                  productId: pkg.product.identifier,
                });
              }

              if (success && onSuccessRef.current) {
                onSuccessRef.current();
              }
            } catch (error) {
              if (__DEV__) {
                console.error("[SavedPurchaseAutoExecution] Purchase error:", {
                  error,
                  productId: pkg.product.identifier,
                });
              }
              if (onErrorRef.current && error instanceof Error) {
                onErrorRef.current(error);
              }
            } finally {
              endPurchaseRef.current();
              isExecutingRef.current = false;

              if (__DEV__) {
                console.log("[SavedPurchaseAutoExecution] Purchase flow finished");
              }
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
      };

      executeFlow();
    }

    prevIsAnonymousRef.current = isAnonymous;
  }, [userId, isAnonymous]);

  return {
    isExecuting: isExecutingRef.current,
  };
};
