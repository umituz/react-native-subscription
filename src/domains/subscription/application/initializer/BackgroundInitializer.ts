import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { getCurrentUserId, setupAuthStateListener } from "../SubscriptionAuthListener";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";
import { createLogger } from "../../../../shared/utils/logger";

const logger = createLogger("BackgroundInitializer");

const AUTH_STATE_DEBOUNCE_MS = 500;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

export async function startBackgroundInitialization(config: SubscriptionInitConfig): Promise<() => void> {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Track the ID of the current initialization sequence to abort stale retries/state updates
  let currentSequenceId = 0;
  let lastInitSucceeded = false;
  let lastUserId: string | undefined = undefined;

  const initializeInBackground = async (revenueCatUserId?: string): Promise<void> => {
    logger.debug("initializeInBackground called with userId", revenueCatUserId || '(undefined - anonymous)');
    await SubscriptionManager.initialize(revenueCatUserId);
  };

  const attemptInitWithRetry = async (revenueCatUserId: string | undefined, attempt: number, sequenceId: number): Promise<void> => {
    // Abort if this is no longer the active sequence (e.g., user changed)
    if (sequenceId !== currentSequenceId) {
      logger.debug("Aborting retry - sequence changed");
      return;
    }

    try {
      await initializeInBackground(revenueCatUserId);
      if (sequenceId === currentSequenceId) {
        lastInitSucceeded = true;
      }
    } catch (error) {
      if (sequenceId !== currentSequenceId) return;

      lastInitSucceeded = false;
      logger.error("Initialization failed", error, {
        userId: revenueCatUserId,
        attempt: attempt + 1,
        maxAttempts: MAX_RETRY_ATTEMPTS,
      });

      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        logger.debug("Scheduling retry", { attempt: attempt + 2 });
        retryTimer = setTimeout(() => {
          // Fire and forget promise, but safe because of sequenceId check
          attemptInitWithRetry(revenueCatUserId, attempt + 1, sequenceId).catch(err => {
              logger.error("Retry failed unhandled", err);
          });
        }, RETRY_DELAY_MS * (attempt + 1));
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
      logger.debug("UserId unchanged and init succeeded, skipping");
      return;
    }

    debounceTimer = setTimeout(async () => {
      // Start a new sequence
      currentSequenceId++;
      const sequenceId = currentSequenceId;

      if (!revenueCatUserId && !lastUserId) {
        logger.debug("No user and no previous user, waiting for auth");
        return;
      }

      logger.debug("Auth state listener triggered, reinitializing with userId", revenueCatUserId || '(undefined - anonymous)');

      // Important: Always reset on user change, not just on logout.
      // This ensures previous user's cached state is cleared before init.
      if (lastUserId !== revenueCatUserId) {
          await SubscriptionManager.reset();
          lastInitSucceeded = false;
      }

      lastUserId = revenueCatUserId;

      // Start the retry chain
      attemptInitWithRetry(revenueCatUserId, 0, sequenceId).catch(err => {
        logger.error("Init sequence failed unhandled", err);
      });
    }, AUTH_STATE_DEBOUNCE_MS);
  };

  const auth = config.getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase auth is not available");
  }

  const initialRevenueCatUserId = getCurrentUserId(() => auth);
  lastUserId = initialRevenueCatUserId;

  logger.debug("Initial RevenueCat userId", initialRevenueCatUserId || '(undefined - anonymous)');

  if (initialRevenueCatUserId) {
    currentSequenceId++;
    attemptInitWithRetry(initialRevenueCatUserId, 0, currentSequenceId).catch(err => {
        logger.error("Initial sequence failed unhandled", err);
    });
  } else {
    logger.debug("No user available yet, waiting for auth state");
  }

  const unsubscribe = setupAuthStateListener(() => auth, debouncedInitialize);

  return () => {
    currentSequenceId++; // Invalidate any running sequences
    if (debounceTimer) clearTimeout(debounceTimer);
    if (retryTimer) clearTimeout(retryTimer);
    if (unsubscribe) unsubscribe();
  };
}
