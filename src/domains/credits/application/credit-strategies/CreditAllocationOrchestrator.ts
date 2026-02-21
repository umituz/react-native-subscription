import type { ICreditStrategy, CreditAllocationParams } from "./ICreditStrategy";
import { StandardPurchaseCreditStrategy } from "./StandardPurchaseCreditStrategy";

class CreditAllocationOrchestrator {
    private strategies: ICreditStrategy[] = [
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
