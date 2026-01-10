/**
 * Pending Purchase Store
 * Manages pending purchase state for auth-required purchases
 */

import { createStore } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import type { PurchaseSource } from "../../domain/entities/Credits";

export interface PendingPurchaseData {
  package: PurchasesPackage;
  source: PurchaseSource;
  selectedAt: number;
  metadata?: Record<string, unknown>;
}

interface PendingPurchaseState {
  pending: PendingPurchaseData | null;
}

interface PendingPurchaseActions {
  setPendingPurchase: (data: PendingPurchaseData) => void;
  getPendingPurchase: () => PendingPurchaseData | null;
  clearPendingPurchase: () => void;
  hasPendingPurchase: () => boolean;
}

const initialState: PendingPurchaseState = {
  pending: null,
};

export const usePendingPurchaseStore = createStore<
  PendingPurchaseState,
  PendingPurchaseActions
>({
  name: "pending-purchase-store",
  initialState,
  persist: false,
  actions: (set, get) => ({
    setPendingPurchase: (data: PendingPurchaseData) => {
      set({ pending: data });
    },

    getPendingPurchase: () => {
      return get().pending;
    },

    clearPendingPurchase: () => {
      set({ pending: null });
    },

    hasPendingPurchase: () => {
      return get().pending !== null;
    },
  }),
});
