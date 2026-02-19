/**
 * Reactive Initialization State
 * Uses useSyncExternalStore pattern to make SubscriptionManager
 * initialization state reactive for React components.
 *
 * Problem: SubscriptionManager.isInitializedForUser() is a plain method call.
 * When BackgroundInitializer completes (500ms+ after auth), React components
 * don't re-render because there's no reactive state change.
 *
 * Solution: This module provides a subscribe/getSnapshot interface that
 * React's useSyncExternalStore can use to trigger re-renders when
 * initialization completes.
 */

type Listener = () => void;

interface InitState {
  initialized: boolean;
  userId: string | null;
}

let state: InitState = { initialized: false, userId: null };
const listeners = new Set<Listener>();

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener());
};

export const initializationState = {
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot: (): InitState => state,

  /**
   * Called by SubscriptionManager after successful initialization.
   * Triggers re-render in all subscribed React components.
   */
  markInitialized: (userId: string | null): void => {
    state = { initialized: true, userId };
    notifyListeners();
  },

  /**
   * Called when initialization starts for a new user (e.g., user switch).
   * Resets the state so queries know they need to wait.
   */
  markPending: (): void => {
    state = { initialized: false, userId: null };
    notifyListeners();
  },

  /**
   * Check if initialized for a specific user.
   */
  isInitializedForUser: (userId: string | null): boolean => {
    return state.initialized && state.userId === userId;
  },

  reset: (): void => {
    state = { initialized: false, userId: null };
    notifyListeners();
  },
};
