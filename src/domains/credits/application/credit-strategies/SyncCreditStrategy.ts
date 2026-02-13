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
        const existingCredits = params.existingData?.credits;
        const hasExistingCredits = typeof existingCredits === 'number' && existingCredits >= 0;
        const hasExistingDocument = (params.existingData?.processedPurchases?.length ?? 0) > 0;

        if (params.isSubscriptionActive && !hasExistingDocument) {
            return params.creditLimit;
        }

        if (hasExistingCredits && params.existingData) {
            return params.existingData.credits;
        }

        return params.creditLimit;
    }
}
