import type { FirebaseAuthLike } from "./SubscriptionInitializerTypes";

export const getCurrentUserId = (getAuth: () => FirebaseAuthLike | null): string | undefined => {
  const auth = getAuth();
  if (!auth) {
    return undefined;
  }

  const user = auth.currentUser;
  if (!user) {
    return undefined;
  }

  // Return UID for ALL users including anonymous.
  // Anonymous users need RevenueCat initialized so they can purchase subscriptions.
  // Their credits are stored at users/{anonymousUID}/credits/balance.
  return user.uid;
};

export const setupAuthStateListener = (
  getAuth: () => FirebaseAuthLike | null,
  onUserChange: (userId: string | undefined) => void
): (() => void) | null => {
  const auth = getAuth();
  if (!auth) {
    return null;
  }

  return auth.onAuthStateChanged((user) => {
    if (!user) {
      onUserChange(undefined);
      return;
    }

    // Pass UID for ALL users including anonymous.
    // Anonymous users need RevenueCat initialized for purchases.
    onUserChange(user.uid);
  });
};
