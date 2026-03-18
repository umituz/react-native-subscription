/**
 * Subscription Flow Initial State
 *
 * Default state for the subscription flow state machine.
 */

import { SubscriptionFlowStatus, SyncStatus, type SubscriptionFlowState } from "./flowTypes";

/**
 * Initial state for the subscription flow store.
 * Represents a fresh install scenario.
 */
export const initialFlowState: SubscriptionFlowState = {
  status: SubscriptionFlowStatus.INITIALIZING,
  syncStatus: SyncStatus.IDLE,
  syncError: null,
  isOnboardingComplete: false,
  paywallShown: false,
  showFeedback: false,
  isAuthModalOpen: false,
  isInitialized: false,
};
