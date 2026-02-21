import type { ImageSourcePropType } from "react-native";
import type { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "../entities/types";
import type { PurchaseSource } from "../../subscription/core/SubscriptionConstants";
import type { PackageAllocationMap } from "../../credits/core/Credits";

export interface TrialConfig {
  readonly enabled: boolean;
  readonly eligibleProductIds?: readonly string[];
  readonly durationDays?: number;
  readonly trialText?: string;
}

export interface PaywallContainerProps {
  readonly translations: PaywallTranslations;
  readonly legalUrls?: PaywallLegalUrls;
  readonly features?: readonly SubscriptionFeature[];
  readonly heroImage?: ImageSourcePropType;
  readonly bestValueIdentifier?: string;
  readonly creditAmounts?: Record<string, number>;
  readonly creditsLabel?: string;
  readonly packageAllocations?: PackageAllocationMap;
  readonly source?: PurchaseSource;
  readonly onPurchaseSuccess?: () => void;
  readonly onPurchaseError?: (error: Error | string) => void;
  readonly onAuthRequired?: () => void;
  readonly visible?: boolean;
  readonly onClose?: () => void;
  readonly trialConfig?: TrialConfig;
}
