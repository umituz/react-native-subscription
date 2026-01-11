/**
 * RevenueCat Configuration Value Object
 * Validates and stores RevenueCat configuration
 */

import type { CustomerInfo } from "react-native-purchases";

export interface RevenueCatConfig {
  /** Primary API key - resolved by main app based on platform */
  apiKey?: string;
  /** Test Store key for development/Expo Go testing */
  testStoreKey?: string;
  /** Entitlement identifier to check for premium status (REQUIRED - app specific) */
  entitlementIdentifier: string;
  /** Product identifiers for consumable products (e.g., credits packages) */
  consumableProductIdentifiers?: string[];
  /** Callback for premium status sync to database */
  onPremiumStatusChanged?: (
    userId: string,
    isPremium: boolean,
    productId?: string,
    expiresAt?: string
  ) => Promise<void> | void;
  /** Callback for purchase completion */
  onPurchaseCompleted?: (
    userId: string,
    productId: string,
    customerInfo: CustomerInfo,
    source?: string
  ) => Promise<void> | void;
  /** Callback for restore completion */
  onRestoreCompleted?: (
    userId: string,
    isPremium: boolean,
    customerInfo: CustomerInfo
  ) => Promise<void> | void;
  /** Callback when subscription renewal is detected */
  onRenewalDetected?: (
    userId: string,
    productId: string,
    newExpirationDate: string,
    customerInfo: CustomerInfo
  ) => Promise<void> | void;
  /** Callback after credits are successfully updated (for cache invalidation) */
  onCreditsUpdated?: (userId: string) => void;
}

export interface RevenueCatConfigRequired {
  apiKey: string;
}

