/**
 * Paywall Tab Bar
 * Segmented control for hybrid mode
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
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
        const animatedValue = React.useRef(
            new Animated.Value(activeTab === "credits" ? 0 : 1)
        ).current;

        React.useEffect(() => {
            Animated.spring(animatedValue, {
                toValue: activeTab === "credits" ? 0 : 1,
                useNativeDriver: false,
                tension: 68,
                friction: 12,
            }).start();
        }, [activeTab, animatedValue]);

        const renderTab = (tab: PaywallTabType, label: string) => {
            const isActive = activeTab === tab;

            return (
                <TouchableOpacity
                    key={tab}
                    style={styles.tab}
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

        const indicatorLeft = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["2%", "50%"],
        });

        return (
            <View style={[styles.container, { backgroundColor: tokens.colors.surfaceSecondary }]}>
                <Animated.View
                    style={[styles.indicator, { backgroundColor: tokens.colors.surface, left: indicatorLeft }]}
                />
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
        position: "relative",
        height: 44,
    },
    indicator: {
        position: "absolute",
        top: 4,
        bottom: 4,
        width: "46%",
        borderRadius: 8,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    tabText: {
        fontWeight: "600",
    },
});
