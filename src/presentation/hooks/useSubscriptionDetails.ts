import { useMemo } from "react";
import { 
  type SubscriptionStatus, 
  SUBSCRIPTION_STATUS, 
  type SubscriptionStatusType,
  isSubscriptionValid,
  calculateDaysRemaining
} from "../../domain/entities/SubscriptionStatus";
import { formatDateForLocale } from "../utils/subscriptionDateUtils";

export interface SubscriptionDetails {
  /** Raw subscription status */
  status: SubscriptionStatus | null;
  /** Whether user has active premium */
  isPremium: boolean;
  /** Whether subscription is expired */
  isExpired: boolean;
  /** Whether this is a lifetime subscription */
  isLifetime: boolean;
  /** Days remaining until expiration (null for lifetime) */
  daysRemaining: number | null;
  /** Formatted expiration date (null if lifetime) */
  formattedExpirationDate: string | null;
  /** Formatted purchase date */
  formattedPurchaseDate: string | null;
  /** Status text key for localization */
  statusKey: SubscriptionStatusType;
}

interface UseSubscriptionDetailsParams {
  status: SubscriptionStatus | null;
  locale?: string;
}

/**
 * Hook for formatted subscription details
 */
export function useSubscriptionDetails(
  params: UseSubscriptionDetailsParams,
): SubscriptionDetails {
  const { status, locale = "en-US" } = params;

  return useMemo(() => {
    if (!status) {
      return {
        status: null,
        isPremium: false,
        isExpired: false,
        isLifetime: false,
        daysRemaining: null,
        formattedExpirationDate: null,
        formattedPurchaseDate: null,
        statusKey: SUBSCRIPTION_STATUS.NONE,
      };
    }

    const isValid = isSubscriptionValid(status);
    const isExpired = status.isPremium && !isValid;
    const isLifetime = status.isPremium && !status.expiresAt;
    const daysRemainingValue = calculateDaysRemaining(status.expiresAt ?? null);
    const isPremium = status.isPremium && isValid;

    let statusKey: SubscriptionStatusType = status.status || SUBSCRIPTION_STATUS.NONE;
    
    // Override status key based on current calculation for active/expired
    if (status.isPremium) {
      statusKey = isExpired ? SUBSCRIPTION_STATUS.EXPIRED : SUBSCRIPTION_STATUS.ACTIVE;
    } else if (status.status === SUBSCRIPTION_STATUS.CANCELED) {
      statusKey = SUBSCRIPTION_STATUS.CANCELED;
    } else {
      statusKey = SUBSCRIPTION_STATUS.NONE;
    }

    return {
      status,
      isPremium,
      isExpired,
      isLifetime,
      daysRemaining: daysRemainingValue,
      formattedExpirationDate: formatDateForLocale(status.expiresAt ?? null, locale),
      formattedPurchaseDate: formatDateForLocale(status.purchasedAt ?? null, locale),
      statusKey,
    };
  }, [status, locale]);
}

