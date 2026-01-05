/**
 * PaywallContainer Types
 * Props for package-driven paywall with mode-based filtering
 */

import type { ImageSourcePropType } from "react-native";
import type { PaywallMode, PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../entities";
import type { PackageFilterConfig } from "../../../utils/packageFilter";

export interface PaywallContainerProps {
  /** User ID for subscription management */
  readonly userId: string | null;
  /** Whether user is anonymous (requires auth before purchase) */
  readonly isAnonymous?: boolean;
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
}

