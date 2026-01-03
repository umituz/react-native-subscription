/**
 * PaywallContainer Component
 * Package-driven paywall with mode-based filtering
 * Mode: credits | subscription | hybrid
 */

import React, { useCallback, useEffect, useMemo } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePaywallVisibility } from "../../../presentation/hooks/usePaywallVisibility";
import { useSubscriptionPackages } from "../../../revenuecat/presentation/hooks/useSubscriptionPackages";
import { usePurchasePackage } from "../../../revenuecat/presentation/hooks/usePurchasePackage";
import { useRestorePurchase } from "../../../revenuecat/presentation/hooks/useRestorePurchase";
import { SubscriptionManager } from "../../../revenuecat/infrastructure/managers/SubscriptionManager";
import { filterPackagesByMode } from "../../../utils/packageFilter";
import { PaywallModal } from "./PaywallModal";
import type { PaywallContainerProps } from "./PaywallContainer.types";

declare const __DEV__: boolean;

export const PaywallContainer: React.FC<PaywallContainerProps> = ({
  userId,
  translations,
  mode = "subscription",
  legalUrls,
  features,
  heroImage,
  bestValueIdentifier,
  creditsLabel,
  creditAmounts,
  packageFilterConfig,
  onPurchaseSuccess,
  onPurchaseError,
}) => {
  const { showPaywall, closePaywall } = usePaywallVisibility();
  const { data: allPackages = [], isLoading, isFetching, status, error } = useSubscriptionPackages(userId ?? undefined);
  const { mutateAsync: purchasePackage } = usePurchasePackage(userId ?? undefined);
  const { mutateAsync: restorePurchases } = useRestorePurchase(userId ?? undefined);

  const filteredPackages = useMemo(() => {
    return filterPackagesByMode(allPackages, mode, packageFilterConfig);
  }, [allPackages, mode, packageFilterConfig]);

  useEffect(() => {
    if (__DEV__ && showPaywall) {
      console.log("[PaywallContainer] Paywall opened:", {
        userId,
        mode,
        isConfigured: SubscriptionManager.isConfigured(),
        isInitialized: SubscriptionManager.isInitialized(),
        allPackagesCount: allPackages.length,
        filteredPackagesCount: filteredPackages.length,
        isLoading,
        isFetching,
        status,
        error: error?.message ?? null,
      });
    }
  }, [showPaywall, userId, mode, allPackages.length, filteredPackages.length, isLoading, isFetching, status, error]);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage) => {
      try {
        if (__DEV__) {
          console.log("[PaywallContainer] Purchase started:", pkg.identifier);
        }
        const result = await purchasePackage(pkg);
        if (result.success) {
          if (__DEV__) {
            console.log("[PaywallContainer] Purchase successful");
          }
          onPurchaseSuccess?.();
          closePaywall();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (__DEV__) {
          console.error("[PaywallContainer] Purchase failed:", message);
        }
        onPurchaseError?.(message);
      }
    },
    [purchasePackage, closePaywall, onPurchaseSuccess, onPurchaseError]
  );

  const handleRestore = useCallback(async () => {
    try {
      if (__DEV__) {
        console.log("[PaywallContainer] Restore started");
      }
      const result = await restorePurchases();
      if (result.success) {
        if (__DEV__) {
          console.log("[PaywallContainer] Restore successful");
        }
        onPurchaseSuccess?.();
        closePaywall();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (__DEV__) {
        console.error("[PaywallContainer] Restore failed:", message);
      }
      onPurchaseError?.(message);
    }
  }, [restorePurchases, closePaywall, onPurchaseSuccess, onPurchaseError]);

  if (!showPaywall) {
    return null;
  }

  return (
    <PaywallModal
      visible={showPaywall}
      onClose={closePaywall}
      translations={translations}
      packages={filteredPackages}
      isLoading={isLoading}
      legalUrls={legalUrls}
      features={features ? [...features] : undefined}
      heroImage={heroImage}
      bestValueIdentifier={bestValueIdentifier}
      creditsLabel={creditsLabel}
      creditAmounts={creditAmounts}
      onPurchase={handlePurchase}
      onRestore={handleRestore}
    />
  );
};

PaywallContainer.displayName = "PaywallContainer";
