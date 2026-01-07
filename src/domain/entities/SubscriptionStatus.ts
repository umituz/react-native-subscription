/**
 * Subscription Status Entity
 */

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

    const expirationDate = new Date(status.expiresAt);
    const now = new Date();

    // Add 24-hour grace period buffer
    const buffer = 24 * 60 * 60 * 1000;
    return expirationDate.getTime() + buffer > now.getTime();
};
