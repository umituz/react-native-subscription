/**
 * PaywallContainer Component
 * Package-driven paywall with mode-based filtering
 * Mode: credits | subscription | hybrid
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { usePaywallVisibility } from "../../../presentation/hooks/usePaywallVisibility";
import { useSubscriptionPackages } from "../../../revenuecat/presentation/hooks/useSubscriptionPackages";
import { usePurchasePackage } from "../../../revenuecat/presentation/hooks/usePurchasePackage";
import { useRestorePurchase } from "../../../revenuecat/presentation/hooks/useRestorePurchase";
import { SubscriptionManager } from "../../../revenuecat/infrastructure/managers/SubscriptionManager";
import { filterPackagesByMode } from "../../../utils/packageFilter";
import { createCreditAmountsFromPackages } from "../../../utils/creditMapper";
import { PaywallModal } from "./PaywallModal";
import type { PaywallContainerProps } from "./PaywallContainer.types";

declare const __DEV__: boolean;

export const PaywallContainer: React.FC<PaywallContainerProps> = ({
  userId,
  isAnonymous = false,
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
  onAuthRequired,
  visible,
  onClose,
}) => {
  const { showPaywall: globalShowPaywall, closePaywall: globalClosePaywall } = usePaywallVisibility();
  
  const isVisible = visible !== undefined ? visible : globalShowPaywall;
  const handleClose = onClose !== undefined ? onClose : globalClosePaywall;

  const { data: allPackages = [], isLoading, isFetching, status, error } = useSubscriptionPackages(userId ?? undefined);
  const { mutateAsync: purchasePackage } = usePurchasePackage(userId ?? undefined);
  const { mutateAsync: restorePurchases } = useRestorePurchase(userId ?? undefined);
  
  // Store pending package for post-auth purchase
  const [pendingPackage, setPendingPackage] = useState<PurchasesPackage | null>(null);
  const wasAnonymousRef = useRef(isAnonymous);

  const { filteredPackages, computedCreditAmounts } = useMemo(() => {
    const filtered = filterPackagesByMode(allPackages, mode, packageFilterConfig);
    const computed = mode !== "subscription" && !creditAmounts
      ? createCreditAmountsFromPackages(allPackages)
      : creditAmounts;
    
    return { filteredPackages: filtered, computedCreditAmounts: computed };
  }, [allPackages, mode, packageFilterConfig, creditAmounts]);

  useEffect(() => {
    if (__DEV__ && isVisible) {
      console.log("[PaywallContainer] Paywall opened:", {
        userId,
        isAnonymous,
        mode,
        isConfigured: SubscriptionManager.isConfigured(),
        isInitialized: SubscriptionManager.isInitialized(),
        allPackagesCount: allPackages.length,
        filteredPackagesCount: filteredPackages.length,
        computedCreditAmounts,
        isLoading,
        isFetching,
        status,
        error: error?.message ?? null,
      });
    }
  }, [isVisible, userId, isAnonymous, mode, allPackages.length, filteredPackages.length, isLoading, isFetching, status, error]);

  // Auto-purchase when user authenticates after selecting a package
  useEffect(() => {
    const wasAnonymous = wasAnonymousRef.current;
    wasAnonymousRef.current = isAnonymous;

    if (__DEV__) {
      console.log("[PaywallContainer] Auth state check:", {
        wasAnonymous,
        isAnonymous,
        hasPendingPackage: !!pendingPackage,
        userId,
        pendingPkgId: pendingPackage?.identifier,
      });
    }

    // If user was anonymous, now authenticated, and has pending package
    if (wasAnonymous && !isAnonymous && pendingPackage && userId) {
      if (__DEV__) {
        console.log("[PaywallContainer] User authenticated, auto-purchasing pending package:", pendingPackage.identifier);
      }

      // Execute the purchase
      (async () => {
        try {
          const result = await purchasePackage(pendingPackage);
          if (result.success) {
            if (__DEV__) {
              console.log("[PaywallContainer] Auto-purchase successful");
            }
            onPurchaseSuccess?.();
            handleClose();
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (__DEV__) {
            console.error("[PaywallContainer] Auto-purchase failed:", message);
          }
          onPurchaseError?.(message);
        } finally {
          setPendingPackage(null);
        }
      })();
    }
  }, [isAnonymous, userId, pendingPackage, purchasePackage, onPurchaseSuccess, onPurchaseError, handleClose]);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage) => {
      // Auth gating: require authentication for anonymous users
      if (isAnonymous) {
        if (__DEV__) {
          console.log("[PaywallContainer] Anonymous user, storing package and requiring auth:", pkg.identifier);
          console.log("[PaywallContainer] onAuthRequired is defined:", !!onAuthRequired);
        }
        // Store package for auto-purchase after auth
        setPendingPackage(pkg);
        // Don't close paywall - keep it open so user can purchase after auth
        onAuthRequired?.();
        return;
      }

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
          handleClose();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (__DEV__) {
          console.error("[PaywallContainer] Purchase failed:", message);
        }
        onPurchaseError?.(message);
      }
    },
    [isAnonymous, purchasePackage, handleClose, onPurchaseSuccess, onPurchaseError, onAuthRequired, setPendingPackage]
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
        handleClose();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (__DEV__) {
        console.error("[PaywallContainer] Restore failed:", message);
      }
      onPurchaseError?.(message);
    }
  }, [restorePurchases, handleClose, onPurchaseSuccess, onPurchaseError]);

  if (!isVisible) {
    return null;
  }

  return (
    <PaywallModal
      visible={isVisible}
      onClose={handleClose}
      translations={translations}
      packages={filteredPackages}
      isLoading={isLoading}
      legalUrls={legalUrls}
      features={features ? [...features] : undefined}
      heroImage={heroImage}
      bestValueIdentifier={bestValueIdentifier}
      creditsLabel={creditsLabel}
      creditAmounts={computedCreditAmounts}
      onPurchase={handlePurchase}
      onRestore={handleRestore}
    />
  );
};

PaywallContainer.displayName = "PaywallContainer";
