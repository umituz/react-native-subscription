/**
 * useSubscriptionSettingsConfig Utilities
 * Helper functions for subscription settings config
 */

import { useMemo } from "react";
import type { UserCredits } from "../../domain/entities/Credits";
import type { SubscriptionSettingsTranslations } from "../types/SubscriptionSettingsTypes";

export interface CreditsInfo {
  id: string;
  label: string;
  current: number;
  total: number;
}

/**
 * Builds credits array for display
 */
export function useCreditsArray(
  credits: UserCredits | null | undefined,
  creditLimit: number | undefined,
  translations: SubscriptionSettingsTranslations
): CreditsInfo[] {
  return useMemo(() => {
    if (!credits) return [];
    const validCredits = isNaN(credits.credits) ? 0 : credits.credits;
    return [
      {
        id: "credits",
        label: translations.creditsLabel,
        current: validCredits,
        total: creditLimit ?? validCredits,
      },
    ];
  }, [credits, creditLimit, translations.creditsLabel]);
}

/**
 * Calculates subscription status type based on premium and renewal status
 * @param isPremium - Whether user has premium subscription
 * @param willRenew - Whether subscription will auto-renew (false = canceled)
 * @param expiresAt - Expiration date ISO string (null for lifetime)
 */
export function getSubscriptionStatusType(
  isPremium: boolean,
  willRenew?: boolean,
  expiresAt?: string | null
): "active" | "canceled" | "expired" | "none" {
  if (!isPremium) {
    return "none";
  }

  // Lifetime subscription (no expiration) - always active
  if (!expiresAt) {
    return "active";
  }

  // Check if expired
  const now = new Date();
  const expDate = new Date(expiresAt);
  if (expDate < now) {
    return "expired";
  }

  // Premium with willRenew=false means subscription is canceled but still active until expiration
  if (willRenew === false) {
    return "canceled";
  }

  return "active";
}
