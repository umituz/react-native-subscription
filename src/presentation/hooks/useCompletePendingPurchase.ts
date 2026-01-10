/**
 * Complete Pending Purchase Hook
 * Centralized hook for completing pending purchases after authentication
 * This is the SINGLE source of truth for post-auth purchase completion
 */

import { useCallback, useRef, useEffect } from "react";
import { usePurchasePackage } from "../../revenuecat/presentation/hooks/usePurchasePackage";
import { usePendingPurchase, pendingPurchaseControl } from "./usePendingPurchase";
import { usePaywallVisibility } from "./usePaywallVisibility";

declare const __DEV__: boolean;

export interface UseCompletePendingPurchaseProps {
  userId: string | undefined;
  isAnonymous: boolean;
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: string) => void;
}

export interface UseCompletePendingPurchaseResult {
  completePendingPurchase: () => Promise<boolean>;
  hasPendingPurchase: boolean;
}

export function useCompletePendingPurchase({
  userId,
  isAnonymous,
  onPurchaseSuccess,
  onPurchaseError,
}: UseCompletePendingPurchaseProps): UseCompletePendingPurchaseResult {
  const { mutateAsync: purchasePackage } = usePurchasePackage(userId);
  const { clearPendingPurchase, hasPendingPurchase } = usePendingPurchase();
  const { closePaywall } = usePaywallVisibility();

  const wasAnonymousRef = useRef(isAnonymous);
  const isProcessingRef = useRef(false);

  const completePendingPurchase = useCallback(async (): Promise<boolean> => {
    // Get current state directly to avoid stale closure
    const currentState = pendingPurchaseControl.get();

    if (!currentState.package) {
      if (__DEV__) console.log("[CompletePendingPurchase] No pending package");
      return false;
    }

    if (!userId) {
      if (__DEV__) console.log("[CompletePendingPurchase] No userId");
      return false;
    }

    if (isProcessingRef.current) {
      if (__DEV__) console.log("[CompletePendingPurchase] Already processing");
      return false;
    }

    isProcessingRef.current = true;
    const pkg = currentState.package;
    const source = currentState.source;

    if (__DEV__) {
      console.log("[CompletePendingPurchase] Completing purchase:", {
        identifier: pkg.product.identifier,
        source,
        userId,
      });
    }

    // Clear pending and close paywall BEFORE purchase to prevent double processing
    clearPendingPurchase();
    closePaywall();

    try {
      const result = await purchasePackage(pkg);

      if (result.success) {
        if (__DEV__) console.log("[CompletePendingPurchase] Purchase SUCCESS");
        onPurchaseSuccess?.();
        return true;
      } else {
        if (__DEV__) console.log("[CompletePendingPurchase] Purchase FAILED");
        onPurchaseError?.("Purchase failed");
        return false;
      }
    } catch (err: any) {
      if (__DEV__) console.error("[CompletePendingPurchase] Purchase ERROR:", err);
      onPurchaseError?.(err.message || String(err));
      return false;
    } finally {
      isProcessingRef.current = false;
    }
  }, [userId, purchasePackage, clearPendingPurchase, closePaywall, onPurchaseSuccess, onPurchaseError]);

  // Auto-complete when user transitions from anonymous to authenticated
  useEffect(() => {
    const wasAnonymous = wasAnonymousRef.current;
    const isNowAuthenticated = userId && !isAnonymous;
    wasAnonymousRef.current = isAnonymous;

    if (__DEV__) {
      console.log("[CompletePendingPurchase] Auth state check:", {
        wasAnonymous,
        isNowAuthenticated,
        hasPending: pendingPurchaseControl.hasPending(),
        pendingId: pendingPurchaseControl.get().package?.product.identifier,
      });
    }

    // Only trigger if user just authenticated AND there's a pending purchase
    if (wasAnonymous && isNowAuthenticated && pendingPurchaseControl.hasPending()) {
      if (__DEV__) {
        console.log("[CompletePendingPurchase] Auth completed, auto-completing purchase");
      }

      // Small delay to ensure all state is settled
      setTimeout(() => {
        completePendingPurchase();
      }, 300);
    }
  }, [userId, isAnonymous, completePendingPurchase]);

  return {
    completePendingPurchase,
    hasPendingPurchase,
  };
}
