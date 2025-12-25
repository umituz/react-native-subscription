/**
 * Subscription Settings Types
 * Type definitions for subscription settings configuration
 */

import type { SubscriptionDetailConfig } from "../screens/SubscriptionDetailScreen";

/** Status type for subscription state */
export type SubscriptionStatusType = "none" | "active" | "expired";

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
  statusFree: string;
  statusExpired: string;
  statusCanceled: string;
  /** Detail screen translations */
  statusLabel: string;
  expiresLabel: string;
  purchasedLabel: string;
  lifetimeLabel: string;
  creditsTitle: string;
  remainingLabel: string;
  manageButton: string;
  upgradeButton: string;
  /** Credit label (e.g., "Image Credits") */
  imageCreditsLabel?: string;
}

/** Parameters for useSubscriptionSettingsConfig hook */
export interface UseSubscriptionSettingsConfigParams {
  /** User ID (required for credits lookup) */
  userId?: string;
  /** Whether user is anonymous */
  isAnonymous?: boolean;
  /** Current language for date formatting */
  currentLanguage?: string;
  /** Translation strings */
  translations: SubscriptionSettingsTranslations;
  /** Credit limit calculator */
  getCreditLimit?: (currentCredits: number) => number;
}
