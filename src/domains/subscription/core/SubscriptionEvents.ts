import type { CustomerInfo } from "react-native-purchases";
import type { PurchaseSource } from "./SubscriptionConstants";
import type { SubscriptionMetadata } from "./types/SubscriptionMetadata";
import type { PackageType } from "../../revenuecat/core/types/RevenueCatTypes";

export interface PurchaseCompletedEvent {
  userId: string;
  productId: string;
  customerInfo: CustomerInfo;
  source?: PurchaseSource;
  packageType?: PackageType | null;
}

export interface RenewalDetectedEvent {
  userId: string;
  productId: string;
  newExpirationDate: string;
  customerInfo: CustomerInfo;
}

export interface PremiumStatusChangedEvent extends Partial<SubscriptionMetadata> {
  userId: string;
  isPremium: boolean;
  storeTransactionId?: string;
}

export interface PlanChangedEvent {
  userId: string;
  newProductId: string;
  previousProductId: string;
  isUpgrade: boolean;
  customerInfo: CustomerInfo;
}

export interface RestoreCompletedEvent {
  userId: string;
  isPremium: boolean;
  customerInfo: CustomerInfo;
}
