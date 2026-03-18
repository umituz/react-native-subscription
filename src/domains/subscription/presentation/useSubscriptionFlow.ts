/**
 * Subscription Flow State Machine
 *
 * Single source of truth for app flow state.
 * Clean state transitions without complex if/else logic.
 */

import { createStore } from "@umituz/react-native-design-system/storage";
import { subscriptionEventBus, FLOW_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";

export enum SubscriptionFlowStatus {
  INITIALIZING = "INITIALIZING",
  ONBOARDING = "ONBOARDING",
  CHECK_PREMIUM = "CHECK_PREMIUM",
  POST_ONBOARDING_PAYWALL = "POST_ONBOARDING_PAYWALL",
  READY = "READY",
}

export enum SyncStatus {
  IDLE = "IDLE",
  SYNCING = "SYNCING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface SubscriptionFlowState {
  // Flow state
  status: SubscriptionFlowStatus;

  // Sync state
  syncStatus: SyncStatus;
  syncError: string | null;

  // Onboarding state
  isOnboardingComplete: boolean;

  // Paywall state
  paywallShown: boolean;

  // Feedback state
  showFeedback: boolean;

  // Auth modal state
  isAuthModalOpen: boolean;

  // Initialization flag
  isInitialized: boolean;
}

export interface SubscriptionFlowActions {
  // Flow actions
  completeOnboarding: () => void;
  showPaywall: () => void;
  completePaywall: (purchased: boolean) => void;
  showFeedbackScreen: () => void;
  hideFeedback: () => void;

  // Auth actions
  setAuthModalOpen: (open: boolean) => void;

  // Sync actions
  setSyncStatus: (status: SyncStatus, error?: string | null) => void;

  // State setters (for internal use)
  setInitialized: (initialized: boolean) => void;
  setStatus: (status: SubscriptionFlowStatus) => void;

  // Reset
  resetFlow: () => void;
}

export type SubscriptionFlowStore = SubscriptionFlowState & SubscriptionFlowActions;

const initialState: SubscriptionFlowState = {
  status: SubscriptionFlowStatus.INITIALIZING,
  syncStatus: SyncStatus.IDLE,
  syncError: null,
  isOnboardingComplete: false,
  paywallShown: false,
  showFeedback: false,
  isAuthModalOpen: false,
  isInitialized: false,
};

/**
 * State transition rules:
 *
 * INITIALIZING -> ONBOARDING (first launch)
 * INITIALIZING -> CHECK_PREMIUM (onboarding already done)
 *
 * ONBOARDING -> CHECK_PREMIUM (onboarding completed)
 *
 * CHECK_PREMIUM -> READY (user is premium)
 * CHECK_PREMIUM -> POST_ONBOARDING_PAYWALL (user not premium, paywall not shown)
 * CHECK_PREMIUM -> READY (user not premium but paywall already shown)
 *
 * POST_ONBOARDING_PAYWALL -> READY (paywall closed)
 *
 * READY -> READY (stays ready, shows overlays when needed)
 */
export const useSubscriptionFlowStore = createStore<SubscriptionFlowState, SubscriptionFlowActions>({
  name: "subscription-flow-storage",
  initialState,
  persist: true,
  onRehydrate: (state) => {
    if (!state.isInitialized) {
      state.setInitialized(true);

      // First time: show onboarding
      state.setStatus(SubscriptionFlowStatus.INITIALIZING);
    } else if (state.isOnboardingComplete) {
      // Onboarding done, check premium status
      state.setStatus(SubscriptionFlowStatus.CHECK_PREMIUM);
    } else {
      // Show onboarding
      state.setStatus(SubscriptionFlowStatus.ONBOARDING);
    }
  },
  actions: (set) => ({
    setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
    setStatus: (status: SubscriptionFlowStatus) => set({ status }),

    completeOnboarding: () => {
      set({
        isOnboardingComplete: true,
        status: SubscriptionFlowStatus.CHECK_PREMIUM,
      });
      subscriptionEventBus.emit(FLOW_EVENTS.ONBOARDING_COMPLETED, { timestamp: Date.now() });
    },

    checkPremiumStatus: () => {
      // This is a transient state - the component will check isPremium
      // and transition accordingly
      set({ status: SubscriptionFlowStatus.CHECK_PREMIUM });
    },

    showPaywall: () => {
      set({
        status: SubscriptionFlowStatus.POST_ONBOARDING_PAYWALL,
        paywallShown: true,
      });
      subscriptionEventBus.emit(FLOW_EVENTS.PAYWALL_SHOWN, { timestamp: Date.now() });
    },

    completePaywall: (purchased: boolean) => {
      set({
        status: SubscriptionFlowStatus.READY,
        paywallShown: true,
        showFeedback: !purchased, // Only show feedback if not purchased
      });
      subscriptionEventBus.emit(FLOW_EVENTS.PAYWALL_CLOSED, {
        timestamp: Date.now(),
        purchased
      });
    },

    showFeedbackScreen: () => set({ showFeedback: true }),
    hideFeedback: () => set({ showFeedback: false }),

    setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open }),

    setSyncStatus: (syncStatus: SyncStatus, syncError: string | null = null) =>
      set({ syncStatus, syncError }),

    resetFlow: () => {
      set({
        status: SubscriptionFlowStatus.INITIALIZING,
        syncStatus: SyncStatus.IDLE,
        syncError: null,
        isOnboardingComplete: false,
        paywallShown: false,
        showFeedback: false,
        isAuthModalOpen: false,
        isInitialized: false,
      });
    },
  }),
});
