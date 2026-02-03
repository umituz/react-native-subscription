/**
 * PaywallContainer Types
 * Props for subscription paywall
 */

import type { ImageSourcePropType } from "react-native";
import type { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../entities";
import type { PurchaseSource, PackageAllocationMap } from "../../../domain/entities/Credits";

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
  /** Legal URLs for privacy and terms */
  readonly legalUrls?: PaywallLegalUrls;
  /** Feature list to display */
  readonly features?: readonly SubscriptionFeature[];
  /** Hero image for paywall header */
  readonly heroImage?: ImageSourcePropType;
  /** Best value package identifier for badge */
  readonly bestValueIdentifier?: string;
  /** Credit amounts per product identifier (takes precedence over packageAllocations) */
  readonly creditAmounts?: Record<string, number>;
  /** Credits label text (e.g., "credits") */
  readonly creditsLabel?: string;
  /** Package allocations for auto-computing creditAmounts (used when creditAmounts not provided) */
  readonly packageAllocations?: PackageAllocationMap;
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
