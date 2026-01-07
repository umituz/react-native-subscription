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
import { calculateDaysRemaining } from "../../domain/entities/SubscriptionStatus";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import { formatDate, convertPurchasedAt } from "../utils/subscriptionDateUtils";
import { useCreditsArray, getSubscriptionStatusType } from "./useSubscriptionSettingsConfig.utils";
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
    translations,
    creditLimit,
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

  // RevenueCat entitlement info - dynamically using configured entitlementId
  const entitlementId = SubscriptionManager.getEntitlementId() || "premium";
  const premiumEntitlement = customerInfo?.entitlements.active[entitlementId];

  // Premium status: use customerInfo directly as it updates in real-time via listener
  // This is the source of truth, subscriptionActive is just a backup
  const isPremium = !!premiumEntitlement || subscriptionActive;

  // Get expiration date from RevenueCat entitlement (source of truth)
  // premiumEntitlement.expirationDate is an ISO string from RevenueCat
  const entitlementExpirationDate = premiumEntitlement?.expirationDate || null;

  // Prefer CustomerInfo expiration (real-time) over cached status
  const expiresAtIso = entitlementExpirationDate || (statusExpirationDate
    ? statusExpirationDate.toISOString()
    : null);



  const willRenew = premiumEntitlement?.willRenew || false;
  const purchasedAtIso = convertPurchasedAt(credits?.purchasedAt);

  // Formatted dates
  const formattedExpirationDate = useMemo(
    () => formatDate(expiresAtIso),
    [expiresAtIso]
  );

  const formattedPurchaseDate = useMemo(
    () => formatDate(purchasedAtIso),
    [purchasedAtIso]
  );

  // Days remaining calculation
  const daysRemaining = useMemo(
    () => calculateDaysRemaining(expiresAtIso),
    [expiresAtIso]
  );

  // Status type
  const statusType: SubscriptionStatusType = getSubscriptionStatusType(isPremium);

  // Credits array
  const creditsArray = useCreditsArray(credits, creditLimit, translations);

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



  return config;
};
