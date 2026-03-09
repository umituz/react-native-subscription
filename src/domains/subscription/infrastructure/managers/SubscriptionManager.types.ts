import type { RevenueCatConfig } from "../../../revenuecat/core/types";
import type { PremiumStatus } from "../../core/types";
import type { RestoreResultInfo } from "../handlers/package-operations/types";

export interface SubscriptionManagerConfig {
  config: RevenueCatConfig;
  apiKey: string;
}

export type { PremiumStatus, RestoreResultInfo };
