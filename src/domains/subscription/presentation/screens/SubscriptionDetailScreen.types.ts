import type { SubscriptionStatusType } from "../../core/SubscriptionConstants";

export interface SubscriptionDisplayFlags {
  showHeader: boolean;
  showCredits: boolean;
  showUpgradePrompt: boolean;
  showExpirationDate: boolean;
}

export interface SubscriptionDetailTranslations {
  title: string;
  statusActive: string;
  statusExpired: string;
  statusFree: string;
  statusCanceled: string;
  statusLabel: string;
  expiresLabel: string;
  purchasedLabel: string;
  usageTitle?: string;
  creditsTitle: string;
  creditsResetInfo?: string;
  remainingLabel?: string;
  upgradeButton: string;
  // Additional subscription details
  willRenewLabel?: string;
  productLabel?: string;
  planTypeLabel?: string;
  periodTypeLabel?: string;
  storeLabel?: string;
  originalPurchaseDateLabel?: string;
  latestPurchaseDateLabel?: string;
  billingIssuesLabel?: string;
  sandboxLabel?: string;
}

export interface UpgradePromptConfig {
  title: string;
  subtitle?: string;
  benefits?: readonly { icon?: string; text: string }[];
  onUpgrade?: () => void;
}

export interface CreditInfo {
  id: string;
  label: string;
  current: number;
  total: number;
}

export interface SubscriptionDetailConfig {
  display: SubscriptionDisplayFlags;
  statusType: SubscriptionStatusType;
  expirationDate?: string;
  purchaseDate?: string;
  daysRemaining?: number | null;
  credits?: readonly CreditInfo[];
  translations: SubscriptionDetailTranslations;
  upgradePrompt?: UpgradePromptConfig;
  onClose?: () => void;
  // Additional RevenueCat subscription details
  willRenew?: boolean | null;
  productIdentifier?: string | null;
  productName?: string | null;
  periodType?: string | null;
  packageType?: string | null;
  store?: string | null;
  originalPurchaseDate?: string | null;
  latestPurchaseDate?: string | null;
  billingIssuesDetected?: boolean;
  isSandbox?: boolean;
}

export interface SubscriptionDetailScreenProps {
  config: SubscriptionDetailConfig;
}
