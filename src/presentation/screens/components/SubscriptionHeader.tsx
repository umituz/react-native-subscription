/**
 * Subscription Header Component
 * Displays status badge and subscription details
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import {
    PremiumStatusBadge,
    type SubscriptionStatusType,
} from "../../components/details/PremiumStatusBadge";

interface SubscriptionHeaderTranslations {
    title: string;
    statusLabel?: string;
    statusActive?: string;
    statusExpired?: string;
    statusFree?: string;
    expiresLabel?: string;
    purchasedLabel?: string;
    lifetimeLabel?: string;
}

interface SubscriptionHeaderProps {
    statusType: SubscriptionStatusType;
    isPremium: boolean;
    isLifetime?: boolean;
    expirationDate?: string | null;
    purchaseDate?: string | null;
    daysRemaining?: number | null;
    translations: SubscriptionHeaderTranslations;
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
    statusType,
    isPremium,
    isLifetime,
    expirationDate,
    purchaseDate,
    daysRemaining,
    translations,
}) => {
    const tokens = useAppDesignTokens();
    const showExpiring =
        daysRemaining !== null &&
        daysRemaining !== undefined &&
        daysRemaining <= 7;

    return (
        <View style={[styles.container, { backgroundColor: tokens.colors.surface }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: tokens.colors.textPrimary }]}>
                    {translations.title}
                </Text>
                <PremiumStatusBadge
                    status={statusType}
                    activeLabel={translations.statusActive}
                    expiredLabel={translations.statusExpired}
                    noneLabel={translations.statusFree}
                />
            </View>

            {isPremium && (
                <View style={styles.details}>
                    {isLifetime ? (
                        <DetailRow
                            label={translations.statusLabel || "Subscription"}
                            value={translations.lifetimeLabel || "Lifetime Access"}
                            tokens={tokens}
                        />
                    ) : (
                        <>
                            {expirationDate && (
                                <DetailRow
                                    label={translations.expiresLabel || "Expires"}
                                    value={expirationDate}
                                    highlight={showExpiring}
                                    tokens={tokens}
                                />
                            )}
                            {purchaseDate && (
                                <DetailRow
                                    label={translations.purchasedLabel || "Purchased"}
                                    value={purchaseDate}
                                    tokens={tokens}
                                />
                            )}
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

interface DetailRowProps {
    label: string;
    value: string;
    highlight?: boolean;
    tokens: ReturnType<typeof useAppDesignTokens>;
}

const DetailRow: React.FC<DetailRowProps> = ({
    label,
    value,
    highlight,
    tokens,
}) => (
    <View style={styles.row}>
        <Text style={[styles.label, { color: tokens.colors.textSecondary }]}>
            {label}
        </Text>
        <Text
            style={[
                styles.value,
                { color: highlight ? tokens.colors.warning : tokens.colors.textPrimary },
            ]}
        >
            {value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
    },
    details: {
        gap: 12,
        paddingTop: 12,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        fontSize: 15,
    },
    value: {
        fontSize: 15,
        fontWeight: "600",
    },
});
