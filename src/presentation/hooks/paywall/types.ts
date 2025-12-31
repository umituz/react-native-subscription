import type { PurchasesPackage } from "react-native-purchases";

export type PurchaseSource = "inApp" | "postOnboarding" | null;

export interface PaywallOperationsProps {
  userId: string | undefined;
  isAnonymous: boolean;
  onPaywallClose?: () => void;
  onPurchaseSuccess?: () => void;
  onAuthRequired?: () => void;
}

export interface PaywallOperationsResult {
  pendingPackage: PurchasesPackage | null;
  handlePurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  handleRestore: () => Promise<boolean>;
  handleInAppPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  handleInAppRestore: () => Promise<boolean>;
  completePendingPurchase: () => Promise<boolean>;
  clearPendingPackage: () => void;
}

export interface PaywallRefs {
  userIdRef: React.MutableRefObject<string | undefined>;
  isAnonymousRef: React.MutableRefObject<boolean>;
  purchasePackageRef: React.MutableRefObject<(pkg: PurchasesPackage) => Promise<boolean>>;
  closePaywallRef: React.MutableRefObject<() => void>;
  onPurchaseSuccessRef: React.MutableRefObject<(() => void) | undefined>;
}
