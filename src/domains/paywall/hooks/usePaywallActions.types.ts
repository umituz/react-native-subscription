/**
 * Paywall Actions Types
 */

import type { PurchasesPackage } from "react-native-purchases";

export interface UsePaywallActionsParams {
  packages?: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  source?: string;
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: Error | string) => void;
  onAuthRequired?: () => void;
  onClose?: () => void;
}
