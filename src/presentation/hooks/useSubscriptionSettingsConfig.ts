/**
 * useSubscriptionSettingsConfig Hook
 * Returns ready-to-use config for settings screens
 * Package-driven: all logic handled internally
 */

import { useMemo } from "react";
import { useCredits } from "./useCredits";
import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { useCustomerInfo } from "../../revenuecat/presentation/hooks/useCustomerInfo";
import { usePaywallVisibility } from "./usePaywallVisibility";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import {
    convertPurchasedAt,
    formatDateForLocale,
    calculateDaysRemaining,
} from "../utils/subscriptionDateUtils";
import type {
  SubscriptionSettingsConfig,
  SubscriptionStatusType,
  UseSubscriptionSettingsConfigParams,
} from "../types/SubscriptionSettingsTypes";

// Re-export types for convenience
export type {
  SubscriptionSettingsConfig,
  SubscriptionSettingsItemConfig,
  SubscriptionSettingsTranslations,
  UseSubscriptionSettingsConfigParams,
} from "../types/SubscriptionSettingsTypes";

/**
 * Hook that returns ready-to-use subscription config for settings
 * All business logic handled internally
 */
export const useSubscriptionSettingsConfig = (
  params: UseSubscriptionSettingsConfigParams
): SubscriptionSettingsConfig => {
  const {
    userId,
    isAnonymous = false,
    currentLanguage = "en",
    translations,
    getCreditLimit,
    upgradePrompt,
  } = params;

  // Internal hooks
  const { credits } = useCredits({ userId, enabled: !!userId });
  const {
    isPremium: subscriptionActive,
    expirationDate: statusExpirationDate,
  } = useSubscriptionStatus({
    userId,
    enabled: !!userId,
  });
  const { customerInfo } = useCustomerInfo();
  const { openPaywall } = usePaywallVisibility();

  // Premium status from actual RevenueCat subscription
  const isPremium = subscriptionActive;

  // RevenueCat entitlement info - dynamically using configured entitlementId
  const entitlementId = SubscriptionManager.getEntitlementId() || "premium";
  const premiumEntitlement = customerInfo?.entitlements.active[entitlementId];

  // Prefer expiration date from useSubscriptionStatus (checkPremiumStatus)
  // as it is already processed and typed. Fallback to CustomerInfo ISO string.
  const expiresAtIso = statusExpirationDate
    ? statusExpirationDate.toISOString()
    : premiumEntitlement?.expirationDate || null;

  const willRenew = premiumEntitlement?.willRenew || false;
  const purchasedAtIso = convertPurchasedAt(credits?.purchasedAt);

  // Formatted dates
  const formattedExpirationDate = useMemo(
    () => formatDateForLocale(expiresAtIso, currentLanguage),
    [expiresAtIso, currentLanguage]
  );

  const formattedPurchaseDate = useMemo(
    () => formatDateForLocale(purchasedAtIso, currentLanguage),
    [purchasedAtIso, currentLanguage]
  );

  // Days remaining calculation
  const daysRemaining = useMemo(
    () => calculateDaysRemaining(expiresAtIso),
    [expiresAtIso]
  );

  // Status type
  const statusType: SubscriptionStatusType = isPremium ? "active" : "none";

  // Credits array
  const creditsArray = useMemo(() => {
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

  // Build config
  const config = useMemo(
    (): SubscriptionSettingsConfig => ({
      enabled: true,
      settingsItem: {
        title: translations.title,
        description: translations.description,
        isPremium,
        statusLabel: isPremium
          ? translations.statusActive
          : translations.statusFree,
        icon: "diamond",
        onPress: openPaywall,
      },
      sectionConfig: {
        statusType,
        isPremium,
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
        onUpgrade: openPaywall,
        upgradePrompt,
      },
    }),
    [
      translations,
      isPremium,
      statusType,
      formattedExpirationDate,
      formattedPurchaseDate,
      expiresAtIso,
      daysRemaining,
      willRenew,
      creditsArray,
      openPaywall,
      upgradePrompt,
    ]
  );

  if (__DEV__) {
    console.log("[useSubscriptionSettingsConfig]", {
      enabled: config.enabled,
      isPremium,
      isAnonymous,
      hasCredits: !!credits,
      userId: userId || "ANONYMOUS",
    });
  }

  return config;
};
