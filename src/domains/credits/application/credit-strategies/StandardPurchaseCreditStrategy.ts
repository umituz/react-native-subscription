import { ICreditStrategy, type CreditAllocationParams } from "./ICreditStrategy";
import { isCreditPackage } from "../../../../utils/packageTypeDetector";

export class StandardPurchaseCreditStrategy implements ICreditStrategy {
    canHandle(_params: CreditAllocationParams): boolean {
        return true;
    }

    execute(params: CreditAllocationParams): number {
        const isConsumable = params.productId && isCreditPackage(params.productId);
        return isConsumable 
            ? (params.existingData?.credits ?? 0) + params.creditLimit
            : params.creditLimit;
    }
}
