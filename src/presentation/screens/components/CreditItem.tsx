/**
 * Credit Item Component
 * Displays individual credit usage with progress bar
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";

interface CreditItemProps {
    label: string;
    current: number;
    total: number;
    remainingLabel?: string;
}

export const CreditItem: React.FC<CreditItemProps> = ({
    label,
    current,
    total,
    remainingLabel = "remaining",
}) => {
    const tokens = useAppDesignTokens();
    const percentage = total > 0 ? (current / total) * 100 : 0;
    const isLow = percentage <= 20;
    const isMedium = percentage > 20 && percentage <= 50;

    const getColor = () => {
        if (isLow) return tokens.colors.error;
        if (isMedium) return tokens.colors.warning;
        return tokens.colors.success;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <AtomicText type="bodyMedium" style={[styles.label, { color: tokens.colors.textPrimary }]}>
                    {label}
                </AtomicText>
                <View style={[styles.badge, { backgroundColor: tokens.colors.surfaceSecondary }]}>
                    <AtomicText type="labelSmall" style={[styles.count, { color: getColor() }]}>
                        {current} / {total}
                    </AtomicText>
                </View>
            </View>
            <View
                style={[
                    styles.progressBar,
                    { backgroundColor: tokens.colors.surfaceSecondary },
                ]}
            >
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: getColor(),
                        },
                    ]}
                />
            </View>
            <AtomicText type="bodySmall" style={[styles.remaining, { color: tokens.colors.textSecondary }]}>
                {current} {remainingLabel}
            </AtomicText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        fontWeight: "500",
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    count: {
        fontWeight: "600",
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    remaining: {
    },
});
