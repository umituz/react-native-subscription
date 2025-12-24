/**
 * Subscription Actions Component
 * Displays action buttons for subscription management
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";

interface SubscriptionActionsProps {
    isPremium: boolean;
    manageButtonLabel?: string;
    upgradeButtonLabel?: string;
    onManage?: () => void;
    onUpgrade?: () => void;
}

export const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
    isPremium,
    manageButtonLabel,
    upgradeButtonLabel,
    onManage,
    onUpgrade,
}) => {
    const tokens = useAppDesignTokens();

    return (
        <View style={styles.container}>
            {isPremium && onManage && manageButtonLabel && (
                <TouchableOpacity
                    style={[
                        styles.secondaryButton,
                        { backgroundColor: tokens.colors.surfaceSecondary },
                    ]}
                    onPress={onManage}
                >
                    <AtomicText
                        type="titleMedium"
                        style={{ color: tokens.colors.textPrimary, fontWeight: "600" }}
                    >
                        {manageButtonLabel}
                    </AtomicText>
                </TouchableOpacity>
            )}
            {!isPremium && onUpgrade && upgradeButtonLabel && (
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: tokens.colors.primary }]}
                    onPress={onUpgrade}
                >
                    <AtomicText
                        type="titleMedium"
                        style={{ color: tokens.colors.onPrimary, fontWeight: "700" }}
                    >
                        {upgradeButtonLabel}
                    </AtomicText>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
        paddingBottom: 32,
    },
    primaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    secondaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
});
