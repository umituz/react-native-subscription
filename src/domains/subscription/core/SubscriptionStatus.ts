import { timezoneService } from "@umituz/react-native-design-system";
import {
  SUBSCRIPTION_STATUS,
  type SubscriptionStatusType
} from "./SubscriptionConstants";
import {
  InactiveStatusHandler,
  TrialStatusHandler,
  ActiveStatusHandler
} from "./SubscriptionStatusHandlers";

export type { SubscriptionStatusType };

export interface SubscriptionStatus {
    isPremium: boolean;
    expiresAt: string | null;
    productId: string | null;
    purchasedAt?: string | null;
    customerId?: string | null;
    syncedAt?: string | null;
    status?: SubscriptionStatusType;
    periodType?: string;
    isTrialing?: boolean;
}

export const createDefaultSubscriptionStatus = (): SubscriptionStatus => ({
    isPremium: false,
    expiresAt: null,
    productId: null,
    purchasedAt: null,
    customerId: null,
    syncedAt: null,
    status: SUBSCRIPTION_STATUS.NONE,
});

export const isSubscriptionValid = (status: SubscriptionStatus | null): boolean => {
    if (!status || !status.isPremium) return false;
    if (!status.expiresAt) return true;
    return timezoneService.isFuture(new Date(status.expiresAt));
};

export interface StatusResolverInput {
    isPremium: boolean;
    willRenew?: boolean;
    isExpired?: boolean;
    periodType?: string;
}

const inactiveHandler = new InactiveStatusHandler();
inactiveHandler
    .setNext(new TrialStatusHandler())
    .setNext(new ActiveStatusHandler());

export const resolveSubscriptionStatus = (input: StatusResolverInput): SubscriptionStatusType => {
    return inactiveHandler.handle(input);
};
