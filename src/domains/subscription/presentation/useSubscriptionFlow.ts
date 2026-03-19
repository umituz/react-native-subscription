/**
 * Subscription Flow State Machine
 *
 * Single source of truth for app flow state.
 * Clean state transitions without complex if/else logic.
 *
 * State transition rules:
 * - INITIALIZING -> ONBOARDING (first launch)
 * - INITIALIZING -> CHECK_PREMIUM (onboarding already done)
 * - ONBOARDING -> CHECK_PREMIUM (onboarding completed)
 * - CHECK_PREMIUM -> READY (user is premium)
 * - CHECK_PREMIUM -> POST_ONBOARDING_PAYWALL (user not premium, paywall not shown)
 * - CHECK_PREMIUM -> READY (user not premium but paywall already shown)
 * - POST_ONBOARDING_PAYWALL -> READY (paywall closed)
 * - READY -> READY (stays ready, shows overlays when needed)
 */

import { createStore } from "@umituz/react-native-design-system/storage";
import { subscriptionEventBus, FLOW_EVENTS } from "../../../shared/infrastructure/SubscriptionEventBus";
import {
  SubscriptionFlowStatus,
  SyncStatus,
  type SubscriptionFlowState,
  type SubscriptionFlowActions,
} from "./flowTypes";
import { initialFlowState } from "./flowInitialState";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSubscriptionFlowStore = createStore<SubscriptionFlowState, SubscriptionFlowActions>({
  name: "subscription-flow-storage",
  initialState: initialFlowState,
  persist: true,
  storage: AsyncStorage,
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

// Re-export types for convenience
export type { SubscriptionFlowState, SubscriptionFlowActions } from "./flowTypes";
export { SubscriptionFlowStatus, SyncStatus } from "./flowTypes";

// Re-export store type inferred from createStore
export type SubscriptionFlowStore = ReturnType<typeof useSubscriptionFlowStore>;
