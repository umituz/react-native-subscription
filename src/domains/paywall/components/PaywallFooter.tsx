/**
 * Paywall Footer
 * Action button and legal links
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { AtomicText, AtomicButton, useAppDesignTokens } from "@umituz/react-native-design-system";

interface PaywallFooterProps {
    isProcessing: boolean;
    isDisabled: boolean;
    purchaseButtonText: string;
    processingText: string;
    restoreButtonText: string;
    privacyText?: string;
    termsText?: string;
    privacyUrl?: string;
    termsUrl?: string;
    onPurchase: () => void;
    onRestore: () => void;
}

export const PaywallFooter: React.FC<PaywallFooterProps> = React.memo(
    ({
        isProcessing,
        isDisabled,
        purchaseButtonText,
        processingText,
        restoreButtonText,
        privacyText,
        termsText,
        privacyUrl,
        termsUrl,
        onPurchase,
        onRestore,
    }) => {
        const tokens = useAppDesignTokens();

        const handleOpenUrl = (url?: string) => {
            if (url) Linking.openURL(url);
        };

        return (
            <View style={styles.container}>
                <AtomicButton
                    title={isProcessing ? processingText : purchaseButtonText}
                    onPress={onPurchase}
                    disabled={isDisabled || isProcessing}
                    variant="primary"
                    size="lg"
                    style={styles.purchaseButton}
                />

                <View style={styles.linksRow}>
                    {termsText && termsUrl && (
                        <TouchableOpacity onPress={() => handleOpenUrl(termsUrl)}>
                            <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>
                                {termsText}
                            </AtomicText>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={onRestore}>
                        <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>
                            {restoreButtonText}
                        </AtomicText>
                    </TouchableOpacity>

                    {privacyText && privacyUrl && (
                        <TouchableOpacity onPress={() => handleOpenUrl(privacyUrl)}>
                            <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>
                                {privacyText}
                            </AtomicText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }
);

PaywallFooter.displayName = "PaywallFooter";

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    purchaseButton: {
        marginBottom: 16,
    },
    linksRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
});
