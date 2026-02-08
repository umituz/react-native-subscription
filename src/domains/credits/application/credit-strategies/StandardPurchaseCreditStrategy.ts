import { ICreditStrategy, type CreditAllocationParams } from "./ICreditStrategy";
import { isCreditPackage } from "../../../../utils/packageTypeDetector";

/**
 * Default strategy for new purchases, renewals, or upgrades.
 * Resets credits for subscriptions, but ADDS credits for consumable packages.
 */
export class StandardPurchaseCreditStrategy implements ICreditStrategy {
    canHandle(_params: CreditAllocationParams): boolean {
        // This is a catch-all strategy
        return true;
    }

    execute(params: CreditAllocationParams): number {
        // If it's a credit package (consumable), we add to existing balance
        if (params.productId && isCreditPackage(params.productId)) {
            const existing = params.existingData?.credits ?? 0;
            return existing + params.creditLimit;
        }

        // Standard subscription behavior: Reset to the calculated limit (e.g. 100/mo)
        return params.creditLimit;
    }
}
