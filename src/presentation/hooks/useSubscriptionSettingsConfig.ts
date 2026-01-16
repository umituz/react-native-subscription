/**
 * useSubscriptionSettingsConfig Hook
 * Returns ready-to-use config for settings screens
 * Single Source of Truth: Firestore (credits document)
 */

import { useMemo, useCallback } from "react";
import { useCredits } from "./useCredits";
import { usePaywallVisibility } from "./usePaywallVisibility";
import { calculateDaysRemaining } from "../../domain/entities/SubscriptionStatus";
import { formatDate } from "../utils/subscriptionDateUtils";
import { useCreditsArray, getSubscriptionStatusType } from "./useSubscriptionSettingsConfig.utils";
import { getCreditsConfig } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import type {
  SubscriptionSettingsConfig,
  SubscriptionStatusType,
  UseSubscriptionSettingsConfigParams,
} from "../types/SubscriptionSettingsTypes";

export type {
  SubscriptionSettingsConfig,
  SubscriptionSettingsItemConfig,
  SubscriptionSettingsTranslations,
  UseSubscriptionSettingsConfigParams,
} from "../types/SubscriptionSettingsTypes";

/**
 * Hook that returns ready-to-use subscription config for settings
 * Single Source of Truth: Firestore credits document
 */
export const useSubscriptionSettingsConfig = (
  params: UseSubscriptionSettingsConfigParams
): SubscriptionSettingsConfig => {
  const { userId, translations, creditLimit, upgradePrompt } = params;

  // Single Source of Truth: Firestore credits document
  const { credits } = useCredits({ userId, enabled: !!userId });
  const { openPaywall } = usePaywallVisibility();

  const handleOpenPaywall = useCallback(() => {
    openPaywall("settings");
  }, [openPaywall]);

  // All data from Firestore (Single Source of Truth)
  const isPremium = credits?.isPremium ?? false;
  const willRenew = credits?.willRenew ?? false;

  // Expiration date from Firestore
  const expiresAtIso = credits?.expirationDate?.toISOString() ?? null;

  // Purchase date from Firestore
  const purchasedAtIso = credits?.purchasedAt?.toISOString() ?? null;

  // Credit limit from Firestore or config fallback
  const dynamicCreditLimit = useMemo(() => {
    if (credits?.creditLimit) return credits.creditLimit;
    const config = getCreditsConfig();
    return creditLimit ?? config.creditLimit;
  }, [credits?.creditLimit, creditLimit]);

  // Formatted dates
  const formattedExpirationDate = useMemo(() => formatDate(expiresAtIso), [expiresAtIso]);
  const formattedPurchaseDate = useMemo(() => formatDate(purchasedAtIso), [purchasedAtIso]);

  // Days remaining
  const daysRemaining = useMemo(() => calculateDaysRemaining(expiresAtIso), [expiresAtIso]);

  // Period type from Firestore
  const periodType = credits?.periodType;

  // Status type: prioritize Firestore status, then derive from willRenew + expiration + periodType
  const statusType: SubscriptionStatusType = credits?.status
    ? (credits.status as SubscriptionStatusType)
    : getSubscriptionStatusType(isPremium, willRenew, expiresAtIso, periodType);

  const creditsArray = useCreditsArray(credits, dynamicCreditLimit, translations);

  // Centralized display flags
  const hasCredits = creditsArray.length > 0;
  const display = useMemo(() => ({
    showHeader: isPremium || hasCredits,
    showCredits: hasCredits,
    showUpgradePrompt: !isPremium && !hasCredits && !!upgradePrompt,
    showExpirationDate: (isPremium || hasCredits) && !!expiresAtIso,
  }), [isPremium, hasCredits, upgradePrompt, expiresAtIso]);

  // Build config
  return useMemo((): SubscriptionSettingsConfig => ({
    enabled: true,
    settingsItem: {
      title: translations.title,
      description: translations.description,
      isPremium,
      statusLabel: isPremium ? translations.statusActive : translations.statusFree,
      icon: "diamond",
      onPress: handleOpenPaywall,
    },
    sectionConfig: {
      statusType,
      isPremium,
      display,
      expirationDate: formattedExpirationDate,
      purchaseDate: formattedPurchaseDate,
      isLifetime: isPremium && !expiresAtIso,
      daysRemaining,
      willRenew,
      credits: creditsArray,
      translations: {
        title: translations.title,
        statusLabel: translations.statusLabel,
        statusActive: translations.statusActive,
        statusExpired: translations.statusExpired,
        statusFree: translations.statusFree,
        statusCanceled: translations.statusCanceled,
        expiresLabel: translations.expiresLabel,
        purchasedLabel: translations.purchasedLabel,
        lifetimeLabel: translations.lifetimeLabel,
        creditsTitle: translations.creditsTitle,
        remainingLabel: translations.remainingLabel,
        manageButton: translations.manageButton,
        upgradeButton: translations.upgradeButton,
      },
      onUpgrade: handleOpenPaywall,
      upgradePrompt,
    },
  }), [
    translations, isPremium, statusType, display, formattedExpirationDate,
    formattedPurchaseDate, expiresAtIso, daysRemaining, willRenew,
    creditsArray, handleOpenPaywall, upgradePrompt,
  ]);
};
