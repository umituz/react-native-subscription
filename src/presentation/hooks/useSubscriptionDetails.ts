/**
 * useSubscriptionDetails Hook
 * Provides formatted subscription details for display
 */

import { useMemo } from "react";
import type { SubscriptionStatus } from "../../domain/entities/SubscriptionStatus";
import {
    getDaysUntilExpiration,
    isSubscriptionExpired,
} from "../../utils/dateValidationUtils";

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
  statusKey: "active" | "expired" | "none";
}

interface UseSubscriptionDetailsParams {
  status: SubscriptionStatus | null;
  locale?: string;
}

/**
 * Format date to localized string
 */
function formatDate(dateString: string | null, locale: string): string | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
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
        statusKey: "none",
      };
    }

    const isExpired = isSubscriptionExpired(status);
    const isLifetime = status.isPremium && !status.expiresAt;
    const daysRemaining = getDaysUntilExpiration(status);
    const isPremium = status.isPremium && !isExpired;

    let statusKey: "active" | "expired" | "none" = "none";
    if (status.isPremium) {
      statusKey = isExpired ? "expired" : "active";
    }

    return {
      status,
      isPremium,
      isExpired,
      isLifetime,
      daysRemaining,
      formattedExpirationDate: formatDate(status.expiresAt ?? null, locale),
      formattedPurchaseDate: formatDate(status.purchasedAt ?? null, locale),
      statusKey,
    };
  }, [status, locale]);
}
