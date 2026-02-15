import { SubscriptionManager } from "../../infrastructure/managers/SubscriptionManager";
import { getCurrentUserId, setupAuthStateListener } from "../SubscriptionAuthListener";
import type { SubscriptionInitConfig } from "../SubscriptionInitializerTypes";

export async function startBackgroundInitialization(config: SubscriptionInitConfig): Promise<void> {
  const initializeInBackground = async (userId?: string): Promise<void> => {
    await SubscriptionManager.initialize(userId);
  };

  const auth = config.getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase auth is not available");
  }

  const initialUserId = getCurrentUserId(() => auth);
  await initializeInBackground(initialUserId);

  setupAuthStateListener(() => auth, (newUserId) => {
    initializeInBackground(newUserId);
  });
}
