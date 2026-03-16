import React, { useCallback, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { AtomicText, AtomicIcon, AtomicSpinner } from "@umituz/react-native-design-system/atoms";
import { BaseModal } from "@umituz/react-native-design-system/molecules";
import { useSafeAreaInsets } from "@umituz/react-native-design-system/safe-area";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { Image } from "expo-image";
import { PlanCard } from "./PlanCard";
import { paywallModalStyles as styles } from "./PaywallModal.styles";
import { PaywallFeatures } from "./PaywallFeatures";
import { PaywallFooter } from "./PaywallFooter";
import { usePaywallActions } from "../hooks/usePaywallActions";
import { PaywallModalProps } from "./PaywallModal.types";

export const PaywallModal: React.FC<PaywallModalProps> = React.memo((props) => {
  const { visible, onClose, translations, packages = [], features = [], legalUrls = {}, bestValueIdentifier, creditAmounts, creditsLabel, heroImage, onPurchase, onRestore, onPurchaseSuccess, onPurchaseError, onAuthRequired, source, isLoadingPackages } = props;
  const tokens = useAppDesignTokens();
  const insets = useSafeAreaInsets();

  if (__DEV__) {
    console.log("[PaywallModal] Render:", {
      visible,
      packagesCount: packages.length,
      isLoadingPackages,
      source,
    });
  }

  const { selectedPlanId, setSelectedPlanId, isProcessing, handlePurchase, handleRestore, resetState } = usePaywallActions({
    packages,
    onPurchase,
    onRestore,
    source,
    onPurchaseSuccess,
    onPurchaseError,
    onAuthRequired,
    onClose
  });

  useEffect(() => {
    if (!visible) resetState();
  }, [visible, resetState]);

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
      console.error('[PaywallModal] Failed to open URL:', error instanceof Error ? error.message : String(error));
    }
  }, []);


  return (
    <BaseModal visible={visible} onClose={onClose} contentStyle={styles.modalContent}>
      <View style={[styles.container, { backgroundColor: tokens.colors.surface }]}>
        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: tokens.colors.surfaceSecondary, top: Math.max(insets.top, 12) }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <AtomicIcon name="close-outline" size="md" customColor={tokens.colors.textPrimary} />
        </TouchableOpacity>

        {/* Scrollable content — plan cards scroll, CTA is always pinned below */}
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {heroImage && <View style={styles.heroContainer}><Image source={heroImage} style={styles.heroImage} contentFit="cover" transition={0} /></View>}
          <View style={styles.header}>
            <AtomicText type="headlineMedium" adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.75} style={[styles.title, { color: tokens.colors.textPrimary }]}>{translations.title}</AtomicText>
            {translations.subtitle && <AtomicText type="bodyMedium" adjustsFontSizeToFit numberOfLines={3} minimumFontScale={0.8} style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>{translations.subtitle}</AtomicText>}
          </View>
          <PaywallFeatures features={features} />
          <View style={styles.plans}>
            {isLoadingPackages ? (
              <View style={styles.loading}>
                <AtomicSpinner size="md" />
                {translations.processingText && (
                  <AtomicText type="bodySmall" style={[styles.loadingText, { color: tokens.colors.textSecondary }]}>{translations.processingText}</AtomicText>
                )}
              </View>
            ) : packages.length === 0 ? (
              <View style={styles.loading}>
                <AtomicText type="bodyMedium" style={{ color: tokens.colors.textSecondary, textAlign: "center" }}>{translations.emptyText ?? "No packages available"}</AtomicText>
              </View>
            ) : (
              packages.map((pkg) => {
                const pid = pkg.product.identifier;
                return (
                  <PlanCard key={pid} pkg={pkg} isSelected={selectedPlanId === pid} onSelect={() => setSelectedPlanId(pid)} badge={pid === bestValueIdentifier ? translations.bestValueBadgeText : undefined} creditAmount={creditAmounts?.[pid]} creditsLabel={creditsLabel} />
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Sticky footer — always visible, never hidden behind scroll content */}
        <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity onPress={handlePurchase} disabled={isProcessing || isLoadingPackages || !selectedPlanId} style={[styles.cta, { backgroundColor: tokens.colors.primary }, (isProcessing || isLoadingPackages || !selectedPlanId) && styles.ctaDisabled]} activeOpacity={0.75}>
            <AtomicText type="titleLarge" style={[styles.ctaText, { color: tokens.colors.onPrimary }]}>{isProcessing ? translations.processingText : translations.purchaseButtonText}</AtomicText>
          </TouchableOpacity>
          <PaywallFooter translations={translations} legalUrls={legalUrls} isProcessing={isProcessing} onRestore={onRestore ? handleRestore : undefined} onLegalClick={handleLegalUrl} />
        </View>
      </View>
    </BaseModal>
  );
});

PaywallModal.displayName = "PaywallModal";
