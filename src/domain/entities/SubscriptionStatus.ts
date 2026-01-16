import { timezoneService } from "@umituz/react-native-design-system";

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  TRIAL_CANCELED: 'trial_canceled',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
  NONE: 'none',
} as const;

/** RevenueCat period types */
export type PeriodType = "NORMAL" | "INTRO" | "TRIAL";

export type SubscriptionStatusType = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

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
    status: 'none',
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

