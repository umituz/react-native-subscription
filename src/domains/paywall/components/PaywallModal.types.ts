import type { ImageSourcePropType } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import type { SubscriptionFeature, PaywallTranslations, PaywallLegalUrls } from "../entities/types";

export interface TrialEligibilityInfo {
  eligible: boolean;
  durationDays?: number;
}

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  translations: PaywallTranslations;
  packages?: PurchasesPackage[];
  features?: SubscriptionFeature[];
  isLoading?: boolean;
  legalUrls?: PaywallLegalUrls;
  bestValueIdentifier?: string;
  creditAmounts?: Record<string, number>;
  creditsLabel?: string;
  heroImage?: ImageSourcePropType;
  onPurchase?: (pkg: PurchasesPackage) => Promise<void | boolean>;
  onRestore?: () => Promise<void | boolean>;
  trialEligibility?: Record<string, TrialEligibilityInfo>;
  trialSubtitleText?: string;
}
