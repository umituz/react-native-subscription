import type { SubscriptionMetadata } from "../../../subscription/core/types";
import type { PackageType } from "./RevenueCatTypes";

export interface RevenueCatData extends Omit<SubscriptionMetadata, 'willRenew' | 'productId'> {
  willRenew: boolean | null;
  storeTransactionId: string | null;
  packageType: PackageType | null;
  revenueCatUserId?: string | null;
}
