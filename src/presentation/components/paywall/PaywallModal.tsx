/**
 * Paywall Modal Component
 * Displays paywall with Credits and Subscription tabs
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { BaseModal } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { usePaywall } from "../../hooks/usePaywall";
import { PaywallHeader } from "./PaywallHeader";
import { PaywallTabBar } from "./PaywallTabBar";
import { CreditsTabContent } from "./CreditsTabContent";
import { SubscriptionTabContent } from "./SubscriptionTabContent";
import type { PaywallTabType } from "../../../domain/entities/paywall/PaywallTab";
import type { CreditsPackage } from "../../../domain/entities/paywall/CreditsPackage";

export interface PaywallModalStyles {
  headerTopPadding?: number;
  contentHorizontalPadding?: number;
  contentBottomPadding?: number;
}

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: PaywallTabType;
  creditsPackages: CreditsPackage[];
  subscriptionPackages: PurchasesPackage[];
  currentCredits: number;
  requiredCredits?: number;
  onCreditsPurchase: (packageId: string) => Promise<void>;
  onSubscriptionPurchase: (pkg: PurchasesPackage) => Promise<void>;
  onRestore?: () => Promise<void>;
  subscriptionFeatures?: Array<{ icon: string; text: string }>;
  isLoading?: boolean;
  title: string;
  subtitle: string;
  creditsTabLabel: string;
  subscriptionTabLabel: string;
  purchaseButtonText: string;
  subscribeButtonText: string;
  restoreButtonText: string;
  loadingText: string;
  emptyText: string;
  processingText: string;
  privacyUrl?: string;
  termsUrl?: string;
  privacyText?: string;
  termsOfServiceText?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = React.memo((props) => {
  const {
    visible,
    onClose,
    initialTab = "credits",
    creditsPackages,
    subscriptionPackages,
    currentCredits,
    requiredCredits,
    onCreditsPurchase,
    onSubscriptionPurchase,
    onRestore,
    subscriptionFeatures = [],
    isLoading = false,
    title,
    subtitle,
    creditsTabLabel,
    subscriptionTabLabel,
    purchaseButtonText,
    subscribeButtonText,
    privacyUrl,
    termsUrl,
    privacyText,
    termsOfServiceText,
    restoreButtonText,
    loadingText,
    emptyText,
    processingText,
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
    onCreditsPurchase,
    onSubscriptionPurchase,
  });

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <PaywallHeader
          title={title}
          subtitle={subtitle}
          onClose={onClose}
        />

        <PaywallTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          creditsLabel={creditsTabLabel}
          subscriptionLabel={subscriptionTabLabel}
        />

        <View style={styles.tabContent}>
          {activeTab === "credits" ? (
            <CreditsTabContent
              packages={creditsPackages}
              selectedPackageId={selectedCreditsPackageId}
              onSelectPackage={handleCreditsPackageSelect}
              onPurchase={handleCreditsPurchase}
              currentCredits={currentCredits}
              requiredCredits={requiredCredits}
              isLoading={isLoading}
              purchaseButtonText={purchaseButtonText}
            />
          ) : (
            <SubscriptionTabContent
              packages={subscriptionPackages}
              selectedPackage={selectedSubscriptionPkg}
              onSelectPackage={handleSubscriptionPackageSelect}
              onPurchase={handleSubscriptionPurchase}
              features={subscriptionFeatures}
              isLoading={isLoading}
              purchaseButtonText={subscribeButtonText}
              processingText={processingText}
              restoreButtonText={restoreButtonText}
              loadingText={loadingText}
              emptyText={emptyText}
              onRestore={onRestore}
              privacyUrl={privacyUrl}
              termsUrl={termsUrl}
              privacyText={privacyText}
              termsOfServiceText={termsOfServiceText}
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
