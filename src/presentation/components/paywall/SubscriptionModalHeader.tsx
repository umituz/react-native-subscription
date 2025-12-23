/**
 * Subscription Modal Header Component
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";

interface SubscriptionModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
}

export const SubscriptionModalHeader: React.FC<SubscriptionModalHeaderProps> = ({
    title,
    subtitle,
    onClose,
}) => {
    const tokens = useAppDesignTokens();

    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                testID="subscription-modal-close-button"
            >
                <AtomicText style={[styles.closeIcon, { color: tokens.colors.textSecondary }]}>
                    ×
                </AtomicText>
            </TouchableOpacity>
            <AtomicText
                type="headlineMedium"
                style={[styles.title, { color: tokens.colors.textPrimary }]}
            >
                {title}
            </AtomicText>
            {subtitle && (
                <AtomicText
                    type="bodyMedium"
                    style={[styles.subtitle, { color: tokens.colors.textSecondary }]}
                >
                    {subtitle}
                </AtomicText>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    closeButton: {
        position: "absolute",
        top: 8,
        right: 16,
        padding: 8,
        zIndex: 1,
    },
    closeIcon: {
        fontSize: 28,
        fontWeight: "300",
    },
    title: {
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        paddingHorizontal: 20,
    },
});
