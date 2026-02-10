import type { RevenueCatConfig } from "../../core/RevenueCatConfig";
import type { PremiumStatus } from "../handlers/PurchaseStatusResolver";

export interface SubscriptionManagerConfig {
  config: RevenueCatConfig;
  apiKey: string;
  getAnonymousUserId: () => Promise<string>;
}

export type { PremiumStatus };

export interface RestoreResultInfo {
  success: boolean;
  productId: string | null;
}
