/**
 * Subscription Tab Content Component
 * Single Responsibility: Display subscription plans list
 */

import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { PaywallFeaturesList } from "./PaywallFeaturesList";
import { SubscriptionPackageList } from "./SubscriptionPackageList";
import { SubscriptionFooter } from "./SubscriptionFooter";

interface SubscriptionTabContentProps {
  packages: PurchasesPackage[];
  selectedPackage: PurchasesPackage | null;
  onSelectPackage: (pkg: PurchasesPackage) => void;
  onPurchase: () => void;
  onRestore?: () => void;
  features?: Array<{ icon: string; text: string }>;
  isLoading?: boolean;
  purchaseButtonText: string;
  processingText: string;
  restoreButtonText: string;
  loadingText: string;
  emptyText: string;
  privacyUrl?: string;
  termsUrl?: string;
  privacyText?: string;
  termsOfServiceText?: string;
}

const isYearlyPackage = (pkg: PurchasesPackage): boolean => {
  const period = pkg.product.subscriptionPeriod;
  return period?.includes("Y") || period?.includes("year") || false;
};

const sortPackages = (packages: PurchasesPackage[]): PurchasesPackage[] => {
  return [...packages].sort((a, b) => {
    const aIsYearly = isYearlyPackage(a);
    const bIsYearly = isYearlyPackage(b);
    if (aIsYearly && !bIsYearly) return -1;
    if (!aIsYearly && bIsYearly) return 1;
    return b.product.price - a.product.price;
  });
};

export const SubscriptionTabContent: React.FC<SubscriptionTabContentProps> =
  React.memo(
    ({
      packages,
      selectedPackage,
      onSelectPackage,
      onPurchase,
      onRestore,
      features = [],
      isLoading = false,
      purchaseButtonText,
      processingText,
      restoreButtonText,
      loadingText,
      emptyText,
      privacyUrl,
      termsUrl,
      privacyText,
      termsOfServiceText,
    }) => {
      const tokens = useAppDesignTokens();

      const sortedPackages = useMemo(() => sortPackages(packages), [packages]);

      return (
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <SubscriptionPackageList
              packages={sortedPackages}
              isLoading={isLoading}
              selectedPkg={selectedPackage}
              onSelect={onSelectPackage}
              loadingText={loadingText}
              emptyText={emptyText}
            />

            {features.length > 0 && (
              <View
                style={[
                  styles.featuresSection,
                  { backgroundColor: tokens.colors.surfaceSecondary },
                ]}
              >
                <PaywallFeaturesList features={features} gap={12} />
              </View>
            )}
          </ScrollView>

          <SubscriptionFooter
            isProcessing={false}
            isLoading={isLoading}
            processingText={processingText}
            purchaseButtonText={purchaseButtonText}
            hasPackages={packages.length > 0}
            selectedPkg={selectedPackage}
            restoreButtonText={restoreButtonText}
            showRestoreButton={!!onRestore}
            onPurchase={onPurchase}
            onRestore={onRestore || (() => { })}
            privacyUrl={privacyUrl}
            termsUrl={termsUrl}
            privacyText={privacyText}
            termsOfServiceText={termsOfServiceText}
          />
        </View>
      );
    }
  );

SubscriptionTabContent.displayName = "SubscriptionTabContent";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  featuresSection: {
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
});
