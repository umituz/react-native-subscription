import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { getCurrentUserId, setupAuthStateListener } from "../SubscriptionAuthListener";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";

export async function startBackgroundInitialization(config: SubscriptionInitConfig): Promise<() => void> {
  const initializeInBackground = async (revenueCatUserId?: string): Promise<void> => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[BackgroundInitializer] initializeInBackground called with userId:', revenueCatUserId || '(undefined - anonymous)');
    }
    await SubscriptionManager.initialize(revenueCatUserId);
  };

  const auth = config.getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase auth is not available");
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {

  }

  const initialRevenueCatUserId = getCurrentUserId(() => auth);

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('[BackgroundInitializer] Initial RevenueCat userId:', initialRevenueCatUserId || '(undefined - anonymous)');
  }

  await initializeInBackground(initialRevenueCatUserId);

  const unsubscribe = setupAuthStateListener(() => auth, async (newRevenueCatUserId) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[BackgroundInitializer] Auth state listener triggered, reinitializing with userId:', newRevenueCatUserId || '(undefined - anonymous)');
    }
    try {
      await initializeInBackground(newRevenueCatUserId);
    } catch (error) {

    }
  });

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
