import React, { useMemo } from "react";
import { usePaywallVisibility } from "../../subscription/presentation/usePaywallVisibility";
import { useSubscriptionPackages } from "../../subscription/infrastructure/hooks/useSubscriptionPackages";
import { useRevenueCatTrialEligibility } from "../../subscription/infrastructure/hooks/useRevenueCatTrialEligibility";
import { createCreditAmountsFromPackages } from "../../../utils/creditMapper";
import { PaywallModal } from "./PaywallModal";
import { usePaywallActions } from "../hooks/usePaywallActions";
import { useAuthAwarePurchase } from "../../subscription/presentation/useAuthAwarePurchase";
import { useTrialEligibilityCheck } from "../hooks/useTrialEligibilityCheck";
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

  const trialEligibility = useTrialEligibilityCheck({
    packages,
    isLoading,
    eligibilityMap,
    checkEligibility,
    trialConfig,
  });

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
