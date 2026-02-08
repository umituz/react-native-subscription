import type { ICreditStrategy, CreditAllocationParams } from "./ICreditStrategy";
import { SyncCreditStrategy } from "./SyncCreditStrategy";
import { TrialCreditStrategy } from "./TrialCreditStrategy";
import { StandardPurchaseCreditStrategy } from "./StandardPurchaseCreditStrategy";

/**
 * Strategy Context to coordinate credit allocation logic using the Strategy Pattern.
 */
export class CreditAllocationContext {
    private strategies: ICreditStrategy[] = [
        new SyncCreditStrategy(),
        new TrialCreditStrategy(),
        new StandardPurchaseCreditStrategy(), // Fallback strategy
    ];

    /**
     * Finds the first applicable strategy and executes its logic.
     */
    allocate(params: CreditAllocationParams): number {
        const strategy = this.strategies.find(s => s.canHandle(params));
        
        if (!strategy) {
            // Should theoretically never happen due to StandardPurchaseCreditStrategy fallback
            return params.creditLimit;
        }

        if (__DEV__) {
            console.log(`[CreditAllocationContext] Using strategy: ${strategy.constructor.name}`);
        }

        return strategy.execute(params);
    }
}

export const creditAllocationContext = new CreditAllocationContext();
