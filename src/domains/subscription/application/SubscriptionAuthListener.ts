import type { FirebaseAuthLike } from "./SubscriptionInitializerTypes";

/**
 * Gets the current user ID from Firebase auth.
 */
export const getCurrentUserId = (getAuth: () => FirebaseAuthLike | null): string | undefined => {
  const auth = getAuth();
  if (!auth) return undefined;
  return auth.currentUser?.uid;
};

/**
 * Sets up auth state listener that will re-initialize subscription
 * when user auth state changes (login/logout).
 */
export const setupAuthStateListener = (
  getAuth: () => FirebaseAuthLike | null,
  onUserChange: (userId: string | undefined) => void
): (() => void) | null => {
  const auth = getAuth();
  if (!auth) return null;

  return auth.onAuthStateChanged((user) => {
    onUserChange(user?.uid);
  });
};
