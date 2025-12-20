/**
 * Subscription Modal Component
 * Orchestrates subscription flow using decomposed components
 */

import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";

import { SubscriptionModalHeader } from "./SubscriptionModalHeader";
import {
  SubscriptionModalOverlay,
  SubscriptionModalVariant,
  ModalLayoutConfig,
} from "./SubscriptionModalOverlay";
import { PaywallFeaturesList } from "./PaywallFeaturesList";
import { SubscriptionPackageList } from "./SubscriptionPackageList";
import { SubscriptionFooter } from "./SubscriptionFooter";
import { useSubscriptionModal } from "../../hooks/useSubscriptionModal";

export interface SubscriptionModalStyles {
  headerTopPadding?: number;
  contentHorizontalPadding?: number;
  contentBottomPadding?: number;
}

export interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  packages: PurchasesPackage[];
  onPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  onRestore: () => Promise<boolean>;
  title?: string;
  subtitle?: string;
  features?: Array<{ icon: string; text: string }>;
  isLoading?: boolean;
  purchaseButtonText?: string;
  restoreButtonText?: string;
  loadingText?: string;
  emptyText?: string;
  processingText?: string;
  privacyUrl?: string;
  termsUrl?: string;
  privacyText?: string;
  termsOfServiceText?: string;
  showRestoreButton?: boolean;
  variant?: SubscriptionModalVariant;
  layoutConfig?: ModalLayoutConfig;
  styleConfig?: SubscriptionModalStyles;
}

const DEFAULT_STYLES: SubscriptionModalStyles = {
  headerTopPadding: 48,
  contentHorizontalPadding: 24,
  contentBottomPadding: 32,
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = React.memo((props) => {
  const {
    visible,
    onClose,
    packages,
    onPurchase,
    onRestore,
    title = "Go Premium",
    subtitle,
    features = [],
    isLoading = false,
    purchaseButtonText = "Subscribe",
    restoreButtonText = "Restore Purchases",
    loadingText = "Loading...",
    emptyText = "No packages",
    processingText = "Processing...",
    privacyUrl,
    termsUrl,
    privacyText,
    termsOfServiceText,
    showRestoreButton = true,
    variant = "bottom-sheet",
    layoutConfig,
    styleConfig,
  } = props;

  const tokens = useAppDesignTokens();
  const styles_ = { ...DEFAULT_STYLES, ...styleConfig };

  const {
    selectedPkg,
    setSelectedPkg,
    isProcessing,
    handlePurchase,
    handleRestore,
  } = useSubscriptionModal({
    onPurchase,
    onRestore,
    onClose,
  });


  if (!visible) return null;

  const isFullscreen = variant === "fullscreen";
  const containerPaddingTop = isFullscreen ? styles_.headerTopPadding : 0;

  return (
    <SubscriptionModalOverlay
      visible={visible}
      onClose={onClose}
      variant={variant}
      layoutConfig={layoutConfig}
    >
      <View style={[styles.container, { paddingTop: containerPaddingTop }]}>
        <SubscriptionModalHeader
          title={title}
          subtitle={subtitle}
          onClose={onClose}
          variant={variant}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: styles_.contentHorizontalPadding,
              paddingBottom: styles_.contentBottomPadding,
            }
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <SubscriptionPackageList
            packages={packages}
            isLoading={isLoading}
            selectedPkg={selectedPkg}
            onSelect={setSelectedPkg}
            loadingText={loadingText}
            emptyText={emptyText}
          />

          {features.length > 0 && (
            <View style={[styles.featuresSection, { backgroundColor: tokens.colors.surfaceSecondary }]}>
              <PaywallFeaturesList features={features} gap={12} />
            </View>
          )}
        </ScrollView>

        <SubscriptionFooter
          isProcessing={isProcessing}
          isLoading={isLoading}
          processingText={processingText}
          purchaseButtonText={purchaseButtonText}
          hasPackages={packages.length > 0}
          selectedPkg={selectedPkg}
          restoreButtonText={restoreButtonText}
          showRestoreButton={showRestoreButton}
          privacyUrl={privacyUrl}
          termsUrl={termsUrl}
          privacyText={privacyText}
          termsOfServiceText={termsOfServiceText}
          onPurchase={handlePurchase}
          onRestore={handleRestore}
        />
      </View>
    </SubscriptionModalOverlay>
  );
});

SubscriptionModal.displayName = "SubscriptionModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  featuresSection: {
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
});
