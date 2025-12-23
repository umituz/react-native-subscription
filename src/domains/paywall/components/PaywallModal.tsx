/**
 * Paywall Modal
 * Mode-based paywall: subscription, credits, or hybrid
 */

import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { BaseModal, useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";
import { PaywallHeader } from "./PaywallHeader";
import { PaywallTabBar } from "./PaywallTabBar";
import { PaywallFooter } from "./PaywallFooter";
import { FeatureList } from "./FeatureList";
import { PlanCard } from "./PlanCard";
import { CreditCard } from "./CreditCard";
import type {
    PaywallMode,
    PaywallTabType,
    CreditsPackage,
    SubscriptionFeature,
    PaywallTranslations,
    PaywallLegalUrls,
} from "../entities";

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
    const initialTab: PaywallTabType = mode === "credits" ? "credits" : "subscription";
    const [activeTab, setActiveTab] = useState<PaywallTabType>(initialTab);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const showTabs = mode === "hybrid";
    const showCredits = mode === "credits" || (mode === "hybrid" && activeTab === "credits");
    const showSubscription = mode === "subscription" || (mode === "hybrid" && activeTab === "subscription");

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
        if (onRestore) {
            setIsProcessing(true);
            try {
                await onRestore();
            } finally {
                setIsProcessing(false);
            }
        }
    }, [onRestore]);

    const isPurchaseDisabled = showSubscription ? !selectedPlanId : !selectedCreditId;

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <View style={styles.container}>
                <PaywallHeader title={translations.title} subtitle={translations.subtitle} onClose={onClose} />

                {showTabs && (
                    <PaywallTabBar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        creditsLabel={translations.creditsTabLabel ?? "Credits"}
                        subscriptionLabel={translations.subscriptionTabLabel ?? "Subscription"}
                    />
                )}

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <FeatureList features={features} />

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={tokens.colors.primary} />
                            <AtomicText type="bodyMedium" style={{ color: tokens.colors.textSecondary, marginTop: 12 }}>
                                {translations.loadingText}
                            </AtomicText>
                        </View>
                    ) : (
                        <>
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
                                    <CreditCard
                                        key={pkg.id}
                                        pkg={pkg}
                                        isSelected={selectedCreditId === pkg.id}
                                        onSelect={() => setSelectedCreditId(pkg.id)}
                                    />
                                ))}
                        </>
                    )}
                </ScrollView>

                <PaywallFooter
                    isProcessing={isProcessing}
                    isDisabled={isPurchaseDisabled}
                    purchaseButtonText={showSubscription ? (translations.subscribeButtonText ?? translations.purchaseButtonText) : translations.purchaseButtonText}
                    processingText={translations.processingText}
                    restoreButtonText={translations.restoreButtonText}
                    privacyText={translations.privacyText}
                    termsText={translations.termsOfServiceText}
                    privacyUrl={legalUrls.privacyUrl}
                    termsUrl={legalUrls.termsUrl}
                    onPurchase={handlePurchase}
                    onRestore={handleRestore}
                />
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
});
