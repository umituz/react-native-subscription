import { timezoneService } from "@umituz/react-native-design-system";
import { 
  SUBSCRIPTION_STATUS, 
  PERIOD_TYPE, 
  type PeriodType, 
  type SubscriptionStatusType 
} from "./SubscriptionConstants";

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
    /** RevenueCat period type: NORMAL, INTRO, or TRIAL */
    periodType?: PeriodType;
    /** Whether user is currently in trial period */
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

/** Subscription status resolver input */
export interface StatusResolverInput {
    isPremium: boolean;
    willRenew?: boolean;
    isExpired?: boolean;
    periodType?: PeriodType;
}

/**
 * Resolves subscription status from input parameters
 * Single source of truth for status determination logic
 */
export const resolveSubscriptionStatus = (input: StatusResolverInput): SubscriptionStatusType => {
    const { isPremium, willRenew, isExpired, periodType } = input;

    if (!isPremium || isExpired) {
        return isExpired ? SUBSCRIPTION_STATUS.EXPIRED : SUBSCRIPTION_STATUS.NONE;
    }

    const isTrial = periodType === PERIOD_TYPE.TRIAL;
    const isCanceled = willRenew === false;

    if (isTrial) {
        return isCanceled ? SUBSCRIPTION_STATUS.TRIAL_CANCELED : SUBSCRIPTION_STATUS.TRIAL;
    }

    return isCanceled ? SUBSCRIPTION_STATUS.CANCELED : SUBSCRIPTION_STATUS.ACTIVE;
};

