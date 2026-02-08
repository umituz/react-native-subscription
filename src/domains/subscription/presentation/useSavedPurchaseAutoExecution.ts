/**
 * Saved Purchase Auto-Execution Hook
 * Automatically executes saved purchase when user converts from anonymous to authenticated
 */

import { useEffect, useRef } from "react";
import {
  useAuthStore,
  selectUserId,
  selectIsAnonymous,
} from "@umituz/react-native-auth";
import { getSavedPurchase, clearSavedPurchase } from "./useAuthAwarePurchase";
import { usePremium } from "./usePremium";
import { SubscriptionManager } from "../../revenuecat";
import { usePurchaseLoadingStore } from "../stores";

export interface UseSavedPurchaseAutoExecutionParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseSavedPurchaseAutoExecutionResult {
  isExecuting: boolean;
}

export const useSavedPurchaseAutoExecution = (
  params?: UseSavedPurchaseAutoExecutionParams
): UseSavedPurchaseAutoExecutionResult => {
  const { onSuccess, onError } = params ?? {};

  const userId = useAuthStore(selectUserId);
  const isAnonymous = useAuthStore(selectIsAnonymous);

  const { purchasePackage } = usePremium();
  const { startPurchase, endPurchase } = usePurchaseLoadingStore();

  const prevIsAnonymousRef = useRef<boolean | undefined>(undefined);
  const isExecutingRef = useRef(false);
  const hasExecutedRef = useRef(false);

  const purchasePackageRef = useRef(purchasePackage);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const startPurchaseRef = useRef(startPurchase);
  const endPurchaseRef = useRef(endPurchase);

  // Consolidate all ref updates into a single effect
  useEffect(() => {
    purchasePackageRef.current = purchasePackage;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    startPurchaseRef.current = startPurchase;
    endPurchaseRef.current = endPurchase;
  }, [purchasePackage, onSuccess, onError, startPurchase, endPurchase]);

  useEffect(() => {
    const isAuthenticated = !!userId && !isAnonymous;
    const prevIsAnonymous = prevIsAnonymousRef.current;
    const savedPurchase = getSavedPurchase();

    const wasAnonymous = prevIsAnonymous === true;
    const becameAuthenticated = wasAnonymous && isAuthenticated;

    const shouldLog = prevIsAnonymousRef.current !== isAnonymous;

    if (typeof __DEV__ !== "undefined" && __DEV__ && shouldLog) {
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

    if (
      becameAuthenticated &&
      savedPurchase &&
      !isExecutingRef.current &&
      !hasExecutedRef.current
    ) {
      hasExecutedRef.current = true;
      isExecutingRef.current = true;

      const executeFlow = async () => {
        const currentUserId = userId;
        if (!currentUserId) {
          isExecutingRef.current = false;
          return;
        }

        const maxAttempts = 20;
        const delayMs = 500;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const isReady = SubscriptionManager.isInitializedForUser(currentUserId);

          if (isReady) {
            const pkg = savedPurchase.pkg;

            startPurchaseRef.current(pkg.product.identifier, "auto-execution");

            try {
              const success = await purchasePackageRef.current(pkg);

              if (success) {
                clearSavedPurchase();
                if (onSuccessRef.current) {
                  onSuccessRef.current();
                }
              }
            } catch (error) {
              if (onErrorRef.current && error instanceof Error) {
                onErrorRef.current(error);
              }
            } finally {
              endPurchaseRef.current();
              isExecutingRef.current = false;
            }

            return;
          }

          await new Promise((resolve) => setTimeout(resolve, delayMs));
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
