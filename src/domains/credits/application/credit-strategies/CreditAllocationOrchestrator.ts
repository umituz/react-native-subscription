import type { ICreditStrategy, CreditAllocationParams } from "./ICreditStrategy";
import { SyncCreditStrategy } from "./SyncCreditStrategy";
import { TrialCreditStrategy } from "./TrialCreditStrategy";
import { StandardPurchaseCreditStrategy } from "./StandardPurchaseCreditStrategy";

/**
 * Orchestrator to coordinate credit allocation logic using the Strategy Pattern.
 */
class CreditAllocationOrchestrator {
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
            return params.creditLimit;
        }

        return strategy.execute(params);
    }
}

export const creditAllocationOrchestrator = new CreditAllocationOrchestrator();
