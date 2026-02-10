import type { PurchasesPackage } from 'react-native-purchases';
import type { UserCredits } from '../../credits/core/Credits';

export interface UsePremiumResult {
  isPremium: boolean;
  isLoading: boolean;
  packages: PurchasesPackage[];
  credits: UserCredits | null;
  showPaywall: boolean;
  isSyncing: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  setShowPaywall: (show: boolean) => void;
  closePaywall: () => void;
  openPaywall: () => void;
}
