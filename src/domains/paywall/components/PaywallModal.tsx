/**
 * Paywall Modal
 * Modern paywall with responsive design and theme support
 */

import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { BaseModal, useAppDesignTokens, AtomicText, AtomicIcon } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { PlanCard } from "./PlanCard";
import { CreditCard } from "./CreditCard";
import type { PaywallMode, CreditsPackage, SubscriptionFeature, PaywallTranslations, PaywallLegalUrls } from "../entities";

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
                    <View style={styles.header}>
                        <AtomicText type="headlineLarge" style={[styles.title, { color: tokens.colors.textPrimary }]}>
                            {translations.title}
                        </AtomicText>
                        {translations.subtitle && (
                            <AtomicText type="bodyLarge" style={[styles.subtitle, { color: tokens.colors.textSecondary }]}>
                                {translations.subtitle}
                            </AtomicText>
                        )}
                    </View>

                    {features.length > 0 && (
                        <View style={[styles.features, { backgroundColor: tokens.colors.surfaceSecondary }]}>
                            {features.map((feature, idx) => (
                                <View key={idx} style={styles.featureRow}>
                                    <View style={[styles.featureIcon, { backgroundColor: tokens.colors.primaryLight }]}>
                                        <AtomicIcon name={feature.icon} customSize={20} customColor={tokens.colors.primary} />
                                    </View>
                                    <AtomicText type="bodyLarge" style={[styles.featureText, { color: tokens.colors.textPrimary }]}>
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
                                        badge={pkg.product.identifier === bestValueIdentifier ? "Best Value" : undefined}
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
                            {isProcessing ? translations.processingText : showSubscription ? translations.subscribeButtonText : translations.purchaseButtonText}
                        </AtomicText>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        {legalUrls.termsUrl && (
                            <TouchableOpacity onPress={() => {}}>
                                <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                                    {translations.termsOfServiceText}
                                </AtomicText>
                            </TouchableOpacity>
                        )}
                        {onRestore && (
                            <TouchableOpacity onPress={handleRestore}>
                                <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                                    {translations.restoreButtonText}
                                </AtomicText>
                            </TouchableOpacity>
                        )}
                        {legalUrls.privacyUrl && (
                            <TouchableOpacity onPress={() => {}}>
                                <AtomicText type="bodySmall" style={[styles.footerLink, { color: tokens.colors.textSecondary }]}>
                                    {translations.privacyText}
                                </AtomicText>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </View>
        </BaseModal>
    );
});

PaywallModal.displayName = "PaywallModal";

const styles = StyleSheet.create({
    modalContent: { padding: 0, borderWidth: 0, overflow: "hidden" },
    container: { flex: 1 },
    closeBtn: { position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", zIndex: 10 },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 56 },
    header: { alignItems: "center", marginBottom: 24 },
    title: { fontWeight: "700", textAlign: "center", marginBottom: 8 },
    subtitle: { textAlign: "center", lineHeight: 24 },
    features: { borderRadius: 16, padding: 16, marginBottom: 20, gap: 12 },
    featureRow: { flexDirection: "row", alignItems: "center" },
    featureIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
    featureText: { flex: 1, fontWeight: "500" },
    loading: { alignItems: "center", paddingVertical: 40 },
    loadingText: { marginTop: 12 },
    plans: { marginBottom: 20 },
    cta: { borderRadius: 16, paddingVertical: 18, alignItems: "center", marginBottom: 16 },
    ctaDisabled: { opacity: 0.5 },
    ctaText: { fontWeight: "700" },
    footer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 },
    footerLink: {},
});
