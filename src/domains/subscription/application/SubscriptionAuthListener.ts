import type { FirebaseAuthLike } from "./SubscriptionInitializerTypes";

/**
 * Gets the current user ID from Firebase auth.
 * Returns undefined for anonymous users to let RevenueCat generate its own anonymous ID.
 */
export const getCurrentUserId = (getAuth: () => FirebaseAuthLike | null): string | undefined => {
  const auth = getAuth();
  if (!auth) {
    return undefined;
  }

  const user = auth.currentUser;
  if (!user) {
    return undefined;
  }

  if (user.isAnonymous) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[SubscriptionAuthListener] Anonymous user - returning undefined (RevenueCat will use its own ID)');
    }
    return undefined;
  }

  return user.uid;
};

/**
 * Sets up auth state listener that will re-initialize subscription
 * when user auth state changes (login/logout).
 * Returns undefined for anonymous users to let RevenueCat generate its own anonymous ID.
 */
export const setupAuthStateListener = (
  getAuth: () => FirebaseAuthLike | null,
  onUserChange: (userId: string | undefined) => void
): (() => void) | null => {
  const auth = getAuth();
  if (!auth) {
    return null;
  }

  return auth.onAuthStateChanged((user) => {
    const userId = (user && !user.isAnonymous) ? user.uid : undefined;

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[SubscriptionAuthListener] 🔔 Auth state changed:', {
        hasUser: !!user,
        isAnonymous: user?.isAnonymous,
        userId: userId || '(undefined - anonymous)',
      });
    }

    onUserChange(userId);
  });
};
