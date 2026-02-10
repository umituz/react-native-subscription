import React, { useCallback, useEffect } from "react";
import { View, TouchableOpacity, Linking } from "react-native";
import { BaseModal, useAppDesignTokens, AtomicText, AtomicIcon, AtomicSpinner, useSafeAreaInsets } from "@umituz/react-native-design-system";
import { ScreenLayout } from "../../../shared/presentation";
import { Image } from "expo-image";
import { PlanCard } from "./PlanCard";
import { paywallModalStyles as styles } from "./PaywallModal.styles";
import { PaywallFeatures } from "./PaywallFeatures";
import { PaywallFooter } from "./PaywallFooter";
import { usePaywallActions } from "../hooks/usePaywallActions";
import { PaywallModalProps } from "./PaywallModal.types";

export const PaywallModal: React.FC<PaywallModalProps> = React.memo((props) => {
  const { visible, onClose, translations, packages = [], features = [], isLoading = false, legalUrls = {}, bestValueIdentifier, creditAmounts, creditsLabel, heroImage, onPurchase, onRestore, trialEligibility = {}, trialSubtitleText } = props;
  const tokens = useAppDesignTokens();
  const insets = useSafeAreaInsets();
  const { selectedPlanId, setSelectedPlanId, isProcessing, handlePurchase, handleRestore, resetState } = usePaywallActions({ packages, onPurchase, onRestore });

  useEffect(() => { setSelectedPlanId(null); }, [packages, setSelectedPlanId]);
  useEffect(() => { if (!visible) resetState(); }, [visible, resetState]);

  const handleLegalUrl = useCallback(async (url: string | undefined) => {
    if (!url) return;
    try { 
      if (await Linking.canOpenURL(url)) await Linking.openURL(url); 
    } catch (err) {
      console.error("[PaywallModal] Legal link error:", err);
    }
  }, []);


  return (
    <BaseModal visible={visible} onClose={onClose} contentStyle={styles.modalContent}>
      <View style={[styles.container, { backgroundColor: tokens.colors.surface }]}>
        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: tokens.colors.surfaceSecondary, top: Math.max(insets.top, 12) }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <AtomicIcon name="close-outline" size="md" customColor={tokens.colors.textPrimary} />
        </TouchableOpacity>
        <ScreenLayout scrollable={true} edges={["bottom"]} backgroundColor="transparent" contentContainerStyle={styles.scroll}>
          {heroImage && <View style={styles.heroContainer}><Image source={heroImage} style={styles.heroImage} contentFit="cover" transition={0} /></View>}
          <View style={styles.header}>
            <AtomicText type="headlineMedium" style={[styles.title, { color: tokens.colors.textPrimary }]}>{translations.title}</AtomicText>
            {translations.subtitle && <AtomicText type="bodyMedium" style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>{translations.subtitle}</AtomicText>}
          </View>
          <PaywallFeatures features={features} />
          {isLoading ? (
            <View style={styles.loading}><AtomicSpinner size="lg" color="primary" text={translations.loadingText} /></View>
          ) : (
            <View style={styles.plans}>
              {packages.map((pkg) => {
                const pid = pkg.product.identifier;
                const hasTrial = trialEligibility[pid]?.eligible ?? false;
                return (
                  <PlanCard key={pid} pkg={pkg} isSelected={selectedPlanId === pid} onSelect={() => setSelectedPlanId(pid)} badge={pid === bestValueIdentifier ? translations.bestValueBadgeText : undefined} creditAmount={creditAmounts?.[pid]} creditsLabel={creditsLabel} hasFreeTrial={hasTrial} trialSubtitleText={hasTrial ? trialSubtitleText : undefined} />
                );
              })}
            </View>
          )}
          <TouchableOpacity onPress={handlePurchase} disabled={!selectedPlanId || isProcessing} style={[styles.cta, { backgroundColor: tokens.colors.primary }, (!selectedPlanId || isProcessing) && styles.ctaDisabled]} activeOpacity={0.8}>
            <AtomicText type="titleLarge" style={[styles.ctaText, { color: tokens.colors.onPrimary }]}>{isProcessing ? translations.processingText : translations.purchaseButtonText}</AtomicText>
          </TouchableOpacity>
          <PaywallFooter translations={translations} legalUrls={legalUrls} isProcessing={isProcessing} onRestore={onRestore ? handleRestore : undefined} onLegalClick={handleLegalUrl} />
        </ScreenLayout>
      </View>
    </BaseModal>
  );
});

PaywallModal.displayName = "PaywallModal";
