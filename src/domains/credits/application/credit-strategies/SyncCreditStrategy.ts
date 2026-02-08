import { ICreditStrategy, type CreditAllocationParams } from "./ICreditStrategy";

/**
 * Strategy for existing premium users during a simple status synchronization.
 * Preserves their current credits to avoid accidental resets.
 */
export class SyncCreditStrategy implements ICreditStrategy {
    canHandle(params: CreditAllocationParams): boolean {
        return params.isStatusSync && params.existingData?.isPremium === true && params.isSubscriptionActive;
    }

    execute(params: CreditAllocationParams): number {
        return params.existingData?.credits ?? params.creditLimit;
    }
}
