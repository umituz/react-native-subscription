import type { SubscriptionPackageType } from "../../../utils/packageTypeDetector";
import type {
  SubscriptionStatusType,
  PackageType,
  Platform,
  PurchaseSource,
  PurchaseType
} from "../../subscription/core/SubscriptionConstants";

export type CreditType = "text" | "image";

export interface UserCredits {
  isPremium: boolean;
  status: SubscriptionStatusType;
  purchasedAt: Date | null;
  expirationDate: Date | null;
  lastUpdatedAt: Date | null;
  lastPurchaseAt: Date | null;
  willRenew: boolean | null;
  productId: string | null;
  packageType: PackageType | null;
  originalTransactionId: string | null;
  periodType: string | null;
  credits: number;
  creditLimit: number;
  purchaseSource: PurchaseSource | null;
  purchaseType: PurchaseType | null;
  platform: Platform;
  appVersion: string | null;
}

export interface CreditAllocation {
  credits: number;
}

export type PackageAllocationMap = Partial<Record<
  Exclude<SubscriptionPackageType, "unknown">,
  CreditAllocation
>>;

export interface CreditsConfig {
  collectionName: string;
  creditLimit: number;
  useUserSubcollection: boolean;
  creditPackageAmounts?: Record<string, number>;
  packageAllocations?: PackageAllocationMap;
}

export interface CreditsResult<T = UserCredits> {
  success: boolean;
  data: T | null;
  error: {
    message: string;
    code: string;
  } | null;
}

export interface DeductCreditsResult {
  success: boolean;
  remainingCredits: number | null;
  error: {
    message: string;
    code: string;
  } | null;
}
