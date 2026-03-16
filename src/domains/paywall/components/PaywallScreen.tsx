/**
 * Paywall Screen Component
 *
 * Full-screen paywall (not modal). Use when you want the paywall
 * to be a standalone screen instead of a modal overlay.
 */

import React, { useCallback, useEffect } from "react";
import { View, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { useSafeAreaInsets } from "@umituz/react-native-design-system/safe-area";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { ScreenLayout } from "@umituz/react-native-design-system/layouts";
import { Image } from "expo-image";
import { PlanCard } from "./PlanCard";
import { paywallScreenStyles as styles } from "./PaywallScreen.styles";
import { PaywallFeatures } from "./PaywallFeatures";
import { PaywallFooter } from "./PaywallFooter";
import { usePaywallActions } from "../hooks/usePaywallActions";
import { PaywallScreenProps } from "./PaywallScreen.types";

export const PaywallScreen: React.FC<PaywallScreenProps> = React.memo((props) => {
  const {
    onClose,
    translations,
    packages = [],
    features = [],
    legalUrls = {},
    bestValueIdentifier,
    creditAmounts,
    creditsLabel,
    heroImage,
    onPurchase,
    onRestore,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    source,
    isLoadingPackages
  } = props;

  const tokens = useAppDesignTokens();
  const insets = useSafeAreaInsets();

  if (__DEV__) {
    console.log("[PaywallScreen] Render:", {
      packagesCount: packages.length,
      isLoadingPackages,
      source,
    });
  }

  const { selectedPlanId, setSelectedPlanId, isProcessing, handlePurchase, handleRestore } = usePaywallActions({
    packages,
    onPurchase,
    onRestore,
    source,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    onClose
  });

  // Auto-select first package when packages load and none is selected
  useEffect(() => {
    if (packages.length > 0 && !selectedPlanId) {
      setSelectedPlanId(packages[0].product.identifier);
    }
  }, [packages, selectedPlanId, setSelectedPlanId]);

  const handleLegalUrl = useCallback(async (url: string | undefined) => {
    if (!url) return;
    try {
      if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    } catch (error) {
      console.error('[PaywallScreen] Failed to open URL:', error instanceof Error ? error.message : String(error));
    }
  }, []);

  // Close button for header
  const closeButton = (
    <TouchableOpacity
      onPress={onClose}
      style={[screenStyles.closeBtn, { backgroundColor: tokens.colors.surfaceSecondary }]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <AtomicIcon name="close-outline" size="md" customColor={tokens.colors.textPrimary} />
    </TouchableOpacity>
  );

  // Sticky footer with CTA and restore/legal links
  const footerContent = (
    <View style={[styles.stickyFooter, { paddingBottom: insets.bottom || 16 }]}>
      <TouchableOpacity
        onPress={handlePurchase}
        disabled={isProcessing || isLoadingPackages || !selectedPlanId}
        style={[
          styles.cta,
          { backgroundColor: tokens.colors.primary },
          (isProcessing || isLoadingPackages || !selectedPlanId) && styles.ctaDisabled
        ]}
        activeOpacity={0.75}
      >
        <AtomicText type="titleLarge" style={[styles.ctaText, { color: tokens.colors.onPrimary }]}>
          {isProcessing ? translations.processingText : translations.purchaseButtonText}
        </AtomicText>
      </TouchableOpacity>
      <PaywallFooter
        translations={translations}
        legalUrls={legalUrls}
        isProcessing={isProcessing}
        onRestore={onRestore ? handleRestore : undefined}
        onLegalClick={handleLegalUrl}
      />
    </View>
  );

  return (
    <ScreenLayout
      scrollable={true}
      backgroundColor={tokens.colors.backgroundPrimary}
      header={closeButton}
      footer={footerContent}
      contentContainerStyle={screenStyles.contentContainer}
    >
      {/* Hero Image */}
      {heroImage && (
        <View style={styles.heroContainer}>
          <Image source={heroImage} style={styles.heroImage} contentFit="cover" transition={0} />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <AtomicText
          type="headlineMedium"
          adjustsFontSizeToFit
          numberOfLines={2}
          minimumFontScale={0.75}
          style={[styles.title, { color: tokens.colors.textPrimary }]}
        >
          {translations.title}
        </AtomicText>
        {translations.subtitle && (
          <AtomicText
            type="bodyMedium"
            adjustsFontSizeToFit
            numberOfLines={3}
            minimumFontScale={0.8}
            style={[styles.subtitle, { color: tokens.colors.textSecondary }]}
          >
            {translations.subtitle}
          </AtomicText>
        )}
      </View>

      {/* Features */}
      <PaywallFeatures features={features} />

      {/* Plans */}
      <View style={styles.plans}>
        {isLoadingPackages ? (
          <View style={styles.loading}>
            <AtomicSpinner size="md" />
            {translations.processingText && (
              <AtomicText
                type="bodySmall"
                style={[styles.loadingText, { color: tokens.colors.textSecondary }]}
              >
                {translations.processingText}
              </AtomicText>
            )}
          </View>
        ) : packages.length === 0 ? (
          <View style={styles.loading}>
            <AtomicText
              type="bodyMedium"
              style={{ color: tokens.colors.textSecondary, textAlign: "center" }}
            >
              {translations.emptyText ?? "No packages available"}
            </AtomicText>
          </View>
        ) : (
          packages.map((pkg) => {
            const pid = pkg.product.identifier;
            const isSelected = selectedPlanId === pid;
            const isBestValue = bestValueIdentifier === pid;
            const credits = creditAmounts?.[pid];

            return (
              <PlanCard
                key={pid}
                pkg={pkg}
                isSelected={isSelected}
                badge={isBestValue ? translations.bestValueBadgeText : undefined}
                creditAmount={credits}
                creditsLabel={creditsLabel}
                onSelect={() => setSelectedPlanId(pid)}
              />
            );
          })
        )}
      </View>
    </ScreenLayout>
  );
});

PaywallScreen.displayName = "PaywallScreen";

const screenStyles = StyleSheet.create({
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 16,
  },
});
