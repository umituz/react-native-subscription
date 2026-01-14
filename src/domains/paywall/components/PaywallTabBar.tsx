/**
 * Paywall Tab Bar
 * Segmented control for hybrid mode
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PaywallTabType } from '../entities';

interface PaywallTabBarProps {
    activeTab: PaywallTabType;
    onTabChange: (tab: PaywallTabType) => void;
    creditsLabel: string;
    subscriptionLabel: string;
}

export const PaywallTabBar: React.FC<PaywallTabBarProps> = React.memo(
    ({ activeTab, onTabChange, creditsLabel, subscriptionLabel }) => {
        const tokens = useAppDesignTokens();
        const isCreditsActive = activeTab === "credits";

        const renderTab = (tab: PaywallTabType, label: string) => {
            const isActive = activeTab === tab;

            return (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        isActive ? { backgroundColor: tokens.colors.surface } : undefined,
                    ]}
                    onPress={() => onTabChange(tab)}
                    activeOpacity={0.7}
                >
                    <AtomicText
                        type="labelLarge"
                        style={[
                            styles.tabText,
                            { color: isActive ? tokens.colors.primary : tokens.colors.textSecondary },
                        ]}
                    >
                        {label}
                    </AtomicText>
                </TouchableOpacity>
            );
        };

        return (
            <View style={[styles.container, { backgroundColor: tokens.colors.surfaceSecondary }]}>
                {renderTab("credits", creditsLabel)}
                {renderTab("subscription", subscriptionLabel)}
            </View>
        );
    }
);

PaywallTabBar.displayName = "PaywallTabBar";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 4,
        marginHorizontal: 24,
        marginBottom: 16,
        height: 44,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    tabText: {
        fontWeight: "600",
    },
});
