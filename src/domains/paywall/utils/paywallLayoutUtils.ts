import type { PurchasesPackage } from "react-native-purchases";
import type { SubscriptionFeature } from "../entities/types";

export type PaywallListItem = 
  | { type: 'HEADER' }
  | { type: 'FEATURE_HEADER' }
  | { type: 'FEATURE'; feature: SubscriptionFeature }
  | { type: 'PLAN_HEADER' }
  | { type: 'PLAN'; pkg: PurchasesPackage };

/**
 * Constants for estimated layout heights
 */
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 300,
  SECTION_HEADER_HEIGHT: 60,
  FEATURE_ITEM_HEIGHT: 46,
  PLAN_ITEM_HEIGHT: 80,
};

/**
 * Calculates the offset and length for FlatList items to optimize scrolling performance.
 */
export function calculatePaywallItemLayout(data: PaywallListItem[] | null | undefined, index: number) {
  if (!data) return { length: 0, offset: 0, index };

  let offset = 0;
  for (let i = 0; i < index; i++) {
    const item = data[i];
    offset += getItemHeight(item);
  }

  const length = getItemHeight(data[index]);
  
  return { length, offset, index };
}

/**
 * Returns the estimated height of a single paywall list item based on its type.
 */
function getItemHeight(item: PaywallListItem): number {
  switch (item.type) {
    case 'HEADER':
      return LAYOUT_CONSTANTS.HEADER_HEIGHT;
    case 'FEATURE_HEADER':
    case 'PLAN_HEADER':
      return LAYOUT_CONSTANTS.SECTION_HEADER_HEIGHT;
    case 'FEATURE':
      return LAYOUT_CONSTANTS.FEATURE_ITEM_HEIGHT;
    case 'PLAN':
      return LAYOUT_CONSTANTS.PLAN_ITEM_HEIGHT;
    default:
      return 0;
  }
}
