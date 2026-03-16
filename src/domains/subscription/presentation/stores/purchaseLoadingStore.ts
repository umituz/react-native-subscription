import { create } from "zustand";

interface PurchaseLoadingState {
  activePurchases: Map<string, "manual" | "auto-execution">;
}

interface PurchaseLoadingActions {
  startPurchase: (productId: string, source: "manual" | "auto-execution") => void;
  endPurchase: (productId: string) => void;
  reset: () => void;
}

type PurchaseLoadingStore = PurchaseLoadingState & PurchaseLoadingActions;

const createInitialState = (): PurchaseLoadingState => ({
  activePurchases: new Map(),
});

export const usePurchaseLoadingStore = create<PurchaseLoadingStore>((set) => ({
  ...createInitialState(),

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

  reset: () => {
    set(createInitialState());
  },
}));

/**
 * Optimized selector for purchasing state.
 * Use this to avoid re-renders when other parts of the state change.
 */
export const selectIsPurchasing = (state: PurchaseLoadingStore) => state.activePurchases.size > 0;

/**
 * Optimized selector for a specific product's purchasing state.
 */
export const selectIsProductPurchasing = (productId: string) => (state: PurchaseLoadingStore) => 
  state.activePurchases.has(productId);
