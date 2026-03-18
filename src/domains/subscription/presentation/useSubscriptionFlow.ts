/**
 * Subscription Flow Store
 * Manages the high-level application flow: Splash -> Onboarding -> Paywall -> Main App.
 * Uses @umituz/react-native-design-system's storage utility for standardized persistence.
 */

import { createStore } from "@umituz/react-native-design-system/storage";
import { subscriptionEventBus, FLOW_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

export enum SubscriptionFlowStatus {
  INITIALIZING = "INITIALIZING",
  ONBOARDING = "ONBOARDING",
  PAYWALL = "PAYWALL",
  READY = "READY",
  POST_ONBOARDING_PAYWALL = "POST_ONBOARDING_PAYWALL",
}

export enum SyncStatus {
  IDLE = "IDLE",
  SYNCING = "SYNCING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface SubscriptionFlowState {
  status: SubscriptionFlowStatus;
  syncStatus: SyncStatus;
  syncError: string | null;
  isInitialized: boolean;
  isOnboardingComplete: boolean;
  showPostOnboardingPaywall: boolean;
  showFeedback: boolean;
  paywallShown: boolean;
  isAuthModalOpen: boolean;
}

export interface SubscriptionFlowActions {
  completeOnboarding: () => Promise<void>;
  closePostOnboardingPaywall: () => Promise<void>;
  closeFeedback: () => void;
  setAuthModalOpen: (open: boolean) => void;
  markPaywallShown: () => Promise<void>;
  setShowFeedback: (show: boolean) => void;
  resetFlow: () => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  setStatus: (status: SubscriptionFlowStatus) => void;
  setSyncStatus: (status: SyncStatus, error?: string | null) => void;
}

export type SubscriptionFlowStore = SubscriptionFlowState & SubscriptionFlowActions;

const initialState: SubscriptionFlowState = {
  status: SubscriptionFlowStatus.INITIALIZING,
  syncStatus: SyncStatus.IDLE,
  syncError: null,
  isInitialized: false,
  isOnboardingComplete: false,
  showPostOnboardingPaywall: false,
  showFeedback: false,
  paywallShown: false,
  isAuthModalOpen: false,
};

export const useSubscriptionFlowStore = createStore<SubscriptionFlowState, SubscriptionFlowActions>({
  name: "subscription-flow-storage",
  initialState,
  persist: false,
  onRehydrate: (state) => {
    if (!state.isInitialized) {
      state.setInitialized(true);
    }
  },
  actions: (set) => ({
    completeOnboarding: async () => {
      set({
        isOnboardingComplete: true,
        showPostOnboardingPaywall: true,
        status: SubscriptionFlowStatus.POST_ONBOARDING_PAYWALL,
      });
      subscriptionEventBus.emit(FLOW_EVENTS.ONBOARDING_COMPLETED, { timestamp: Date.now() });
    },
    closePostOnboardingPaywall: async () => {
      set({
        showPostOnboardingPaywall: false,
        paywallShown: true,
        status: SubscriptionFlowStatus.READY,
        showFeedback: true, // Show feedback screen when paywall is closed
      });
      subscriptionEventBus.emit(FLOW_EVENTS.PAYWALL_CLOSED, { timestamp: Date.now() });
    },
    closeFeedback: () => set({ showFeedback: false }),
    setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open }),
    setShowFeedback: (show: boolean) => set({ showFeedback: show }),
    markPaywallShown: async () => {
      set({ paywallShown: true });
      subscriptionEventBus.emit(FLOW_EVENTS.PAYWALL_SHOWN, { timestamp: Date.now() });
    },
    setInitialized: (initialized: boolean) => set((state) => {
      if (state.isInitialized === initialized) return state;
      return { isInitialized: initialized };
    }),
    setStatus: (status: SubscriptionFlowStatus) => set((state) => {
      if (state.status === status) return state;
      return { status };
    }),
    setSyncStatus: (syncStatus: SyncStatus, syncError: string | null = null) => 
      set({ syncStatus, syncError }),
    resetFlow: async () => {
      set({
        status: SubscriptionFlowStatus.INITIALIZING,
        syncStatus: SyncStatus.IDLE,
        syncError: null,
        isInitialized: false, // Reset isInitialized to allow fresh initialization
        isOnboardingComplete: false,
        showPostOnboardingPaywall: false,
        showFeedback: false,
        paywallShown: false,
        isAuthModalOpen: false,
      });
    },
  }),
});
