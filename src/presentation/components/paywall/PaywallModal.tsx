/**
 * Paywall Modal Component
 * Single Responsibility: Display paywall with Credits and Subscription tabs
 */

import React, { useEffect } from "react";
import { View, Modal, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { useLocalization } from "@umituz/react-native-localization";
import type { PurchasesPackage } from "react-native-purchases";
import { usePaywall } from "../../hooks/usePaywall";
import { PaywallHeader } from "./PaywallHeader";
import { PaywallTabBar } from "./PaywallTabBar";
import { CreditsTabContent } from "./CreditsTabContent";
import { SubscriptionTabContent } from "./SubscriptionTabContent";
import { ModalLayoutConfig } from "./SubscriptionModalOverlay";
import type { PaywallTabType } from "../../../domain/entities/paywall/PaywallTab";
import type { CreditsPackage } from "../../../domain/entities/paywall/CreditsPackage";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface PaywallModalStyles {
  headerTopPadding?: number;
  contentHorizontalPadding?: number;
  contentBottomPadding?: number;
}

const DEFAULT_LAYOUT: ModalLayoutConfig = {
  maxWidth: 480,
  maxHeightPercent: 0.88,
  widthPercent: 0.92,
  borderRadius: 32,
  backdropOpacity: 0.85,
  horizontalPadding: 20,
};

const DEFAULT_STYLES: PaywallModalStyles = {
  headerTopPadding: 48,
  contentHorizontalPadding: 24,
  contentBottomPadding: 32,
};

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
  layoutConfig?: ModalLayoutConfig;
  styleConfig?: PaywallModalStyles;
}

export const PaywallModal: React.FC<PaywallModalProps> = React.memo(
  (props) => {
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
      layoutConfig,
      styleConfig,
    } = props;

    const tokens = useAppDesignTokens();
    const { t } = useLocalization();
    const config = { ...DEFAULT_LAYOUT, ...layoutConfig };
    const styles_ = { ...DEFAULT_STYLES, ...styleConfig };

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
        console.log("[PaywallModal] Visibility changed:", visible);
      }
    }, [visible]);

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={[styles.overlay, { paddingHorizontal: config.horizontalPadding }]}>
          <TouchableOpacity
            style={[
              styles.backdrop,
              { backgroundColor: `rgba(0, 0, 0, ${config.backdropOpacity ?? 0.85})` }
            ]}
            activeOpacity={1}
            onPress={onClose}
          />
          <View
            style={[
              styles.content,
              {
                backgroundColor: tokens.colors.surface,
                borderRadius: config.borderRadius ?? 32,
                maxHeight: SCREEN_HEIGHT * (config.maxHeightPercent ?? 0.88),
                height: SCREEN_HEIGHT * (config.maxHeightPercent ?? 0.88), // Explicit height to prevent collapse
                width: `${(config.widthPercent ?? 0.92) * 100}%`,
                maxWidth: config.maxWidth ?? 480,
              }
            ]}
          >
            <View style={[styles.contentInner, { paddingTop: styles_.headerTopPadding }]}>
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

              <View style={{ flex: 1 }}>
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
          </View>
        </View>
      </Modal>
    );
  },
);

PaywallModal.displayName = "PaywallModal";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  contentInner: {
    flex: 1,
    paddingBottom: 20,
  },
});
