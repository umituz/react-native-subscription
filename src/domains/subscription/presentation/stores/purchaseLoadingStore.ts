import { create } from "zustand";

interface PurchaseLoadingState {
  activePurchases: Map<string, "manual" | "auto-execution">;
}

interface PurchaseLoadingActions {
  startPurchase: (productId: string, source: "manual" | "auto-execution") => void;
  endPurchase: (productId: string) => void;
  isPurchasing: (productId?: string) => boolean;
  reset: () => void;
}

type PurchaseLoadingStore = PurchaseLoadingState & PurchaseLoadingActions;

const createInitialState = (): PurchaseLoadingState => ({
  activePurchases: new Map(),
});

export const usePurchaseLoadingStore = create<PurchaseLoadingStore>((set, get) => ({
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

  isPurchasing: (productId) => {
    const state = get();
    if (productId) return state.activePurchases.has(productId);
    return state.activePurchases.size > 0;
  },

  reset: () => {
    set(createInitialState());
  },
}));

export const selectIsPurchasing = (state: PurchaseLoadingStore) => state.activePurchases.size > 0;
