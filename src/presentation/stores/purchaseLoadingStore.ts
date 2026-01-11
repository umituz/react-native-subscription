/**
 * Purchase Loading Store
 * Global state for tracking purchase loading across the app
 * Used by both PaywallModal and useSavedPurchaseAutoExecution
 */

import { create } from "zustand";

declare const __DEV__: boolean;

export interface PurchaseLoadingState {
  /** Whether a purchase is in progress */
  isPurchasing: boolean;
  /** Product identifier being purchased */
  purchasingProductId: string | null;
  /** Source of the purchase (manual, auto-execution, etc.) */
  purchaseSource: "manual" | "auto-execution" | null;
}

export interface PurchaseLoadingActions {
  /** Start purchase loading state */
  startPurchase: (productId: string, source: "manual" | "auto-execution") => void;
  /** End purchase loading state */
  endPurchase: () => void;
  /** Reset all state */
  reset: () => void;
}

export type PurchaseLoadingStore = PurchaseLoadingState & PurchaseLoadingActions;

const initialState: PurchaseLoadingState = {
  isPurchasing: false,
  purchasingProductId: null,
  purchaseSource: null,
};

export const usePurchaseLoadingStore = create<PurchaseLoadingStore>((set) => ({
  ...initialState,

  startPurchase: (productId, source) => {
    if (__DEV__) {
      console.log("[PurchaseLoadingStore] startPurchase:", { productId, source });
    }
    set({
      isPurchasing: true,
      purchasingProductId: productId,
      purchaseSource: source,
    });
  },

  endPurchase: () => {
    if (__DEV__) {
      console.log("[PurchaseLoadingStore] endPurchase");
    }
    set({
      isPurchasing: false,
      purchasingProductId: null,
      purchaseSource: null,
    });
  },

  reset: () => {
    if (__DEV__) {
      console.log("[PurchaseLoadingStore] reset");
    }
    set(initialState);
  },
}));

// Selectors for optimized re-renders
export const selectIsPurchasing = (state: PurchaseLoadingStore) => state.isPurchasing;
export const selectPurchasingProductId = (state: PurchaseLoadingStore) => state.purchasingProductId;
export const selectPurchaseSource = (state: PurchaseLoadingStore) => state.purchaseSource;
