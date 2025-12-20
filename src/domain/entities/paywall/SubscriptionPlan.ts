/**
 * Subscription Plan Entity
 * Represents a subscription plan for purchase
 */

export interface SubscriptionPlan {
  /** Plan ID */
  id: string;

  /** Plan type */
  type: "monthly" | "yearly";

  /** Price */
  price: number;

  /** Currency code */
  currency: string;

  /** Whether this is the best value option */
  isBestValue?: boolean;

  /** Optional discount percentage */
  discountPercentage?: number;

  /** Optional features list */
  features?: string[];
}
