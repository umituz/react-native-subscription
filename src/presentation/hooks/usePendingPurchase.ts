/**
 * Pending Purchase Hook
 * Centralized global state for pending package purchase
 * Used by both post-onboarding paywall and in-app paywall
 */

import { useCallback, useSyncExternalStore } from "react";
import type { PurchasesPackage } from "react-native-purchases";

type Listener = () => void;

interface PendingPurchaseState {
  package: PurchasesPackage | null;
  source: "postOnboarding" | "inApp" | null;
}

let state: PendingPurchaseState = {
  package: null,
  source: null,
};

const listeners = new Set<Listener>();

const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): PendingPurchaseState => state;

const setState = (newState: Partial<PendingPurchaseState>): void => {
  state = { ...state, ...newState };
  listeners.forEach((listener) => listener());
};

/**
 * Direct pending purchase control for non-React contexts
 */
export const pendingPurchaseControl = {
  set: (pkg: PurchasesPackage, source: "postOnboarding" | "inApp") => {
    if (__DEV__) {
      console.log("[PendingPurchase] Setting pending package:", {
        identifier: pkg.product.identifier,
        source,
      });
    }
    setState({ package: pkg, source });
  },
  clear: () => {
    if (__DEV__) {
      console.log("[PendingPurchase] Clearing pending package");
    }
    setState({ package: null, source: null });
  },
  get: () => state,
  hasPending: () => state.package !== null,
};

export interface UsePendingPurchaseResult {
  pendingPackage: PurchasesPackage | null;
  pendingSource: "postOnboarding" | "inApp" | null;
  setPendingPurchase: (pkg: PurchasesPackage, source: "postOnboarding" | "inApp") => void;
  clearPendingPurchase: () => void;
  hasPendingPurchase: boolean;
}

export function usePendingPurchase(): UsePendingPurchaseResult {
  const currentState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setPendingPurchase = useCallback(
    (pkg: PurchasesPackage, source: "postOnboarding" | "inApp") => {
      pendingPurchaseControl.set(pkg, source);
    },
    []
  );

  const clearPendingPurchase = useCallback(() => {
    pendingPurchaseControl.clear();
  }, []);

  return {
    pendingPackage: currentState.package,
    pendingSource: currentState.source,
    setPendingPurchase,
    clearPendingPurchase,
    hasPendingPurchase: currentState.package !== null,
  };
}
