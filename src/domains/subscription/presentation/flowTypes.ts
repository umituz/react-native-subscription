/**
 * Subscription Flow State Machine Types
 *
 * Type definitions for the subscription flow state machine.
 * Separated from implementation for better maintainability.
 */

/**
 * States in the subscription flow.
 * Represents the user's journey from first launch to premium access.
 */
export enum SubscriptionFlowStatus {
  /** App is initializing, determining next state */
  INITIALIZING = "INITIALIZING",
  /** User is seeing onboarding for the first time */
  ONBOARDING = "ONBOARDING",
  /** Checking if user has premium access */
  CHECK_PREMIUM = "CHECK_PREMIUM",
  /** Showing paywall after onboarding */
  POST_ONBOARDING_PAYWALL = "POST_ONBOARDING_PAYWALL",
  /** App is ready to use */
  READY = "READY",
}

/**
 * Sync status for subscription/credits data.
 */
export enum SyncStatus {
  /** No sync in progress */
  IDLE = "IDLE",
  /** Syncing data from RevenueCat/Firestore */
  SYNCING = "SYNCING",
  /** Sync completed successfully */
  SUCCESS = "SUCCESS",
  /** Sync failed with error */
  ERROR = "ERROR",
}

/**
 * Complete state shape for the subscription flow store.
 */
export interface SubscriptionFlowState {
  /** Current flow status */
  status: SubscriptionFlowStatus;

  /** Sync status for subscription/credits data */
  syncStatus: SyncStatus;

  /** Error message from last sync failure */
  syncError: string | null;

  /** Whether user has completed onboarding */
  isOnboardingComplete: boolean;

  /** Whether paywall has been shown at least once */
  paywallShown: boolean;

  /** Whether to show feedback screen */
  showFeedback: boolean;

  /** Whether auth modal is currently open */
  isAuthModalOpen: boolean;

  /** Whether store has been initialized */
  isInitialized: boolean;
}

/**
 * Actions available on the subscription flow store.
 */
export interface SubscriptionFlowActions {
  /** Mark onboarding as complete and transition to CHECK_PREMIUM */
  completeOnboarding: () => void;

  /** Show paywall and transition to POST_ONBOARDING_PAYWALL */
  showPaywall: () => void;

  /** Complete paywall interaction and transition to READY */
  completePaywall: (purchased: boolean) => void;

  /** Show feedback screen */
  showFeedbackScreen: () => void;

  /** Hide feedback screen */
  hideFeedback: () => void;

  /** Open/close auth modal */
  setAuthModalOpen: (open: boolean) => void;

  /** Update sync status */
  setSyncStatus: (status: SyncStatus, error?: string | null) => void;

  /** Set initialized flag (internal use) */
  setInitialized: (initialized: boolean) => void;

  /** Set flow status (internal use) */
  setStatus: (status: SubscriptionFlowStatus) => void;

  /** Reset flow to initial state */
  resetFlow: () => void;
}

/**
 * Combined store type with state and actions.
 */
export type SubscriptionFlowStore = SubscriptionFlowState & SubscriptionFlowActions;
