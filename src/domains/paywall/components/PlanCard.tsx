/**
 * Plan Card
 * Subscription plan selection card (Apple-compliant)
 *
 * Apple Guideline 3.1.2 Compliance:
 * - Price is the most prominent element
 * - Trial info is displayed in subordinate position and size
 * - No toggle for enabling/disabling trial
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon, AtomicBadge, useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PurchasesPackage } from "react-native-purchases";

import { formatPrice } from '../../../utils/priceUtils';

interface PlanCardProps {
    pkg: PurchasesPackage;
    isSelected: boolean;
    onSelect: () => void;
    /** Badge text (e.g., "Best Value") - NOT for trial */
    badge?: string;
    creditAmount?: number;
    creditsLabel?: string;
    /** Whether this plan has a free trial (Apple-compliant display) */
    hasFreeTrial?: boolean;
    /** Trial subtitle text (e.g., "7 days free, then billed") - shown as small gray text */
    trialSubtitleText?: string;
}

export const PlanCard: React.FC<PlanCardProps> = React.memo(
    ({ pkg, isSelected, onSelect, badge, creditAmount, creditsLabel, hasFreeTrial, trialSubtitleText }) => {
        const tokens = useAppDesignTokens();
        const title = pkg.product.title;
        const price = formatPrice(pkg.product.price, pkg.product.currencyCode);

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
                    {/* Badge for "Best Value" etc. - NOT for trial (Apple compliance) */}
                    {badge && (
                        <View style={styles.badgeContainer}>
                            <AtomicBadge text={badge} variant="primary" size="sm" />
                        </View>
                    )}

                    <View style={styles.content}>
                        <View style={styles.leftSection}>
                            <View
                                style={[
                                    styles.radio,
                                    {
                                        borderColor: isSelected ? tokens.colors.primary : tokens.colors.border,
                                        backgroundColor: isSelected ? tokens.colors.primary : "transparent",
                                    },
                                ]}
                            >
                                {isSelected && (
                                    <AtomicIcon name="checkmark-circle-outline" customSize={12} customColor={tokens.colors.onPrimary} />
                                )}
                            </View>

                            <View style={styles.textSection}>
                                <AtomicText type="titleSmall" style={{ color: tokens.colors.textPrimary, fontWeight: "600" }}>
                                    {title}
                                </AtomicText>

                                {/* Credits info */}
                                {creditAmount && creditsLabel && (
                                    <AtomicText type="bodySmall" style={{ color: tokens.colors.textSecondary }}>
                                        {creditAmount} {creditsLabel}
                                    </AtomicText>
                                )}

                                {/* Trial info - Apple-compliant: small, gray, subordinate */}
                                {hasFreeTrial && trialSubtitleText && (
                                    <AtomicText
                                        type="bodySmall"
                                        style={{
                                            color: tokens.colors.textTertiary ?? tokens.colors.textSecondary,
                                            fontSize: 11,
                                            marginTop: 2,
                                        }}
                                    >
                                        {trialSubtitleText}
                                    </AtomicText>
                                )}
                            </View>
                        </View>

                        {/* Price - MOST PROMINENT (Apple compliance) */}
                        <AtomicText
                            type="titleMedium"
                            style={{
                                color: isSelected ? tokens.colors.primary : tokens.colors.textPrimary,
                                fontWeight: "700",
                                fontSize: 18,
                            }}
                        >
                            {price}
                        </AtomicText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
);

PlanCard.displayName = "PlanCard";

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
        alignItems: "center",
        justifyContent: "space-between",
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    textSection: {
        flex: 1,
    },
});
