/**
 * PaywallContainer Types
 * Props for package-driven paywall with mode-based filtering
 */

import type { ImageSourcePropType } from "react-native";
import type { PaywallMode, PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../entities";
import type { PackageFilterConfig } from "../../../utils/packageFilter";
import type { PurchaseSource } from "../../../domain/entities/Credits";

/**
 * Trial display configuration
 * Controls how free trial info is displayed (Apple-compliant)
 */
export interface TrialConfig {
  /** Enable trial display (default: false) */
  readonly enabled: boolean;
  /** Product IDs that have trial offers (if empty, checks all via RevenueCat) */
  readonly eligibleProductIds?: readonly string[];
  /** Trial duration in days (default: 7) */
  readonly durationDays?: number;
  /** Text to show for trial (e.g., "7 days free, then billed") */
  readonly trialText?: string;
}

export interface PaywallContainerProps {
  /** Paywall translations - no defaults, must be provided */
  readonly translations: PaywallTranslations;
  /** Paywall mode - subscription, credits, or hybrid */
  readonly mode?: PaywallMode;
  /** Legal URLs for privacy and terms */
  readonly legalUrls?: PaywallLegalUrls;
  /** Feature list to display */
  readonly features?: readonly SubscriptionFeature[];
  /** Hero image for paywall header */
  readonly heroImage?: ImageSourcePropType;
  /** Best value package identifier for badge */
  readonly bestValueIdentifier?: string;
  /** Credits label text */
  readonly creditsLabel?: string;
  /** Credit amounts per package identifier */
  readonly creditAmounts?: Record<string, number>;
  /** Custom filter config for package categorization */
  readonly packageFilterConfig?: PackageFilterConfig;
  /** Source of the paywall - affects pending purchase handling */
  readonly source?: PurchaseSource;
  /** Callback when purchase succeeds */
  readonly onPurchaseSuccess?: () => void;
  /** Callback when purchase fails */
  readonly onPurchaseError?: (error: string) => void;
  /** Callback when auth is required (for anonymous users) */
  readonly onAuthRequired?: () => void;
  /** Visibility override */
  readonly visible?: boolean;
  /** Callback when paywall is closed */
  readonly onClose?: () => void;
  /** Trial display configuration (Apple-compliant) */
  readonly trialConfig?: TrialConfig;
}

