import type { FirebaseAuthLike } from "./SubscriptionInitializerTypes";

/**
 * Gets the current user ID from Firebase auth.
 * Returns undefined for anonymous users to prevent RevenueCat from using anonymous Firebase UIDs.
 */
export const getCurrentUserId = (getAuth: () => FirebaseAuthLike | null): string | undefined => {
  const auth = getAuth();
  if (!auth) return undefined;

  const user = auth.currentUser;
  if (!user) return undefined;

  // Don't return userId for anonymous users - let RevenueCat use its own anonymous ID
  if (user.isAnonymous) return undefined;

  return user.uid;
};

/**
 * Sets up auth state listener that will re-initialize subscription
 * when user auth state changes (login/logout).
 * Returns undefined for anonymous users to prevent RevenueCat from using anonymous Firebase UIDs.
 */
export const setupAuthStateListener = (
  getAuth: () => FirebaseAuthLike | null,
  onUserChange: (userId: string | undefined) => void
): (() => void) | null => {
  const auth = getAuth();
  if (!auth) return null;

  return auth.onAuthStateChanged((user) => {
    // Don't pass userId for anonymous users - let RevenueCat use its own anonymous ID
    const userId = (user && !user.isAnonymous) ? user.uid : undefined;
    onUserChange(userId);
  });
};
