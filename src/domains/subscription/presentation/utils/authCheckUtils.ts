/**
 * Authentication check utilities for purchase flows.
 * Extracted to reduce duplication in useAuthAwarePurchase.
 */

export interface PurchaseAuthProvider {
  hasFirebaseUser: () => boolean;
  showAuthModal: () => void;
}

/**
 * Checks if auth provider is available and user is authenticated.
 *
 * @param authProvider - Auth provider from authPurchaseStateManager
 * @returns true if user is authenticated, false otherwise
 */
export function isUserAuthenticated(authProvider: PurchaseAuthProvider | null): boolean {
  if (!authProvider) {
    return false;
  }
  return authProvider.hasFirebaseUser();
}

/**
 * Ensures user is authenticated before proceeding with an action.
 * If not authenticated, shows auth modal and returns false.
 *
 * @param authProvider - Auth provider from authPurchaseStateManager
 * @returns true if authenticated, false if auth modal was shown
 */
export function requireAuthentication(authProvider: PurchaseAuthProvider | null): boolean {
  if (!authProvider) {
    return false;
  }

  if (!authProvider.hasFirebaseUser()) {
    authProvider.showAuthModal();
    return false;
  }

  return true;
}
