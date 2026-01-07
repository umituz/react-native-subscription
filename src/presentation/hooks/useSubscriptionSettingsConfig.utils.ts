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
    return [
      {
        id: "credits",
        label: translations.creditsLabel || "Credits",
        current: credits.credits,
        total: creditLimit ?? credits.credits,
      },
    ];
  }, [credits, creditLimit, translations.creditsLabel]);
}

/**
 * Calculates subscription status type
 */
export function getSubscriptionStatusType(
  isPremium: boolean
): "active" | "none" {
  return isPremium ? "active" : "none";
}
