/**
 * Purchase Loading Store
 * Global state for tracking purchase loading across the app
 * Supports concurrent purchases via Map-based tracking
 * Used by both PaywallModal and useSavedPurchaseAutoExecution
 */

import { create } from "zustand";

export interface PurchaseLoadingState {
  /** Map of product IDs to purchase sources (supports concurrent purchases) */
  activePurchases: Map<string, "manual" | "auto-execution">;
}

export interface PurchaseLoadingActions {
  /** Start purchase loading state for a product */
  startPurchase: (productId: string, source: "manual" | "auto-execution") => void;
  /** End purchase loading state for a product */
  endPurchase: (productId: string) => void;
  /** Check if any purchase is in progress, or if a specific product is being purchased */
  isPurchasing: (productId?: string) => boolean;
  /** Reset all state */
  reset: () => void;
}

export type PurchaseLoadingStore = PurchaseLoadingState & PurchaseLoadingActions;

const initialState: PurchaseLoadingState = {
  activePurchases: new Map(),
};

export const usePurchaseLoadingStore = create<PurchaseLoadingStore>((set, get) => ({
  ...initialState,

  startPurchase: (productId, source) => {
    set((state) => {
      const newPurchases = new Map(state.activePurchases);
      newPurchases.set(productId, source);
      return { activePurchases: newPurchases };
    });
  },

  endPurchase: (productId) => {
    set((state) => {
      const newPurchases = new Map(state.activePurchases);
      newPurchases.delete(productId);
      return { activePurchases: newPurchases };
    });
  },

  isPurchasing: (productId) => {
    const state = get();
    if (productId) return state.activePurchases.has(productId);
    return state.activePurchases.size > 0;
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors for optimized re-renders
export const selectIsPurchasing = (state: PurchaseLoadingStore) => state.activePurchases.size > 0;
export const selectIsProductPurchasing = (productId: string) =>
  (state: PurchaseLoadingStore) => state.activePurchases.has(productId);
export const selectPurchaseSource = (productId: string) =>
  (state: PurchaseLoadingStore) => state.activePurchases.get(productId) ?? null;
