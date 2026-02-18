import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { getCurrentUserId, setupAuthStateListener } from "../SubscriptionAuthListener";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";

const AUTH_STATE_DEBOUNCE_MS = 500; // Wait 500ms before processing auth state changes

export async function startBackgroundInitialization(config: SubscriptionInitConfig): Promise<() => void> {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastUserId: string | undefined = undefined;

  const initializeInBackground = async (revenueCatUserId?: string): Promise<void> => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[BackgroundInitializer] initializeInBackground called with userId:', revenueCatUserId || '(undefined - anonymous)');
    }
    await SubscriptionManager.initialize(revenueCatUserId);
  };

  const debouncedInitialize = (revenueCatUserId?: string): void => {
    // Clear any pending initialization
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // If userId hasn't changed, skip
    if (lastUserId === revenueCatUserId) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[BackgroundInitializer] UserId unchanged, skipping reinitialization');
      }
      return;
    }

    debounceTimer = setTimeout(async () => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[BackgroundInitializer] Auth state listener triggered, reinitializing with userId:', revenueCatUserId || '(undefined - anonymous)');
      }
      try {
        await initializeInBackground(revenueCatUserId);
        lastUserId = revenueCatUserId;
      } catch (error) {
        // Don't update lastUserId on failure — allow retry on next auth state change
        // with the same userId (e.g., network blip recovers)
        lastUserId = undefined;
        console.error('[BackgroundInitializer] Reinitialization failed:', {
          userId: revenueCatUserId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }, AUTH_STATE_DEBOUNCE_MS);
  };

  const auth = config.getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase auth is not available");
  }

  const initialRevenueCatUserId = getCurrentUserId(() => auth);
  lastUserId = initialRevenueCatUserId;

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[BackgroundInitializer] Initial RevenueCat userId:', initialRevenueCatUserId || '(undefined - anonymous)');
  }

  // Only initialize immediately if we have a real (non-anonymous) user ID.
  // If anonymous, skip and wait for auth listener to provide the real user ID.
  // This prevents a Firestore permission-denied error from querying with an anonymous ID.
  if (initialRevenueCatUserId) {
    await initializeInBackground(initialRevenueCatUserId);
  } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[BackgroundInitializer] Skipping anonymous init, waiting for auth state');
  }

  const unsubscribe = setupAuthStateListener(() => auth, debouncedInitialize);

  return () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
