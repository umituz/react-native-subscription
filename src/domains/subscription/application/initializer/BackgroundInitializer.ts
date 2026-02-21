import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { getCurrentUserId, setupAuthStateListener } from "../SubscriptionAuthListener";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";

const AUTH_STATE_DEBOUNCE_MS = 500; // Wait 500ms before processing auth state changes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

export async function startBackgroundInitialization(config: SubscriptionInitConfig): Promise<() => void> {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let lastUserId: string | undefined = undefined;
  let lastInitSucceeded = false;

  const initializeInBackground = async (revenueCatUserId?: string): Promise<void> => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[BackgroundInitializer] initializeInBackground called with userId:', revenueCatUserId || '(undefined - anonymous)');
    }
    await SubscriptionManager.initialize(revenueCatUserId);
  };

  const attemptInitWithRetry = async (revenueCatUserId?: string, attempt = 0): Promise<void> => {
    // Abort if user changed since retry was scheduled
    if (attempt > 0 && lastUserId !== revenueCatUserId) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[BackgroundInitializer] Aborting retry - user changed');
      }
      return;
    }

    try {
      await initializeInBackground(revenueCatUserId);
      lastUserId = revenueCatUserId;
      lastInitSucceeded = true;
    } catch (error) {
      lastInitSucceeded = false;
      console.error('[BackgroundInitializer] Initialization failed:', {
        userId: revenueCatUserId,
        attempt: attempt + 1,
        maxAttempts: MAX_RETRY_ATTEMPTS,
        error: error instanceof Error ? error.message : String(error)
      });

      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('[BackgroundInitializer] Scheduling retry', { attempt: attempt + 2 });
        }
        retryTimer = setTimeout(() => {
          void attemptInitWithRetry(revenueCatUserId, attempt + 1);
        }, RETRY_DELAY_MS * (attempt + 1));
      } else {
        // After all retries failed, set lastUserId so we don't block
        // but mark as failed so next auth change can retry
        lastUserId = revenueCatUserId;
      }
    }
  };

  const debouncedInitialize = (revenueCatUserId?: string): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    if (lastUserId === revenueCatUserId && lastInitSucceeded) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[BackgroundInitializer] UserId unchanged and init succeeded, skipping');
      }
      return;
    }

    debounceTimer = setTimeout(async () => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[BackgroundInitializer] Auth state listener triggered, reinitializing with userId:', revenueCatUserId || '(undefined - anonymous)');
      }

      // Reset subscription state on logout to prevent stale cache
      if (!revenueCatUserId && lastUserId) {
        await SubscriptionManager.reset();
        lastInitSucceeded = false;
      }

      void attemptInitWithRetry(revenueCatUserId);
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
    lastInitSucceeded = true;
  } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[BackgroundInitializer] Skipping anonymous init, waiting for auth state');
  }

  const unsubscribe = setupAuthStateListener(() => auth, debouncedInitialize);

  return () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    if (retryTimer) {
      clearTimeout(retryTimer);
    }
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
