import type { CustomerInfo } from "react-native-purchases";
import type { PackageType } from "./RevenueCatTypes";

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
    periodType?: string
  ) => Promise<void> | void;
  onPurchaseCompleted?: (
    userId: string,
    productId: string,
    customerInfo: CustomerInfo,
    source?: string,
    packageType?: PackageType | null
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
