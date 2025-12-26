/**
 * Subscription Header Component
 * Displays status badge and subscription details
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import {
    PremiumStatusBadge,
    type SubscriptionStatusType,
} from "../../components/details/PremiumStatusBadge";

interface SubscriptionHeaderTranslations {
    title: string;
    statusLabel: string;
    statusActive: string;
    statusExpired: string;
    statusFree: string;
    statusCanceled: string;
    expiresLabel: string;
    purchasedLabel: string;
    lifetimeLabel: string;
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
                <View style={styles.titleContainer}>
                    <AtomicText type="headlineSmall" style={[styles.title, { color: tokens.colors.textPrimary }]}>
                        {translations.title}
                    </AtomicText>
                </View>
                <PremiumStatusBadge
                    status={statusType}
                    activeLabel={translations.statusActive}
                    expiredLabel={translations.statusExpired}
                    noneLabel={translations.statusFree}
                    canceledLabel={translations.statusCanceled}
                />
            </View>

            {isPremium && (
                <View style={styles.details}>
                    {isLifetime ? (
                        <DetailRow
                            label={translations.statusLabel}
                            value={translations.lifetimeLabel}
                            tokens={tokens}
                        />
                    ) : (
                        <>
                            {expirationDate && (
                                <DetailRow
                                    label={translations.expiresLabel}
                                    value={expirationDate}
                                    highlight={showExpiring}
                                    tokens={tokens}
                                />
                            )}
                            {purchaseDate && (
                                <DetailRow
                                    label={translations.purchasedLabel}
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
        <AtomicText type="bodyMedium" style={[styles.label, { color: tokens.colors.textSecondary }]}>
            {label}
        </AtomicText>
        <AtomicText
            type="bodyMedium"
            style={[
                styles.value,
                { color: highlight ? tokens.colors.warning : tokens.colors.textPrimary },
            ]}
        >
            {value}
        </AtomicText>
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
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
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
        gap: 16,
    },
    label: {
        flex: 1,
    },
    value: {
        fontWeight: "600",
        textAlign: "right",
    },
});
