/**
 * PaywallContainer Component
 * Uses centralized pending purchase state - no local auth handling
 * Apple Guideline 3.1.2 compliant trial display
 */

import React, { useMemo, useEffect } from "react";
import { usePaywallVisibility } from "../../subscription/presentation/usePaywallVisibility";
import { useSubscriptionPackages } from "../../subscription/infrastructure/hooks/useSubscriptionPackages";
import { useRevenueCatTrialEligibility } from "../../subscription/infrastructure/hooks/useRevenueCatTrialEligibility";
import { createCreditAmountsFromPackages } from "../../../utils/creditMapper";
import { PaywallModal, type TrialEligibilityInfo } from "./PaywallModal";
import { usePaywallActions } from "../hooks/usePaywallActions";
import { useAuthAwarePurchase } from "../../subscription/presentation/useAuthAwarePurchase";
import type { PaywallContainerProps } from "./PaywallContainer.types";

export const PaywallContainer: React.FC<PaywallContainerProps> = (props) => {
  const {
    translations,
    legalUrls,
    features,
    heroImage,
    bestValueIdentifier,
    creditAmounts: providedCreditAmounts,
    creditsLabel,
    packageAllocations,
    source,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    visible,
    onClose,
    trialConfig,
  } = props;

  const { showPaywall, closePaywall, currentSource } = usePaywallVisibility();
  const isVisible = visible ?? showPaywall;
  const handleClose = onClose ?? closePaywall;

  const purchaseSource = source ?? currentSource ?? "settings";

  const { data: packages = [], isLoading } = useSubscriptionPackages();
  const { eligibilityMap, checkEligibility } = useRevenueCatTrialEligibility();
  
  const { handlePurchase: performPurchase, handleRestore: performRestore } = useAuthAwarePurchase({ 
    source: purchaseSource 
  });

  const { handlePurchase, handleRestore } = usePaywallActions({
    packages,
    onPurchase: performPurchase,
    onRestore: performRestore,
    source: purchaseSource,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    onClose: handleClose,
  });

  // Check trial eligibility only if trialConfig is enabled
  // Use ref to track if we've already checked for these packages to avoid redundant calls
  const checkedPackagesRef = React.useRef<string[]>([]);

  useEffect(() => {
    if (!trialConfig?.enabled) return;
    if (packages.length === 0) return;
    if (isLoading) return; // Wait for packages to fully load

    // Get current package identifiers
    const currentPackageIds = packages.map((pkg) => pkg.product.identifier);
    const sortedIds = [...currentPackageIds].sort().join(",");

    // Skip if we've already checked these exact packages
    if (checkedPackagesRef.current.join(",") === sortedIds) {
      return;
    }

    // Update ref
    checkedPackagesRef.current = currentPackageIds;

    // Get all actual product IDs from packages
    const allProductIds = packages.map((pkg) => pkg.product.identifier);

    // If eligibleProductIds are provided, filter to matching packages (partial match)
    // e.g., "yearly" matches "futureus.yearly"
    let productIdsToCheck: string[];
    if (trialConfig.eligibleProductIds?.length) {
      productIdsToCheck = allProductIds.filter((actualId) =>
        trialConfig.eligibleProductIds?.some((configId) =>
          actualId.toLowerCase().includes(configId.toLowerCase())
        )
      );
    } else {
      productIdsToCheck = allProductIds;
    }

    if (productIdsToCheck.length > 0) {
      checkEligibility(productIdsToCheck);
    }
  }, [packages, isLoading, checkEligibility, trialConfig?.enabled, trialConfig?.eligibleProductIds]);

  // Convert eligibility map to format expected by PaywallModal
  // Only process if trial is enabled
  const trialEligibility = useMemo((): Record<string, TrialEligibilityInfo> => {
    if (!trialConfig?.enabled) return {};

    const result: Record<string, TrialEligibilityInfo> = {};
    for (const [productId, info] of Object.entries(eligibilityMap)) {
      result[productId] = {
        eligible: info.eligible,
        durationDays: trialConfig.durationDays ?? info.trialDurationDays ?? 7,
      };
    }
    return result;
  }, [eligibilityMap, trialConfig?.enabled, trialConfig?.durationDays]);

  // Compute credit amounts from packageAllocations if not provided directly
  const creditAmounts = useMemo(() => {
    if (providedCreditAmounts) return providedCreditAmounts;
    if (!packageAllocations || packages.length === 0) return undefined;
    return createCreditAmountsFromPackages(packages, packageAllocations);
  }, [providedCreditAmounts, packageAllocations, packages]);

  if (!isVisible) return null;

  return (
    <PaywallModal
      visible={isVisible}
      onClose={handleClose}
      translations={translations}
      packages={packages}
      isLoading={isLoading}
      legalUrls={legalUrls}
      features={features ? [...features] : undefined}
      heroImage={heroImage}
      bestValueIdentifier={bestValueIdentifier}
      creditAmounts={creditAmounts}
      creditsLabel={creditsLabel}
      onPurchase={handlePurchase}
      onRestore={handleRestore}
      trialEligibility={trialEligibility}
      trialSubtitleText={trialConfig?.enabled ? trialConfig.trialText : undefined}
    />
  );
};

PaywallContainer.displayName = "PaywallContainer";
