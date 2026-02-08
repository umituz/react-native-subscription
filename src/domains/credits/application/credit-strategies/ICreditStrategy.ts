import type { SubscriptionStatusType } from "../../domain/entities/SubscriptionStatus";
import type { UserCreditsDocumentRead } from "../models/UserCreditsDocument";

export interface CreditStrategyParams {
    status: SubscriptionStatusType;
    isStatusSync: boolean;
    existingData: UserCreditsDocumentRead | null;
    creditLimit: number;
    isSubscriptionActive: boolean;
}

export interface ICreditStrategy {
    canHandle(params: CreditAllocationParams): boolean;
    execute(params: CreditAllocationParams): number;
}

// Renaming the input for clarity
export type CreditAllocationParams = CreditStrategyParams;
