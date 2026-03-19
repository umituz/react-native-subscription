/**
 * Paywall State Component
 *
 * Displays paywall screen for purchase/restore.
 */

import React, { useState } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import type { UserCredits } from "../../../../credits/core/Credits";
import { PaywallScreen } from "../../../../paywall/components/PaywallScreen";
import type { ManagedSubscriptionFlowProps } from "../ManagedSubscriptionFlow.types";

interface PaywallStateProps {
  config: ManagedSubscriptionFlowProps["paywall"];
  packages: PurchasesPackage[];
  isPremium: boolean;
  credits: UserCredits | null;
  isSyncing: boolean;
  onPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  onRestore: () => Promise<boolean>;
  onClose: (purchased: boolean) => void;
}

export const PaywallState: React.FC<PaywallStateProps> = ({
  config,
  packages,
  isPremium,
  credits,
  isSyncing,
  onPurchase,
  onRestore,
  onClose,
}) => {
  const [purchaseSuccessful, setPurchaseSuccessful] = useState(false);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    const result = await onPurchase(pkg);
    if (result) {
      setPurchaseSuccessful(true);
    }
    return result;
  };

  const handleClose = () => {
    onClose(purchaseSuccessful);
  };

  return (
    <PaywallScreen
      translations={config.translations}
      legalUrls={config.legalUrls}
      features={config.features}
      bestValueIdentifier={config.bestValueIdentifier}
      creditsLabel={config.creditsLabel}
      heroImage={config.heroImage}
      source="onboarding"
      packages={packages}
      isPremium={isPremium}
      credits={credits}
      isSyncing={isSyncing}
      onPurchase={handlePurchase}
      onRestore={onRestore}
      onClose={handleClose}
    />
  );
};
