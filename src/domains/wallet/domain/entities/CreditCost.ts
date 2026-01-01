/**
 * Credit Cost Entity
 *
 * Configurable credit cost configuration for AI operations.
 * Apps can override default costs based on their pricing model.
 */

import type { AICreditCosts } from "../types/credit-cost.types";

  DEFAULT_AI_CREDIT_COSTS,
  createCreditCostConfig,
} from "../types/credit-cost.types";

export interface CreditCostEntity {
  costs: AICreditCosts;
  pricePerCredit: number;
  getCost: (operation: keyof AICreditCosts) => number;
  getDollarValue: (operation: keyof AICreditCosts) => number;
  getCustomCost: (operation: string) => number;
}

export function createCreditCostEntity(
  overrides?: Partial<AICreditCosts>,
  pricePerCredit: number = 0.1
): CreditCostEntity {
  const costs = createCreditCostConfig(overrides);

  return {
    costs,
    pricePerCredit,
    getCost: (operation: keyof AICreditCosts): number => {
      return costs[operation];
    },
    getDollarValue: (operation: keyof AICreditCosts): number => {
      return costs[operation] * pricePerCredit;
    },
    getCustomCost: (operation: string): number => {
      return (costs as unknown as Record<string, number>)[operation] ?? 0;
    },
  };
}

export { DEFAULT_AI_CREDIT_COSTS, createCreditCostConfig };
export type { AICreditCosts };
