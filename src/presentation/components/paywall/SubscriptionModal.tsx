/**
 * Subscription Modal Component
 * Fullscreen subscription flow using BaseModal from design system
 */

import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useAppDesignTokens, BaseModal } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";

import { SubscriptionModalHeader } from "./SubscriptionModalHeader";
import { PaywallFeaturesList } from "./PaywallFeaturesList";
import { SubscriptionPackageList } from "./SubscriptionPackageList";
import { SubscriptionFooter } from "./SubscriptionFooter";
import { useSubscriptionModal } from "../../hooks/useSubscriptionModal";

export interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  packages: PurchasesPackage[];
  onPurchase: (pkg: PurchasesPackage) => Promise<boolean>;
  onRestore: () => Promise<boolean>;
  title: string;
  subtitle?: string;
  features?: Array<{ icon: string; text: string }>;
  isLoading?: boolean;
  purchaseButtonText: string;
  restoreButtonText: string;
  loadingText: string;
  emptyText: string;
  processingText: string;
  privacyUrl?: string;
  termsUrl?: string;
  privacyText?: string;
  termsOfServiceText?: string;
  showRestoreButton?: boolean;
  /** Optional: Map of product identifier to credit amount */
  creditAmounts?: Record<string, number>;
  /** Optional: Manually specify which package should show "Best Value" badge */
  bestValueIdentifier?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = React.memo((props) => {
  const {
    visible,
    onClose,
    packages,
    onPurchase,
    onRestore,
    title,
    subtitle,
    features,
    isLoading = false,
    purchaseButtonText,
    restoreButtonText,
    loadingText,
    emptyText,
    processingText,
    privacyUrl,
    termsUrl,
    privacyText,
    termsOfServiceText,
    showRestoreButton = true,
    creditAmounts,
    bestValueIdentifier,
  } = props;

  const tokens = useAppDesignTokens();

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

  if (__DEV__) {
    console.log("[SubscriptionModal] State:", {
      visible,
      isLoading,
      packagesCount: packages?.length ?? 0,
      selectedPkg: selectedPkg?.identifier ?? null,
      isProcessing,
    });
  }

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <SubscriptionModalHeader
          title={title}
          subtitle={subtitle}
          onClose={onClose}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
            creditAmounts={creditAmounts}
            bestValueIdentifier={bestValueIdentifier}
          />

          {features && features.length > 0 && (
            <View
              style={[
                styles.featuresSection,
                {
                  backgroundColor: tokens.colors.surfaceSecondary,
                  borderColor: tokens.colors.border
                }
              ]}
            >
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
    </BaseModal>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  featuresSection: {
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    borderWidth: 1,
  },
});
