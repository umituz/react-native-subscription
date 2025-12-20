/**
 * Subscription Actions Component
 * Displays action buttons for subscription management
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";

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
                    <Text
                        style={[
                            styles.secondaryButtonText,
                            { color: tokens.colors.textPrimary },
                        ]}
                    >
                        {manageButtonLabel}
                    </Text>
                </TouchableOpacity>
            )}
            {!isPremium && onUpgrade && upgradeButtonLabel && (
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: tokens.colors.primary }]}
                    onPress={onUpgrade}
                >
                    <Text
                        style={[
                            styles.primaryButtonText,
                            { color: tokens.colors.onPrimary },
                        ]}
                    >
                        {upgradeButtonLabel}
                    </Text>
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
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "700",
    },
    secondaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});
