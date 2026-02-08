import { timezoneService } from "@umituz/react-native-design-system";
import { 
  SUBSCRIPTION_STATUS, 
  PERIOD_TYPE, 
  type PeriodType, 
  type SubscriptionStatusType 
} from "./SubscriptionConstants";
import { 
  InactiveStatusHandler, 
  TrialStatusHandler, 
  ActiveStatusHandler 
} from "./SubscriptionStatusHandlers";

export { 
  SUBSCRIPTION_STATUS, 
  PERIOD_TYPE, 
  type PeriodType, 
  type SubscriptionStatusType 
};

export interface SubscriptionStatus {
    isPremium: boolean;
    expiresAt: string | null;
    productId: string | null;
    purchasedAt?: string | null;
    customerId?: string | null;
    syncedAt?: string | null;
    status?: SubscriptionStatusType;
    periodType?: PeriodType;
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
    if (!status.expiresAt) return true; // Lifetime
    return timezoneService.isFuture(new Date(status.expiresAt));
};

export const calculateDaysRemaining = (expiresAt: string | null): number | null => {
    if (!expiresAt) return null;
    return timezoneService.getDaysUntil(new Date(expiresAt));
};

export interface StatusResolverInput {
    isPremium: boolean;
    willRenew?: boolean;
    isExpired?: boolean;
    periodType?: PeriodType;
}

// Singleton Chain Instance
const inactiveHandler = new InactiveStatusHandler();
inactiveHandler
    .setNext(new TrialStatusHandler())
    .setNext(new ActiveStatusHandler());

/**
 * Resolves subscription status using Chain of Responsibility Pattern.
 */
export const resolveSubscriptionStatus = (input: StatusResolverInput): SubscriptionStatusType => {
    return inactiveHandler.handle(input);
};
