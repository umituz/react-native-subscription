import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
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
                                colors={
                                    isDisabled
                                        ? [tokens.colors.border, tokens.colors.borderLight]
                                        : [tokens.colors.primary, tokens.colors.secondary]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.gradientButton, isDisabled && { opacity: 0.6 }]}
                            >
                                <AtomicText
                                    type="titleSmall"
                                    style={{
                                        color: tokens.colors.onPrimary,
                                        fontWeight: "800",
                                        fontSize: 16,
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

const styles = StyleSheet.create({
    container: {},
    actions: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
    },
    gradientButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    restoreButton: {
        alignItems: "center",
        paddingVertical: 8,
    },
});
