/**
 * Purchase Loading Store
 * Global state for tracking purchase loading across the app
 * Used by both PaywallModal and useSavedPurchaseAutoExecution
 */

import { create } from "zustand";

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

export const usePurchaseLoadingStore = create<PurchaseLoadingStore>((set, get) => ({
  ...initialState,

  startPurchase: (productId, source) => {
    const currentState = get();
    if (currentState.isPurchasing) {
      if (__DEV__) {
        console.warn("[PurchaseLoadingStore] startPurchase called while purchase already in progress:", {
          currentProductId: currentState.purchasingProductId,
          newProductId: productId,
          currentSource: currentState.purchaseSource,
          newSource: source,
        });
      }
      // Still update to the new purchase to recover from potential stuck state
    }
    if (__DEV__) {
    }
    set({
      isPurchasing: true,
      purchasingProductId: productId,
      purchaseSource: source,
    });
  },

  endPurchase: () => {
    const currentState = get();
    if (!currentState.isPurchasing) {
      if (__DEV__) {
        console.warn("[PurchaseLoadingStore] endPurchase called while no purchase in progress");
      }
      // Reset to initial state to recover from potential stuck state
    }
    if (__DEV__) {
    }
    set({
      isPurchasing: false,
      purchasingProductId: null,
      purchaseSource: null,
    });
  },

  reset: () => {
    if (__DEV__) {
    }
    set(initialState);
  },
}));

// Selectors for optimized re-renders
export const selectIsPurchasing = (state: PurchaseLoadingStore) => state.isPurchasing;
export const selectPurchasingProductId = (state: PurchaseLoadingStore) => state.purchasingProductId;
export const selectPurchaseSource = (state: PurchaseLoadingStore) => state.purchaseSource;
