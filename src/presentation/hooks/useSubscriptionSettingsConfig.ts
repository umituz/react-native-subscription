/**
 * useSubscriptionSettingsConfig Hook
 * Returns ready-to-use config for settings screens
 * Package-driven: all logic handled internally
 */

import { useMemo, useCallback } from "react";
import { useCredits } from "./useCredits";
import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { useCustomerInfo } from "../../revenuecat/presentation/hooks/useCustomerInfo";
import { usePaywallVisibility } from "./usePaywallVisibility";
import { calculateDaysRemaining } from "../../domain/entities/SubscriptionStatus";
import { SubscriptionManager } from "../../revenuecat/infrastructure/managers/SubscriptionManager";
import { formatDate, convertPurchasedAt } from "../utils/subscriptionDateUtils";
import { useCreditsArray, getSubscriptionStatusType } from "./useSubscriptionSettingsConfig.utils";
import { getCreditsConfig } from "../../infrastructure/repositories/CreditsRepositoryProvider";
import { detectPackageType } from "../../utils/packageTypeDetector";
import { getCreditAllocation } from "../../utils/creditMapper";
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

  const handleOpenPaywall = useCallback(() => {
    openPaywall("settings");
  }, [openPaywall]);

  // RevenueCat entitlement info - dynamically using configured entitlementId
  const entitlementId = SubscriptionManager.getEntitlementId() || "premium";
  const premiumEntitlement = customerInfo?.entitlements.active[entitlementId];

  // Premium status: use customerInfo directly as it updates in real-time via listener
  // This is the source of truth, subscriptionActive is just a backup
  const isPremium = !!premiumEntitlement || subscriptionActive;

  const dynamicCreditLimit = useMemo(() => {
    const config = getCreditsConfig();

    // 1. ÖNCE FIRESTORE'DAN OKU (Single Source of Truth)
    if (credits?.creditLimit) {
      return credits.creditLimit;
    }

    // 2. FALLBACK: RevenueCat'ten detect et
    if (premiumEntitlement?.productIdentifier) {
      const packageType = detectPackageType(premiumEntitlement.productIdentifier);
      const allocation = getCreditAllocation(packageType, config.packageAllocations);
      if (allocation !== null) return allocation;
    }

    // 3. LAST RESORT: Credit miktarına bakarak tahmin et
    if (credits?.credits && config.packageAllocations) {
      const currentCredits = credits.credits;
      const allocations = Object.values(config.packageAllocations).map(a => a.credits);
      const closest = allocations.find(a => a >= currentCredits) || Math.max(...allocations);
      return closest;
    }

    // 4. FINAL FALLBACK: Config'den al
    return creditLimit ?? config.creditLimit;
  }, [credits?.creditLimit, credits?.credits, premiumEntitlement?.productIdentifier, creditLimit]);

  // Get expiration date directly from RevenueCat (source of truth)
  const entitlementExpirationDate = premiumEntitlement?.expirationDate ?? null;

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

  const creditsArray = useCreditsArray(credits, dynamicCreditLimit, translations);

  // Centralized display flags - single source of truth for UI visibility
  const hasCredits = creditsArray.length > 0;
  const display = useMemo(() => ({
    showHeader: isPremium || hasCredits,
    showCredits: hasCredits,
    showUpgradePrompt: !isPremium && !hasCredits && !!upgradePrompt,
    showExpirationDate: isPremium && !!expiresAtIso,
  }), [isPremium, hasCredits, upgradePrompt, expiresAtIso]);

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
    }),
    [
      translations,
      isPremium,
      statusType,
      display,
      formattedExpirationDate,
      formattedPurchaseDate,
      expiresAtIso,
      daysRemaining,
      willRenew,
      creditsArray,
      handleOpenPaywall,
      upgradePrompt,
    ]
  );



  return config;
};
