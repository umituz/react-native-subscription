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

  if (user.isAnonymous) {
    return undefined;
  }

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
    if (!user || user.isAnonymous) {
      onUserChange(undefined);
      return;
    }

    onUserChange(user.uid);
  });
};
