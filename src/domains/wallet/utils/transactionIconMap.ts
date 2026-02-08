/**
 * Transaction Icon Mapping Utility
 * Maps transaction reasons to their corresponding icons
 */

import type { TransactionReason } from "../domain/types/transaction.types";

const ICON_MAP: Record<TransactionReason, string> = {
  purchase: "shopping-cart",
  usage: "zap",
  refund: "rotate-ccw",
  bonus: "gift",
  subscription: "star",
  admin: "shield",
  reward: "award",
  expired: "clock",
};

/**
 * Get icon name for a transaction reason
 * @param reason - Transaction reason type
 * @returns Icon name for the transaction
 */
export function getTransactionIcon(reason: TransactionReason): string {
  return ICON_MAP[reason] || "circle";
}
