/**
 * Subscription Settings Types
 * Type definitions for subscription settings configuration
 */

import type { SubscriptionStatusType } from "../../domain/entities/SubscriptionStatus";
import type {
  SubscriptionDetailConfig,
  UpgradePromptConfig,
} from "./SubscriptionDetailTypes";

export type { SubscriptionStatusType, UpgradePromptConfig };

/** Configuration for settings list item */
export interface SubscriptionSettingsItemConfig {
  title: string;
  description?: string;
  isPremium: boolean;
  statusLabel: string;
  icon?: string;
  onPress?: () => void;
}

/** Complete subscription settings configuration */
export interface SubscriptionSettingsConfig {
  /** Whether subscription section should be shown */
  enabled: boolean;
  /** Config for settings list item */
  settingsItem: SubscriptionSettingsItemConfig;
  /** Config for detail screen */
  sectionConfig: SubscriptionDetailConfig;
}

/** Translation strings for subscription settings */
export interface SubscriptionSettingsTranslations {
  /** Settings item title */
  title: string;
  /** Settings item description */
  description: string;
  /** Status labels */
  statusActive: string;
  statusInactive: string;
  statusExpired: string;
  statusCanceled: string;
  /** Trial status label (defaults to statusActive if not provided) */
  statusTrial?: string;
  /** Trial canceled status label (defaults to statusCanceled if not provided) */
  statusTrialCanceled?: string;
  /** Detail screen translations */
  statusLabel: string;
  expiresLabel: string;
  purchasedLabel: string;
  lifetimeLabel: string;
  creditsTitle: string;
  remainingLabel: string;
  manageButton: string;
  upgradeButton: string;
  /** Credit label (e.g., "Credits") */
  creditsLabel: string;
}

/** Parameters for useSubscriptionSettingsConfig hook */
export interface UseSubscriptionSettingsConfigParams {
  /** User ID (required for credits lookup) */
  userId?: string;
  /** Whether user is anonymous */
  isAnonymous?: boolean;
  /** Translation strings */
  translations: SubscriptionSettingsTranslations;
  /** Fixed credit limit (if not available in UserCredits) */
  creditLimit?: number;
  /** Upgrade prompt configuration for free users */
  upgradePrompt?: UpgradePromptConfig;
}
