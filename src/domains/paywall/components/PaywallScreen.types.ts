import type { ImageSourcePropType } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import type { SubscriptionFeature, PaywallTranslations, PaywallLegalUrls } from "../entities/types";
import type { PurchaseSource } from "../../subscription/core/SubscriptionConstants";
import type { UserCredits } from "../../credits/core/Credits";

export interface PaywallScreenProps {
  // UI Props (required)
  translations: PaywallTranslations;
  features?: SubscriptionFeature[];
  legalUrls?: PaywallLegalUrls;
  bestValueIdentifier?: string;
  creditAmounts?: Record<string, number>;
  creditsLabel?: string;
  heroImage?: ImageSourcePropType;

  // Data Props (required)
  packages: PurchasesPackage[];
  isPremium: boolean;
  credits: UserCredits | null;
  isSyncing: boolean;

  // Action Props (required)
  onPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  onRestore: () => Promise<boolean>;
  onClose: () => void;

  // Optional Callbacks
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: Error | string) => void;
  onAuthRequired?: () => void;
  source?: PurchaseSource;
}
