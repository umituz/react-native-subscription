import React, { useMemo } from "react";
import { usePaywallVisibility } from "../../subscription/presentation/usePaywallVisibility";
import { useSubscriptionPackages } from "../../subscription/infrastructure/hooks/useSubscriptionPackages";
import { createCreditAmountsFromPackages } from "../../../utils/creditMapper";
import { PaywallModal } from "./PaywallModal";
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
  } = props;

  const { showPaywall, closePaywall, currentSource } = usePaywallVisibility();
  const isVisible = visible ?? showPaywall;
  const handleClose = onClose ?? closePaywall;

  const purchaseSource = source ?? currentSource ?? "settings";

  const { data: packages = [] } = useSubscriptionPackages();

  const { handlePurchase: performPurchase, handleRestore: performRestore } = useAuthAwarePurchase({
    source: purchaseSource
  });

  const creditAmounts = useMemo(() => {
    if (providedCreditAmounts) return providedCreditAmounts;
    if (!packageAllocations || packages.length === 0) return undefined;
    return createCreditAmountsFromPackages(packages, packageAllocations);
  }, [providedCreditAmounts, packageAllocations, packages]);

  // When using credit system, only show packages that have a credit allocation.
  const displayPackages = useMemo(() => {
    if (!creditAmounts || Object.keys(creditAmounts).length === 0) return packages;
    return packages.filter((pkg) => creditAmounts[pkg.product.identifier] != null);
  }, [packages, creditAmounts]);

  if (!isVisible) return null;

  return (
    <PaywallModal
      visible={isVisible}
      onClose={handleClose}
      translations={translations}
      packages={displayPackages}
      legalUrls={legalUrls}
      features={features ? [...features] : undefined}
      heroImage={heroImage}
      bestValueIdentifier={bestValueIdentifier}
      creditAmounts={creditAmounts}
      creditsLabel={creditsLabel}
      onPurchase={performPurchase}
      onRestore={performRestore}
      onPurchaseSuccess={onPurchaseSuccess}
      onPurchaseError={onPurchaseError}
      onAuthRequired={onAuthRequired}
      source={purchaseSource}
    />
  );
};

PaywallContainer.displayName = "PaywallContainer";
