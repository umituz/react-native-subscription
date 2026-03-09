import { timezoneService } from "@umituz/react-native-design-system/timezone";
import {
  SUBSCRIPTION_STATUS,
  type SubscriptionStatusType
} from "./SubscriptionConstants";
import {
  InactiveStatusHandler,
  ActiveStatusHandler
} from "./SubscriptionStatusHandlers";

export type { SubscriptionStatusType };

export interface SubscriptionStatus {
    isPremium: boolean;
    expirationDate: string | null;
    productId: string | null;
    purchasedAt?: string | null;
    customerId?: string | null;
    syncedAt?: string | null;
    status?: SubscriptionStatusType;
    periodType?: string;
}

export const createDefaultSubscriptionStatus = (): SubscriptionStatus => ({
    isPremium: false,
    expirationDate: null,
    productId: null,
    purchasedAt: null,
    customerId: null,
    syncedAt: null,
    status: SUBSCRIPTION_STATUS.NONE,
});

export const isSubscriptionValid = (status: SubscriptionStatus | null): boolean => {
    if (!status || !status.isPremium) return false;
    if (!status.expirationDate) return true;
    return timezoneService.isFuture(new Date(status.expirationDate));
};

export interface StatusResolverInput {
    isPremium: boolean;
    willRenew?: boolean;
    isExpired?: boolean;
    periodType?: string;
}

const inactiveHandler = new InactiveStatusHandler();
inactiveHandler.setNext(new ActiveStatusHandler());

export const resolveSubscriptionStatus = (input: StatusResolverInput): SubscriptionStatusType => {
    return inactiveHandler.handle(input);
};
