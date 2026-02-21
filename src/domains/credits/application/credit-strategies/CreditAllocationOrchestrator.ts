import type { ICreditStrategy, CreditAllocationParams } from "./ICreditStrategy";
import { TrialCreditStrategy } from "./TrialCreditStrategy";
import { StandardPurchaseCreditStrategy } from "./StandardPurchaseCreditStrategy";

class CreditAllocationOrchestrator {
    private strategies: ICreditStrategy[] = [
        new TrialCreditStrategy(),
        new StandardPurchaseCreditStrategy(),
    ];

    allocate(params: CreditAllocationParams): number {
        const strategy = this.strategies.find(s => s.canHandle(params));

        if (!strategy) {
            return params.creditLimit;
        }

        return strategy.execute(params);
    }
}

export const creditAllocationOrchestrator = new CreditAllocationOrchestrator();
