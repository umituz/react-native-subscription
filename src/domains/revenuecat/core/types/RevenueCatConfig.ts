import type { CustomerInfo } from "react-native-purchases";
import type { PackageType } from "./RevenueCatTypes";

/**
 * RevenueCat Configuration
 * All callbacks receive data directly from RevenueCat SDK
 */
export interface RevenueCatConfig {
  apiKey?: string;
  entitlementIdentifier: string;
  consumableProductIdentifiers?: string[];
  onPremiumStatusChanged?: (
    userId: string,
    isPremium: boolean,
    productId?: string,
    expiresAt?: string,
    willRenew?: boolean,
    periodType?: string // From RevenueCat SDK (NORMAL, INTRO, TRIAL)
  ) => Promise<void> | void;
  onPurchaseCompleted?: (
    userId: string,
    productId: string,
    customerInfo: CustomerInfo,
    source?: string, // Purchase source tracking (app-specific)
    packageType?: PackageType | null // From PurchasesPackage.packageType - subscription duration (WEEKLY, MONTHLY, ANNUAL, etc.)
  ) => Promise<void> | void;
  onRestoreCompleted?: (
    userId: string,
    isPremium: boolean,
    customerInfo: CustomerInfo
  ) => Promise<void> | void;
  onRenewalDetected?: (
    userId: string,
    productId: string,
    newExpirationDate: string,
    customerInfo: CustomerInfo
  ) => Promise<void> | void;
  onPlanChanged?: (
    userId: string,
    newProductId: string,
    previousProductId: string,
    isUpgrade: boolean,
    customerInfo: CustomerInfo
  ) => Promise<void> | void;
  onCreditsUpdated?: (userId: string) => void;
}
