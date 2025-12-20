import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AtomicButton, AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { PaywallLegalFooter } from "./PaywallLegalFooter";

interface SubscriptionFooterProps {
    isProcessing: boolean;
    isLoading: boolean;
    processingText: string;
    purchaseButtonText: string;
    hasPackages: boolean;
    selectedPkg: any; // Using any to avoid circular deps if needed, but preferably strict
    restoreButtonText: string;
    showRestoreButton: boolean;
    privacyUrl?: string;
    termsUrl?: string;
    privacyText?: string;
    termsOfServiceText?: string;
    onPurchase: () => void;
    onRestore: () => void;
}

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

        return (
            <View style={styles.container}>
                <View style={styles.actions}>
                    {hasPackages && (
                        <AtomicButton
                            title={isProcessing ? processingText : purchaseButtonText}
                            onPress={onPurchase}
                            disabled={!selectedPkg || isProcessing || isLoading}
                        />
                    )}
                    {showRestoreButton && (
                        <TouchableOpacity
                            style={styles.restoreButton}
                            onPress={onRestore}
                            disabled={isProcessing || isLoading}
                        >
                            <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>
                                {restoreButtonText}
                            </AtomicText>
                        </TouchableOpacity>
                    )}
                </View>

                <PaywallLegalFooter
                    privacyUrl={privacyUrl}
                    termsUrl={termsUrl}
                    privacyText={privacyText}
                    termsOfServiceText={termsOfServiceText}
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
        gap: 12
    },
    restoreButton: {
        alignItems: "center",
        paddingVertical: 8
    },
});
