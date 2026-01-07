/**
 * PaywallContainer Component
 */

import React, { useEffect, useMemo, useRef } from "react";
import { usePaywallVisibility } from "../../../presentation/hooks/usePaywallVisibility";
import { useSubscriptionPackages } from "../../../revenuecat/presentation/hooks/useSubscriptionPackages";
import { filterPackagesByMode } from "../../../utils/packageFilter";
import { createCreditAmountsFromPackages } from "../../../utils/creditMapper";
import { PaywallModal } from "./PaywallModal";
import { usePaywallActions } from "../hooks/usePaywallActions";
import type { PaywallContainerProps } from "./PaywallContainer.types";



export const PaywallContainer: React.FC<PaywallContainerProps> = (props) => {
  const { userId, isAnonymous = false, translations, mode = "subscription", legalUrls, features, heroImage, bestValueIdentifier, creditsLabel, creditAmounts, packageFilterConfig, onPurchaseSuccess, onPurchaseError, onAuthRequired, visible, onClose } = props;
  
  const { showPaywall, closePaywall } = usePaywallVisibility();
  const isVisible = visible ?? showPaywall;
  const handleClose = onClose ?? closePaywall;

  const { data: allPackages = [], isLoading } = useSubscriptionPackages(userId ?? undefined);
  const { handlePurchase, handleRestore, pendingPackage, setPendingPackage, purchasePackage } = usePaywallActions({
    userId: userId ?? undefined, isAnonymous, onPurchaseSuccess, onPurchaseError, onAuthRequired, onClose: handleClose
  });

  const wasAnonymousRef = useRef(isAnonymous);
  const { filteredPackages, computedCreditAmounts } = useMemo(() => ({
    filteredPackages: filterPackagesByMode(allPackages, mode, packageFilterConfig),
    computedCreditAmounts: mode !== "subscription" && !creditAmounts ? createCreditAmountsFromPackages(allPackages) : creditAmounts
  }), [allPackages, mode, packageFilterConfig, creditAmounts]);

  // Auto-purchase after auth
  useEffect(() => {
    const wasAuth = wasAnonymousRef.current && !isAnonymous;
    wasAnonymousRef.current = isAnonymous;

    if (wasAuth && pendingPackage && userId) {
      (async () => {
        try {
          const res = await purchasePackage(pendingPackage);
          if (res.success) {
            onPurchaseSuccess?.();
            handleClose();
          }
        } catch (err: any) {
          onPurchaseError?.(err.message || String(err));
        } finally { setPendingPackage(null); }
      })();
    }
  }, [isAnonymous, userId, pendingPackage, purchasePackage, onPurchaseSuccess, onPurchaseError, handleClose, setPendingPackage]);

  if (!isVisible) return null;

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
