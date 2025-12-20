/**
 * Credits List Component
 * Displays list of credit usages
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { CreditItem } from "./CreditItem";
import type { CreditInfo } from "../../components/details/PremiumDetailsCard";

interface CreditsListProps {
    credits: CreditInfo[];
    title?: string;
    description?: string;
    remainingLabel?: string;
}

export const CreditsList: React.FC<CreditsListProps> = ({
    credits,
    title,
    description,
    remainingLabel,
}) => {
    const tokens = useAppDesignTokens();

    return (
        <View style={[styles.container, { backgroundColor: tokens.colors.surface }]}>
            {title && (
                <Text style={[styles.title, { color: tokens.colors.textPrimary }]}>
                    {title}
                </Text>
            )}
            {description && (
                <Text style={[styles.description, { color: tokens.colors.textSecondary }]}>
                    {description}
                </Text>
            )}
            <View style={styles.list}>
                {credits.map((credit) => (
                    <CreditItem
                        key={credit.id}
                        label={credit.label}
                        current={credit.current}
                        total={credit.total}
                        remainingLabel={remainingLabel}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    description: {
        fontSize: 14,
        marginTop: -8,
    },
    list: {
        gap: 16,
    },
});
