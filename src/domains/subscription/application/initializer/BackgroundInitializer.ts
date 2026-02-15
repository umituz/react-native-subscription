import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { getCurrentUserId, setupAuthStateListener } from "../SubscriptionAuthListener";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";

declare const __DEV__: boolean;

export async function startBackgroundInitialization(config: SubscriptionInitConfig): Promise<() => void> {
  const initializeInBackground = async (userId?: string): Promise<void> => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[BackgroundInitializer] initializeInBackground called with userId:', userId || '(undefined - anonymous)');
    }
    await SubscriptionManager.initialize(userId);
  };

  const auth = config.getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase auth is not available");
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[BackgroundInitializer] Starting background initialization');
  }

  const initialUserId = getCurrentUserId(() => auth);

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[BackgroundInitializer] Initial userId:', initialUserId || '(undefined - anonymous)');
  }

  await initializeInBackground(initialUserId);

  const unsubscribe = setupAuthStateListener(() => auth, async (newUserId) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[BackgroundInitializer] Auth state listener triggered, reinitializing with userId:', newUserId || '(undefined - anonymous)');
    }
    try {
      await initializeInBackground(newUserId);
    } catch (error) {
      console.error('[BackgroundInitializer] Failed to reinitialize on auth change', { userId: newUserId, error });
    }
  });

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
