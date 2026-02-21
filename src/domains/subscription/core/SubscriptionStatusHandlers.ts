import {
  SUBSCRIPTION_STATUS,
  PERIOD_TYPE,
  type SubscriptionStatusType
} from "./SubscriptionConstants";
import type { StatusResolverInput } from "./SubscriptionStatus";

abstract class BaseStatusHandler {
    protected next?: BaseStatusHandler;

    setNext(handler: BaseStatusHandler): BaseStatusHandler {
        this.next = handler;
        return handler;
    }

    abstract handle(input: StatusResolverInput): SubscriptionStatusType;

    protected nextOrFallback(input: StatusResolverInput, fallback: SubscriptionStatusType): SubscriptionStatusType {
        return this.next ? this.next.handle(input) : fallback;
    }
}

export class InactiveStatusHandler extends BaseStatusHandler {
    handle(input: StatusResolverInput): SubscriptionStatusType {
        const isExpired = input.isExpired === true;

        if (!input.isPremium || isExpired) {
            return isExpired ? SUBSCRIPTION_STATUS.EXPIRED : SUBSCRIPTION_STATUS.NONE;
        }
        return this.nextOrFallback(input, SUBSCRIPTION_STATUS.NONE);
    }
}

export class TrialStatusHandler extends BaseStatusHandler {
    handle(input: StatusResolverInput): SubscriptionStatusType {
        if (input.periodType === PERIOD_TYPE.TRIAL) {
            return input.willRenew === false ? SUBSCRIPTION_STATUS.TRIAL_CANCELED : SUBSCRIPTION_STATUS.TRIAL;
        }
        return this.nextOrFallback(input, SUBSCRIPTION_STATUS.ACTIVE);
    }
}

export class ActiveStatusHandler extends BaseStatusHandler {
    handle(input: StatusResolverInput): SubscriptionStatusType {
        if (input.willRenew === false) {
            return SUBSCRIPTION_STATUS.CANCELED;
        }
        return SUBSCRIPTION_STATUS.ACTIVE;
    }
}
