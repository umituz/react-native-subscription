import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import type { PremiumStatus } from "../handlers/PurchaseStatusResolver";

export interface SubscriptionManagerConfig {
  config: RevenueCatConfig;
  apiKey: string;
}

export type { PremiumStatus };

export interface RestoreResultInfo {
  success: boolean;
  productId: string | null;
}
