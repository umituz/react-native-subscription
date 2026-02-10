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
  lifetimeLabel: string;
  expiresLabel: string;
  purchasedLabel: string;
  usageTitle?: string;
  creditsTitle: string;
  creditsResetInfo?: string;
  remainingLabel?: string;
  upgradeButton: string;
}

export interface UpgradePromptConfig {
  title: string;
  subtitle?: string;
  benefits?: readonly { icon?: string; text: string }[];
  onUpgrade?: () => void;
}

export interface SubscriptionDetailConfig {
  display: SubscriptionDisplayFlags;
  statusType: "active" | "expired" | "none" | "canceled";
  isLifetime: boolean;
  expirationDate?: string;
  purchaseDate?: string;
  daysRemaining?: number | null;
  credits?: readonly any[];
  translations: SubscriptionDetailTranslations;
  upgradePrompt?: UpgradePromptConfig;
  onClose?: () => void;
}

export interface SubscriptionDetailScreenProps {
  config: SubscriptionDetailConfig;
}
