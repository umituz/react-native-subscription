/**
 * Subscription Plan Card Types
 * Type definitions for subscription plan display
 */

import type { PurchasesPackage } from "react-native-purchases";

export interface SubscriptionPlanCardProps {
  package: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
  isBestValue?: boolean;
  /** Optional: Number of credits/generations included with this package */
  creditAmount?: number;
}
