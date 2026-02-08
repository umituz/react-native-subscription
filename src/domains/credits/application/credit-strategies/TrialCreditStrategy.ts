import { ICreditStrategy, type CreditAllocationParams } from "./ICreditStrategy";
import { SUBSCRIPTION_STATUS } from "../../../domain/entities/SubscriptionStatus";
import { TRIAL_CONFIG } from "../TrialService";

/**
 * Strategy for Trial and Trial Canceled users.
 * Allocates credits based on trial configuration.
 */
export class TrialCreditStrategy implements ICreditStrategy {
    canHandle(params: CreditAllocationParams): boolean {
        return params.status === SUBSCRIPTION_STATUS.TRIAL || 
               params.status === SUBSCRIPTION_STATUS.TRIAL_CANCELED;
    }

    execute(_params: CreditAllocationParams): number {
        return TRIAL_CONFIG.CREDITS;
    }
}
