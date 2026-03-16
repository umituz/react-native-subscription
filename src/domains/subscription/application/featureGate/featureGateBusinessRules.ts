import { 
    canExecuteAuthAction as canAuth, 
    canExecutePurchaseAction as canPurchase 
} from "../../utils/featureGateUtils";

export const DEFAULT_REQUIRED_CREDITS = 1;

/**
 * Business rule for executing auth-related actions.
 */
export function canExecuteAuthAction(
  isWaitingForAuthCredits: boolean,
  isCreditsLoaded: boolean,
  hasPendingAction: boolean,
  hasSubscription: boolean,
  creditBalance: number,
  requiredCredits: number
): boolean {
  return canAuth(
    isWaitingForAuthCredits, 
    isCreditsLoaded, 
    hasPendingAction, 
    hasSubscription, 
    creditBalance, 
    requiredCredits
  );
}

/**
 * Business rule for executing purchase-related actions.
 */
export function canExecutePurchaseAction(
  isWaitingForPurchase: boolean,
  creditBalance: number,
  prevBalance: number,
  hasSubscription: boolean,
  prevHasSubscription: boolean,
  hasPendingAction: boolean
): boolean {
  return canPurchase(
    isWaitingForPurchase,
    creditBalance,
    prevBalance,
    hasSubscription,
    prevHasSubscription,
    hasPendingAction
  );
}
