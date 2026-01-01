/**
 * Paywall Modal
 * Modern paywall with responsive design and theme support
 */

import React, { useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Linking, type ImageSourcePropType } from "react-native";
import { BaseModal, useAppDesignTokens, AtomicText, AtomicIcon } from "@umituz/react-native-design-system";
import { Image } from "expo-image";
import type { PurchasesPackage } from "react-native-purchases";
import { PlanCard } from "./PlanCard";
import { CreditCard } from "./CreditCard";
import type { PaywallMode, CreditsPackage, SubscriptionFeature, PaywallTranslations, PaywallLegalUrls } from '../entities';
import { paywallModalStyles as styles } from "./PaywallModal.styles";

export interface PaywallModalProps {
    visible: boolean;
    onClose: () => void;
    mode: PaywallMode;
    translations: PaywallTranslations;
    subscriptionPackages?: PurchasesPackage[];
    creditsPackages?: CreditsPackage[];
    features?: SubscriptionFeature[];
    isLoading?: boolean;
    legalUrls?: PaywallLegalUrls;
    bestValueIdentifier?: string;
    creditAmounts?: Record<string, number>;
    creditsLabel?: string;
    /** Hero image source (require or uri) */
    heroImage?: ImageSourcePropType;
    onSubscriptionPurchase?: (pkg: PurchasesPackage) => Promise<void>;
    onCreditsPurchase?: (packageId: string) => Promise<void>;
    onRestore?: () => Promise<void>;
}

export const PaywallModal: React.FC<PaywallModalProps> = React.memo((props) => {
    const {
        visible,
        onClose,
        mode,
        translations,
        subscriptionPackages = [],
        creditsPackages = [],
        features = [],
        isLoading = false,
        legalUrls = {},
        bestValueIdentifier,
        creditAmounts,
        creditsLabel,
        heroImage,
        onSubscriptionPurchase,
        onCreditsPurchase,
        onRestore,
    } = props;

    const tokens = useAppDesignTokens();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const showCredits = mode === "credits";
    const showSubscription = mode === "subscription" || mode === "hybrid";

    const handlePurchase = useCallback(async () => {
        setIsProcessing(true);
        try {
            if (showSubscription && selectedPlanId && onSubscriptionPurchase) {
                const pkg = subscriptionPackages.find((p) => p.product.identifier === selectedPlanId);
                if (pkg) await onSubscriptionPurchase(pkg);
            } else if (showCredits && selectedCreditId && onCreditsPurchase) {
                await onCreditsPurchase(selectedCreditId);
            }
        } finally {
            setIsProcessing(false);
        }
    }, [showSubscription, showCredits, selectedPlanId, selectedCreditId, subscriptionPackages, onSubscriptionPurchase, onCreditsPurchase]);

    const handleRestore = useCallback(async () => {
        if (!onRestore || isProcessing) return;
        setIsProcessing(true);
        try {
            await onRestore();
        } finally {
            setIsProcessing(false);
        }
    }, [onRestore, isProcessing]);

    const handleLegalUrl = useCallback(async (url: string | undefined) => {
        if (!url) return;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        } catch {
            // Silent fail
        }
    }, []);

    const isPurchaseDisabled = showSubscription ? !selectedPlanId : !selectedCreditId;

    return (
        <BaseModal visible={visible} onClose={onClose} contentStyle={styles.modalContent}>
            <View style={[styles.container, { backgroundColor: tokens.colors.surface }]}>
                <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeBtn, { backgroundColor: tokens.colors.surfaceSecondary }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <AtomicIcon name="close-outline" size="md" customColor={tokens.colors.textPrimary} />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {heroImage && (
                        <View style={styles.heroContainer}>
                            <Image
                                source={heroImage}
                                style={styles.heroImage}
                                contentFit="cover"
                                transition={300}
                            />
                        </View>
                    )}
                    <View style={styles.header}>
                        <AtomicText type="headlineMedium" style={[styles.title, { color: tokens.colors.textPrimary }]}>
                            {translations.title}
                        </AtomicText>
                        {translations.subtitle && (
                            <AtomicText type="bodyMedium" style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>
                                {translations.subtitle}
                            </AtomicText>
                        )}
                    </View>

                    {features.length > 0 && (
                        <View style={[styles.features, { backgroundColor: tokens.colors.surfaceSecondary }]}>
                            {features.map((feature, idx) => (
                                <View key={idx} style={styles.featureRow}>
                                    <View style={[styles.featureIcon, { backgroundColor: tokens.colors.primaryLight }]}>
                                        <AtomicIcon name={feature.icon} customSize={16} customColor={tokens.colors.primary} />
                                    </View>
                                    <AtomicText type="bodyMedium" style={[styles.featureText, { color: tokens.colors.textPrimary }]}>
                                        {feature.text}
                                    </AtomicText>
                                </View>
                            ))}
                        </View>
                    )}

                    {isLoading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator color={tokens.colors.primary} />
                            <AtomicText type="bodyMedium" style={[styles.loadingText, { color: tokens.colors.textSecondary }]}>
                                {translations.loadingText}
                            </AtomicText>
                        </View>
                    ) : (
                        <View style={styles.plans}>
                            {showSubscription &&
                                subscriptionPackages.map((pkg) => (
                                    <PlanCard
                                        key={pkg.product.identifier}
                                        pkg={pkg}
                                        isSelected={selectedPlanId === pkg.product.identifier}
                                        onSelect={() => setSelectedPlanId(pkg.product.identifier)}
                                        badge={pkg.product.identifier === bestValueIdentifier ? translations.bestValueBadgeText : undefined}
                                        creditAmount={creditAmounts?.[pkg.product.identifier]}
                                        creditsLabel={creditsLabel}
                                    />
                                ))}
                            {showCredits &&
                                creditsPackages.map((pkg) => (
                                    <CreditCard key={pkg.id} pkg={pkg} isSelected={selectedCreditId === pkg.id} onSelect={() => setSelectedCreditId(pkg.id)} />
                                ))}
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handlePurchase}
                        disabled={isPurchaseDisabled || isProcessing}
                        style={[styles.cta, { backgroundColor: tokens.colors.primary }, (isPurchaseDisabled || isProcessing) && styles.ctaDisabled]}
                        activeOpacity={0.8}
                    >
                        <AtomicText type="titleLarge" style={[styles.ctaText, { color: tokens.colors.onPrimary }]}>
                            {isProcessing
                                ? translations.processingText
                                : showSubscription
                                    ? (translations.subscribeButtonText || translations.purchaseButtonText)
                                    : translations.purchaseButtonText}
                        </AtomicText>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        {onRestore && (
                            <TouchableOpacity
                                onPress={handleRestore}
                                disabled={isProcessing}
                                style={[styles.restoreButton, isProcessing && styles.restoreButtonDisabled]}
                            >
                                <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                                    {isProcessing ? translations.processingText : translations.restoreButtonText}
                                </AtomicText>
                            </TouchableOpacity>
                        )}
                        <View style={styles.legalRow}>
                            {legalUrls.termsUrl && (
                                <TouchableOpacity onPress={() => handleLegalUrl(legalUrls.termsUrl)}>
                                    <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                                        {translations.termsOfServiceText}
                                    </AtomicText>
                                </TouchableOpacity>
                            )}
                            {legalUrls.privacyUrl && (
                                <TouchableOpacity onPress={() => handleLegalUrl(legalUrls.privacyUrl)}>
                                    <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                                        {translations.privacyText}
                                    </AtomicText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </BaseModal>
    );
});

PaywallModal.displayName = "PaywallModal";
