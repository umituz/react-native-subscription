/**
 * Credit Card
 * Credit package selection card
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon, AtomicBadge, useAppDesignTokens } from "@umituz/react-native-design-system";
import type { CreditsPackage } from "@domains/paywall/entities";

import { formatPrice } from "@utils/priceUtils";

interface CreditCardProps {
    pkg: CreditsPackage;
    isSelected: boolean;
    onSelect: () => void;
}

export const CreditCard: React.FC<CreditCardProps> = React.memo(({ pkg, isSelected, onSelect }) => {
    const tokens = useAppDesignTokens();
    const totalCredits = pkg.credits + (pkg.bonus ?? 0);
    const price = formatPrice(pkg.price, pkg.currency);

    return (
        <TouchableOpacity onPress={onSelect} activeOpacity={0.7} style={styles.touchable}>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: tokens.colors.surface,
                        borderColor: isSelected ? tokens.colors.primary : tokens.colors.border,
                        borderWidth: isSelected ? 2 : 1,
                    },
                ]}
            >
                {pkg.badge && (
                    <View style={styles.badgeContainer}>
                        <AtomicBadge text={pkg.badge} variant="warning" size="sm" />
                    </View>
                )}

                <View style={styles.content}>
                    <View style={styles.leftSection}>
                        <AtomicIcon name="flash" size="md" color={isSelected ? "primary" : "secondary"} />
                        <AtomicText
                            type="headlineSmall"
                            style={[styles.credits, { color: isSelected ? tokens.colors.primary : tokens.colors.textPrimary }]}
                        >
                            {totalCredits.toLocaleString()}
                        </AtomicText>
                    </View>

                    <View style={styles.rightSection}>
                        <AtomicText
                            type="titleLarge"
                            style={[styles.price, { color: isSelected ? tokens.colors.primary : tokens.colors.textPrimary }]}
                        >
                            {price}
                        </AtomicText>
                        {isSelected && <AtomicIcon name="checkmark-circle" size="md" color="primary" />}
                    </View>
                </View>

                {(pkg.bonus ?? 0) > 0 && (
                    <View style={styles.bonusRow}>
                        <AtomicIcon name="gift-outline" size="sm" color="success" />
                        <AtomicText type="bodySmall" style={{ color: tokens.colors.success, marginLeft: 4 }}>
                            +{pkg.bonus}
                        </AtomicText>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});

CreditCard.displayName = "CreditCard";

const styles = StyleSheet.create({
    touchable: {
        marginBottom: 10,
        marginHorizontal: 24,
    },
    container: {
        borderRadius: 16,
        padding: 16,
        position: "relative",
    },
    badgeContainer: {
        position: "absolute",
        top: -10,
        right: 16,
    },
    content: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    credits: {
        fontWeight: "700",
        marginLeft: 8,
    },
    rightSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    price: {
        fontWeight: "700",
        marginRight: 8,
    },
    bonusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
});
