import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { AtomicText, useAppDesignTokens, useResponsive } from "@umituz/react-native-design-system";
import { PaywallLegalFooter } from "./PaywallLegalFooter";

interface SubscriptionFooterProps {
    isProcessing: boolean;
    isLoading: boolean;
    processingText: string;
    purchaseButtonText: string;
    hasPackages: boolean;
    selectedPkg: PurchasesPackage | null;
    restoreButtonText: string;
    showRestoreButton: boolean;
    privacyUrl?: string;
    termsUrl?: string;
    privacyText?: string;
    termsOfServiceText?: string;
    onPurchase: () => void;
    onRestore: () => void;
}

import { LinearGradient } from "expo-linear-gradient";

export const SubscriptionFooter: React.FC<SubscriptionFooterProps> = React.memo(
    ({
        isProcessing,
        isLoading,
        processingText,
        purchaseButtonText,
        hasPackages,
        selectedPkg,
        restoreButtonText,
        showRestoreButton,
        privacyUrl,
        termsUrl,
        privacyText,
        termsOfServiceText,
        onPurchase,
        onRestore,
    }) => {
        const tokens = useAppDesignTokens();
        const { spacingMultiplier, getFontSize } = useResponsive();

        const styles = useMemo(() => createStyles(spacingMultiplier), [spacingMultiplier]);
        const buttonFontSize = getFontSize(16);

        const isDisabled = !selectedPkg || isProcessing || isLoading;

        return (
            <View style={styles.container}>
                <View style={styles.actions}>
                    {hasPackages && (
                        <TouchableOpacity
                            onPress={onPurchase}
                            disabled={isDisabled}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[tokens.colors.primary, tokens.colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.gradientButton, isDisabled && { opacity: 0.5 }]}
                            >
                                <AtomicText
                                    type="titleSmall"
                                    style={{
                                        color: tokens.colors.onPrimary,
                                        fontWeight: "800",
                                        fontSize: buttonFontSize,
                                    }}
                                >
                                    {isProcessing ? processingText : purchaseButtonText}
                                </AtomicText>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                <PaywallLegalFooter
                    privacyUrl={privacyUrl}
                    termsUrl={termsUrl}
                    privacyText={privacyText}
                    termsOfServiceText={termsOfServiceText}
                    showRestoreButton={showRestoreButton}
                    restoreButtonText={restoreButtonText}
                    onRestore={onRestore}
                    isProcessing={isProcessing || isLoading}
                />
            </View>
        );
    }
);

SubscriptionFooter.displayName = "SubscriptionFooter";

const createStyles = (spacingMult: number) =>
    StyleSheet.create({
        container: {},
        actions: {
            paddingHorizontal: 24 * spacingMult,
            paddingVertical: 16 * spacingMult,
            gap: 12 * spacingMult,
        },
        gradientButton: {
            paddingVertical: 16 * spacingMult,
            borderRadius: 16 * spacingMult,
            alignItems: "center",
            justifyContent: "center",
        },
        restoreButton: {
            alignItems: "center",
            paddingVertical: 8 * spacingMult,
        },
    });
