import {
  SUBSCRIPTION_STATUS,
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
}

export class InactiveStatusHandler extends BaseStatusHandler {
    handle(input: StatusResolverInput): SubscriptionStatusType {
        const isExpired = input.isExpired === true;

        if (!input.isPremium || isExpired) {
            return isExpired ? SUBSCRIPTION_STATUS.EXPIRED : SUBSCRIPTION_STATUS.NONE;
        }
        return this.next ? this.next.handle(input) : SUBSCRIPTION_STATUS.NONE;
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
