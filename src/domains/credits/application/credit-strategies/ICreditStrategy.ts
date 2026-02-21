import type { SubscriptionStatusType } from "../../../subscription/core/SubscriptionStatus";
import type { UserCreditsDocumentRead } from "../../core/UserCreditsDocument";

export interface CreditAllocationParams {
    status: SubscriptionStatusType;
    existingData: UserCreditsDocumentRead | null;
    creditLimit: number;
    isSubscriptionActive: boolean;
    productId?: string;
}

export interface ICreditStrategy {
    canHandle(params: CreditAllocationParams): boolean;
    execute(params: CreditAllocationParams): number;
}
