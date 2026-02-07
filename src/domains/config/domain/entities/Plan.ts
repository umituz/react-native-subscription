/**
 * Plan Entity
 * Represents a subscription plan with credits and pricing
 */

export type PlanType = "weekly" | "monthly" | "yearly" | "lifetime" | "custom";

export interface Plan {
  readonly id: string;
  readonly type: PlanType;
  readonly credits: number;
  readonly price: number;
  readonly currency: string;
  readonly labelKey: string;
  readonly descriptionKey?: string;
  readonly isBestValue?: boolean;
  readonly isPopular?: boolean;
}

export interface PlanMetadata {
  readonly cost: number;
  readonly profit: number;
  readonly profitMargin: number;
  readonly pricePerCredit: number;
}

export const calculatePlanMetadata = (
  plan: Plan,
  costPerCredit: number,
  commissionRate: number = 0.30
): PlanMetadata => {
  const totalCost = plan.credits * costPerCredit;
  const netRevenue = plan.price * (1 - commissionRate);
  const profit = netRevenue - totalCost;
  const profitMargin = plan.price > 0 ? (profit / plan.price) * 100 : 0;
  const pricePerCredit = plan.credits > 0 ? plan.price / plan.credits : 0;

  return {
    cost: totalCost,
    profit,
    profitMargin,
    pricePerCredit,
  };
};
