/**
 * Paywall Modal Component
 * Displays paywall with Credits and Subscription tabs
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, BaseModal, useResponsive } from "@umituz/react-native-design-system";
import { useLocalization } from "@umituz/react-native-localization";
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
  title?: string;
  subtitle?: string;
  privacyUrl?: string;
  termsUrl?: string;
  privacyText?: string;
  termsOfServiceText?: string;
  restoreButtonText?: string;
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
    privacyUrl,
    termsUrl,
    privacyText,
    termsOfServiceText,
    restoreButtonText,
  } = props;

  const tokens = useAppDesignTokens();
  const { t } = useLocalization();
  const { modalLayout } = useResponsive();

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

  const displayTitle = title || t("paywall.title");
  const displaySubtitle = subtitle || t("paywall.subtitle");

  useEffect(() => {
    if (__DEV__) {
      console.log("[PaywallModal] State:", {
        visible,
        activeTab,
        modalLayout,
        creditsPackagesCount: creditsPackages?.length ?? 0,
        subscriptionPackagesCount: subscriptionPackages?.length ?? 0,
      });
    }
  }, [visible, activeTab, modalLayout, creditsPackages?.length, subscriptionPackages?.length]);

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <PaywallHeader
          title={displayTitle}
          subtitle={displaySubtitle}
          onClose={onClose}
          variant="fullscreen"
        />

        <PaywallTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          creditsLabel={t("paywall.tabs.credits")}
          subscriptionLabel={t("paywall.tabs.subscription")}
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
              purchaseButtonText={t("paywall.purchase")}
            />
          ) : (
            <SubscriptionTabContent
              packages={subscriptionPackages}
              selectedPackage={selectedSubscriptionPkg}
              onSelectPackage={handleSubscriptionPackageSelect}
              onPurchase={handleSubscriptionPurchase}
              features={subscriptionFeatures}
              isLoading={isLoading}
              purchaseButtonText={t("paywall.subscribe")}
              onRestore={onRestore}
              privacyUrl={privacyUrl}
              termsUrl={termsUrl}
              privacyText={privacyText}
              termsOfServiceText={termsOfServiceText}
              restoreButtonText={restoreButtonText}
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
