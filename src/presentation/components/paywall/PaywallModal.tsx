/**
 * Paywall Modal Component
 * Mode-based paywall: subscription, credits, or hybrid
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { BaseModal } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { usePaywall } from "../../hooks/usePaywall";
import { PaywallHeroHeader } from "./PaywallHeroHeader";
import { PaywallTabBar } from "./PaywallTabBar";
import { CreditsTabContent } from "./CreditsTabContent";
import { SubscriptionTabContent } from "./SubscriptionTabContent";
import type { PaywallTabType } from "../../../domain/entities/paywall/PaywallTab";
import type { PaywallMode } from "../../../domain/entities/paywall/PaywallMode";
import type { CreditsPackage } from "../../../domain/entities/paywall/CreditsPackage";

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  mode: PaywallMode;
  initialTab?: PaywallTabType;
  creditsPackages?: CreditsPackage[];
  subscriptionPackages?: PurchasesPackage[];
  currentCredits?: number;
  requiredCredits?: number;
  onCreditsPurchase?: (packageId: string) => Promise<void>;
  onSubscriptionPurchase?: (pkg: PurchasesPackage) => Promise<void>;
  onRestore?: () => Promise<void>;
  subscriptionFeatures?: Array<{ icon: string; text: string }>;
  isLoading?: boolean;
  translations: PaywallTranslations;
  legalUrls?: PaywallLegalUrls;
}

export interface PaywallTranslations {
  title: string;
  subtitle: string;
  creditsTabLabel?: string;
  subscriptionTabLabel?: string;
  purchaseButtonText: string;
  subscribeButtonText?: string;
  restoreButtonText: string;
  loadingText: string;
  emptyText: string;
  processingText: string;
  privacyText?: string;
  termsOfServiceText?: string;
}

export interface PaywallLegalUrls {
  privacyUrl?: string;
  termsUrl?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = React.memo((props) => {
  const {
    visible,
    onClose,
    mode,
    initialTab = mode === "credits" ? "credits" : "subscription",
    creditsPackages = [],
    subscriptionPackages = [],
    currentCredits = 0,
    requiredCredits,
    onCreditsPurchase,
    onSubscriptionPurchase,
    onRestore,
    subscriptionFeatures = [],
    isLoading = false,
    translations,
    legalUrls = {},
  } = props;

  const {
    activeTab,
    selectedCreditsPackageId,
    selectedSubscriptionPkg,
    handleTabChange,
    handleCreditsPackageSelect,
    handleSubscriptionPackageSelect,
    handleCreditsPurchase,
    handleSubscriptionPurchase,
  } = usePaywall({
    initialTab,
    onCreditsPurchase: onCreditsPurchase ?? (() => Promise.resolve()),
    onSubscriptionPurchase: onSubscriptionPurchase ?? (() => Promise.resolve()),
  });

  const showTabs = mode === "hybrid";
  const showCredits = mode === "credits" || (mode === "hybrid" && activeTab === "credits");
  const showSubscription = mode === "subscription" || (mode === "hybrid" && activeTab === "subscription");

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <PaywallHeroHeader
          title={translations.title}
          subtitle={translations.subtitle}
          onClose={onClose}
        />

        {showTabs && (
          <PaywallTabBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            creditsLabel={translations.creditsTabLabel}
            subscriptionLabel={translations.subscriptionTabLabel}
          />
        )}

        <View style={styles.tabContent}>
          {showCredits && (
            <CreditsTabContent
              packages={creditsPackages}
              selectedPackageId={selectedCreditsPackageId}
              onSelectPackage={handleCreditsPackageSelect}
              onPurchase={handleCreditsPurchase}
              currentCredits={currentCredits}
              requiredCredits={requiredCredits}
              isLoading={isLoading}
              purchaseButtonText={translations.purchaseButtonText}
            />
          )}
          {showSubscription && (
            <SubscriptionTabContent
              packages={subscriptionPackages}
              selectedPackage={selectedSubscriptionPkg}
              onSelectPackage={handleSubscriptionPackageSelect}
              onPurchase={handleSubscriptionPurchase}
              features={subscriptionFeatures}
              isLoading={isLoading}
              purchaseButtonText={translations.subscribeButtonText ?? translations.purchaseButtonText}
              processingText={translations.processingText}
              restoreButtonText={translations.restoreButtonText}
              loadingText={translations.loadingText}
              emptyText={translations.emptyText}
              onRestore={onRestore}
              privacyUrl={legalUrls.privacyUrl}
              termsUrl={legalUrls.termsUrl}
              privacyText={translations.privacyText}
              termsOfServiceText={translations.termsOfServiceText}
            />
          )}
        </View>
      </View>
    </BaseModal>
  );
});

PaywallModal.displayName = "PaywallModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  tabContent: {
    flex: 1,
  },
});
