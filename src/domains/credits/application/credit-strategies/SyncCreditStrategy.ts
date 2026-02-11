import { ICreditStrategy, type CreditAllocationParams } from "./ICreditStrategy";

/**
 * Strategy for existing premium users during a simple status synchronization.
 * Preserves their current credits to avoid accidental resets.
 */
export class SyncCreditStrategy implements ICreditStrategy {
    canHandle(params: CreditAllocationParams): boolean {
        return params.isStatusSync;
    }

    execute(params: CreditAllocationParams): number {
        const hasExistingCredits = params.existingData?.credits != null && params.existingData.credits > 0;
        const hasExistingDocument = params.existingData?.processedPurchases?.length > 0;

        if (params.isSubscriptionActive && !hasExistingDocument) {
            return params.creditLimit;
        }

        return hasExistingCredits ? params.existingData.credits : params.creditLimit;
    }
}
