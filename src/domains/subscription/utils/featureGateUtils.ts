export const DEFAULT_REQUIRED_CREDITS = 1;

/**
 * Checks if an action that requires auth-based credits can be executed.
 */
export function canExecuteAuthAction(
  isWaitingForAuthCredits: boolean,
  isCreditsLoaded: boolean,
  hasPendingAction: boolean,
  hasSubscription: boolean,
  creditBalance: number,
  requiredCredits: number
): boolean {
  if (!isWaitingForAuthCredits || !isCreditsLoaded || !hasPendingAction) {
    return false;
  }
  return hasSubscription || creditBalance >= requiredCredits;
}

/**
 * Checks if a purchase action can be executed, typically after a purchase flow.
 */
export function canExecutePurchaseAction(
  isWaitingForPurchase: boolean,
  creditBalance: number,
  prevBalance: number,
  hasSubscription: boolean,
  prevHasSubscription: boolean,
  hasPendingAction: boolean
): boolean {
  if (!isWaitingForPurchase || !hasPendingAction) {
    return false;
  }
  const creditsIncreased = creditBalance > prevBalance;
  const subscriptionAcquired = hasSubscription && !prevHasSubscription;
  return creditsIncreased || subscriptionAcquired;
}
