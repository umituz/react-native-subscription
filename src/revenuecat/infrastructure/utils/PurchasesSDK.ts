/**
 * Purchases SDK Wrapper
 * Handles ESM/CJS interop for react-native-purchases
 * All files should import from this module instead of directly from react-native-purchases
 */

import PurchasesModule from "react-native-purchases";
import type {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesOffering,
  PurchasesPackage,
  LogHandler,
} from "react-native-purchases";

// Handle ESM/CJS interop - Metro bundler sometimes wraps default export
type PurchasesType = typeof PurchasesModule;
interface PurchasesModuleWithDefault {
  default?: PurchasesType;
}

const resolvedPurchases: PurchasesType =
  (PurchasesModule as unknown as PurchasesModuleWithDefault).default ?? PurchasesModule;

// Re-export types
export type {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesOffering,
  PurchasesPackage,
  LogHandler,
};

// Re-export LOG_LEVEL enum
export const LOG_LEVEL = resolvedPurchases.LOG_LEVEL;

// Export resolved Purchases instance
export const Purchases = resolvedPurchases;

export default Purchases;
