/**
 * Subscription Flow Store
 * Manages the high-level application flow: Splash -> Onboarding -> Paywall -> Main App.
 * Uses @umituz/react-native-design-system's storage utility for standardized persistence.
 */

import { DeviceEventEmitter } from "react-native";
import { createStore } from "@umituz/react-native-design-system/storage";

export interface SubscriptionFlowState {
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
}

export type SubscriptionFlowStore = SubscriptionFlowState & SubscriptionFlowActions;

const initialState: SubscriptionFlowState = {
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
  persist: true,
  // Only persist onboarding and paywall status, other states are transient
  partialize: (state) => ({
    isOnboardingComplete: state.isOnboardingComplete,
    paywallShown: state.paywallShown,
  }),
  onRehydrate: (state) => {
    state.setInitialized(true);
  },
  actions: (set) => ({
    completeOnboarding: async () => {
      set({
        isOnboardingComplete: true,
        showPostOnboardingPaywall: true,
      });
      DeviceEventEmitter.emit("onboarding-complete");
    },
    closePostOnboardingPaywall: async () => {
      set({
        showPostOnboardingPaywall: false,
        paywallShown: true,
      });
    },
    closeFeedback: () => set({ showFeedback: false }),
    setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open }),
    setShowFeedback: (show: boolean) => set({ showFeedback: show }),
    markPaywallShown: async () => set({ paywallShown: true }),
    setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
    resetFlow: async () => {
      set({
        isOnboardingComplete: false,
        showPostOnboardingPaywall: false,
        showFeedback: false,
        paywallShown: false,
        isAuthModalOpen: false,
      });
    },
  }),
});

/**
 * Hook for backward compatibility and easier consumption.
 * Provides a unified object structure matching the previous implementation.
 */
export function useSubscriptionFlow(_userId?: string) {
  const store = useSubscriptionFlowStore();
  
  return {
    state: store,
    completeOnboarding: store.completeOnboarding,
    closePostOnboardingPaywall: store.closePostOnboardingPaywall,
    closeFeedback: store.closeFeedback,
    setAuthModalOpen: store.setAuthModalOpen,
    markPaywallShown: store.markPaywallShown,
    setShowFeedback: store.setShowFeedback,
    resetFlow: store.resetFlow,
  };
}
