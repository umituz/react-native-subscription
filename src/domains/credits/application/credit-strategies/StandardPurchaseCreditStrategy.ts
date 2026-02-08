import { ICreditStrategy, type CreditAllocationParams } from "./ICreditStrategy";

/**
 * Default strategy for new purchases, renewals, or upgrades.
 * Resets credits to the calculated credit limit.
 */
export class StandardPurchaseCreditStrategy implements ICreditStrategy {
    canHandle(_params: CreditAllocationParams): boolean {
        // This is a catch-all strategy
        return true;
    }

    execute(params: CreditAllocationParams): number {
        return params.creditLimit;
    }
}
