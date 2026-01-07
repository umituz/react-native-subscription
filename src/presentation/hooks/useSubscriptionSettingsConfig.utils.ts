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
  getCreditLimit: ((credits: number) => number) | undefined,
  translations: SubscriptionSettingsTranslations
): CreditsInfo[] {
  return useMemo(() => {
    if (!credits) return [];
    const total = getCreditLimit
      ? getCreditLimit(credits.imageCredits)
      : credits.imageCredits;
    return [
      {
        id: "image",
        label: translations.imageCreditsLabel || "Image Credits",
        current: credits.imageCredits,
        total,
      },
    ];
  }, [credits, getCreditLimit, translations.imageCreditsLabel]);
}

/**
 * Calculates subscription status type
 */
export function getSubscriptionStatusType(
  isPremium: boolean
): "active" | "none" {
  return isPremium ? "active" : "none";
}
