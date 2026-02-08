/**
 * Credits Domain Entities
 *
 * Generic credit system types for subscription-based apps.
 * Designed to be used across hundreds of apps with configurable limits.
 */

import type { SubscriptionPackageType } from "../../../utils/packageTypeDetector";
import type {
  SubscriptionStatusType,
  PeriodType,
  PackageType,
  Platform,
  PurchaseSource,
  PurchaseType
} from "../../subscription/core/SubscriptionConstants";

export type {
  SubscriptionStatusType,
  PeriodType,
  PackageType,
  Platform,
  PurchaseSource,
  PurchaseType
};

export type CreditType = "text" | "image";

/** Single Source of Truth for user subscription + credits data */
export interface UserCredits {
  // Core subscription
  isPremium: boolean;
  status: SubscriptionStatusType;

  // Dates
  purchasedAt: Date | null;
  expirationDate: Date | null;
  lastUpdatedAt: Date | null;
  lastPurchaseAt: Date | null;

  // RevenueCat subscription details
  willRenew: boolean | null;
  productId: string | null;
  packageType: PackageType | null;
  originalTransactionId: string | null;

  // Trial fields
  periodType: PeriodType | null;
  isTrialing: boolean | null;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  trialCredits: number | null;
  convertedFromTrial: boolean | null;

  // Credits
  credits: number;
  creditLimit: number;

  // Metadata
  purchaseSource: PurchaseSource | null;
  purchaseType: PurchaseType | null;
  platform: Platform;
  appVersion: string | null;
}

export interface CreditAllocation {
  credits: number;
}

export type PackageAllocationMap = Record<
  Exclude<SubscriptionPackageType, "unknown">,
  CreditAllocation
>;

export interface CreditsConfig {
  collectionName: string;
  creditLimit: number;
  /** When true, stores credits at users/{userId}/credits instead of {collectionName}/{userId} */
  useUserSubcollection: boolean;
  /** Credit amounts per product ID for consumable credit packages */
  creditPackageAmounts: Record<string, number>;
  /** Credit allocations for different subscription types (weekly, monthly, yearly) */
  packageAllocations: PackageAllocationMap;
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
