/**
 * useSubscriptionSettingsConfig Hook
 * Returns ready-to-use config for settings screens
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

export const useSubscriptionSettingsConfig = (
  params: Omit<UseSubscriptionSettingsConfigParams, 'userId'>
): SubscriptionSettingsConfig => {
  const { translations, creditLimit, upgradePrompt } = params;

  const { credits } = useCredits();
  const { openPaywall } = usePaywallVisibility();

  const handleOpenPaywall = useCallback(() => {
    openPaywall("settings");
  }, [openPaywall]);

  const isPremium = credits?.isPremium ?? false;
  const willRenew = credits?.willRenew ?? false;

  const expiresAtIso = credits?.expirationDate?.toISOString() ?? null;
  const purchasedAtIso = credits?.purchasedAt?.toISOString() ?? null;

  const dynamicCreditLimit = useMemo(() => {
    if (credits?.creditLimit) return credits.creditLimit;
    const config = getCreditsConfig();
    return creditLimit ?? config.creditLimit;
  }, [credits?.creditLimit, creditLimit]);

  const formattedExpirationDate = useMemo(() => formatDate(expiresAtIso), [expiresAtIso]);
  const formattedPurchaseDate = useMemo(() => formatDate(purchasedAtIso), [purchasedAtIso]);

  const daysRemaining = useMemo(() => calculateDaysRemaining(expiresAtIso), [expiresAtIso]);

  const periodType = credits?.periodType;

  const statusType: SubscriptionStatusType = credits?.status
    ? (credits.status as SubscriptionStatusType)
    : getSubscriptionStatusType(isPremium, willRenew, expiresAtIso, periodType);

  const creditsArray = useCreditsArray(credits, dynamicCreditLimit, translations);

  const hasCredits = creditsArray.length > 0;
  const display = useMemo(() => ({
    showHeader: isPremium || hasCredits,
    showCredits: hasCredits,
    showUpgradePrompt: !isPremium && !hasCredits && !!upgradePrompt,
    showExpirationDate: (isPremium || hasCredits) && !!expiresAtIso,
  }), [isPremium, hasCredits, upgradePrompt, expiresAtIso]);

  return useMemo((): SubscriptionSettingsConfig => ({
    enabled: true,
    settingsItem: {
      title: translations.title,
      description: translations.description,
      isPremium,
      statusLabel: isPremium ? translations.statusActive : translations.statusInactive,
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
        statusInactive: translations.statusInactive,
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
