import type { RevenueCatConfig } from "../../../revenuecat/core/types/RevenueCatConfig";
import type { PremiumStatus } from "../../core/types/PremiumStatus";
import type { RestoreResultInfo } from "../handlers/package-operations/types";

export interface SubscriptionManagerConfig {
  config: RevenueCatConfig;
  apiKey: string;
}

export type { PremiumStatus, RestoreResultInfo };
