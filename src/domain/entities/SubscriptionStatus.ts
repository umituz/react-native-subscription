import { timezoneService } from "@umituz/react-native-timezone";

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
  NONE: 'none',
} as const;

export type SubscriptionStatusType = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export interface SubscriptionStatus {
    isPremium: boolean;
    expiresAt: string | null;
    productId: string | null;
    purchasedAt?: string | null;
    customerId?: string | null;
    syncedAt?: string | null;
    status?: SubscriptionStatusType;
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

