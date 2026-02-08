import type { SubscriptionStatusType } from "../../../subscription/core/SubscriptionStatus";
import type { UserCreditsDocumentRead } from "../../core/UserCreditsDocument";

export interface CreditStrategyParams {
    status: SubscriptionStatusType;
    isStatusSync: boolean;
    existingData: UserCreditsDocumentRead | null;
    creditLimit: number;
    isSubscriptionActive: boolean;
    productId?: string;
}

export interface ICreditStrategy {
    canHandle(params: CreditAllocationParams): boolean;
    execute(params: CreditAllocationParams): number;
}

// Renaming the input for clarity
export type CreditAllocationParams = CreditStrategyParams;
