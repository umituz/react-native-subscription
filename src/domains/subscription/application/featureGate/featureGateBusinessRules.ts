export const DEFAULT_REQUIRED_CREDITS = 1;

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
