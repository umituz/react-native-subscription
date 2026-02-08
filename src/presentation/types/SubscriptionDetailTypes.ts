/**
 * Subscription Detail Types
 * Type definitions for subscription detail screen and components
 */

import type { SubscriptionStatusType } from "../../domain/entities/SubscriptionStatus";
import type { CreditInfo } from "../components/details/PremiumDetailsCardTypes";

export type { SubscriptionStatusType, CreditInfo };

/** Translation strings for subscription detail screen */
export interface SubscriptionDetailTranslations {
  title: string;
  statusLabel: string;
  statusActive: string;
  statusExpired: string;
  statusInactive: string;
  statusCanceled: string;
  /** Trial status label (defaults to statusActive if not provided) */
  statusTrial?: string;
  /** Trial canceled status label (defaults to statusCanceled if not provided) */
  statusTrialCanceled?: string;
  expiresLabel: string;
  purchasedLabel: string;
  lifetimeLabel: string;
  creditsTitle: string;
  remainingLabel: string;
  usageTitle?: string;
  manageButton: string;
  upgradeButton: string;
  creditsResetInfo?: string;
}

/** Dev test action callbacks */
export interface DevTestActions {
  onTestRenewal: () => Promise<void>;
  onCheckCredits: () => void;
  onTestDuplicate: () => Promise<void>;
}

/** Dev tools configuration */
export interface DevToolsConfig {
  actions: DevTestActions;
  title?: string;
}

/** Benefit item for upgrade prompt */
export interface UpgradeBenefit {
  icon?: string;
  text: string;
}

/** Upgrade prompt configuration */
export interface UpgradePromptConfig {
  title: string;
  subtitle?: string;
  benefits?: UpgradeBenefit[];
}

/** Display flags - centralized UI visibility control */
export interface SubscriptionDisplayFlags {
  showHeader: boolean;
  showCredits: boolean;
  showUpgradePrompt: boolean;
  showExpirationDate: boolean;
}

/** Configuration for subscription detail screen */
export interface SubscriptionDetailConfig {
  statusType: SubscriptionStatusType;
  isPremium: boolean;
  display: SubscriptionDisplayFlags;
  expirationDate?: string | null;
  purchaseDate?: string | null;
  isLifetime?: boolean;
  daysRemaining?: number | null;
  willRenew?: boolean;
  credits?: CreditInfo[];
  translations: SubscriptionDetailTranslations;
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
  devTools?: DevToolsConfig;
  upgradePrompt?: UpgradePromptConfig;
}

/** Props for subscription detail screen */
export interface SubscriptionDetailScreenProps {
  config: SubscriptionDetailConfig;
}

/** Props for subscription header component */
export interface SubscriptionHeaderProps {
  statusType: SubscriptionStatusType;
  showExpirationDate: boolean;
  isLifetime?: boolean;
  expirationDate?: string | null;
  purchaseDate?: string | null;
  daysRemaining?: number | null;
  translations: Pick<
    SubscriptionDetailTranslations,
    | "title"
    | "statusLabel"
    | "statusActive"
    | "statusExpired"
    | "statusInactive"
    | "statusCanceled"
    | "statusTrial"
    | "statusTrialCanceled"
    | "expiresLabel"
    | "purchasedLabel"
    | "lifetimeLabel"
  >;
}

/** Props for credits list component */
export interface CreditsListProps {
  credits: CreditInfo[];
  title?: string;
  description?: string;
  remainingLabel?: string;
}

/** Props for credit row component */
export interface CreditRowProps {
  label: string;
  current: number;
  total: number;
  remainingLabel?: string;
}

/** Props for subscription actions component */
export interface SubscriptionActionsProps {
  isPremium: boolean;
  upgradeButtonLabel?: string;
  onUpgrade?: () => void;
}

/** Props for dev test section */
export interface DevTestSectionProps {
  actions: DevTestActions;
  title?: string;
}

/** Props for upgrade prompt component */
export interface UpgradePromptProps {
  title: string;
  subtitle?: string;
  benefits?: UpgradeBenefit[];
  upgradeButtonLabel?: string;
  onUpgrade?: () => void;
}
