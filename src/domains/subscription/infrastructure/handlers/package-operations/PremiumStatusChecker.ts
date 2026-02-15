import type { CustomerInfo } from "react-native-purchases";
import { PurchaseStatusResolver, type PremiumStatus } from "../PurchaseStatusResolver";

export function checkPremiumStatus(
  customerInfo: CustomerInfo,
  entitlementId: string
): PremiumStatus {
  return PurchaseStatusResolver.resolve(customerInfo, entitlementId);
}
