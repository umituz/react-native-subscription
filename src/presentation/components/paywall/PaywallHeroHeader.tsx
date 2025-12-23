/**
 * Paywall Hero Header Component
 * Header with gradient background - theme aware
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
    AtomicText,
    AtomicIcon,
    useDesignSystemTheme,
    useAppDesignTokens,
} from "@umituz/react-native-design-system";

interface PaywallHeroHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
}

export const PaywallHeroHeader: React.FC<PaywallHeroHeaderProps> = React.memo(
    ({ title, subtitle, onClose }) => {
        const tokens = useAppDesignTokens();
        const { themeMode } = useDesignSystemTheme();
        const isDark = themeMode === "dark";

        const gradientColors: readonly [string, string, string] = isDark
            ? [tokens.colors.background, tokens.colors.surfaceSecondary, tokens.colors.surface]
            : [tokens.colors.primary, tokens.colors.primaryDark, tokens.colors.primary];

        return (
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={[styles.decorativeCircle, styles.circle1]} />
                <View style={[styles.decorativeCircle, styles.circle2]} />

                <TouchableOpacity
                    onPress={onClose}
                    style={[
                        styles.closeButton,
                        {
                            backgroundColor: isDark
                                ? tokens.colors.surfaceSecondary
                                : tokens.colors.onPrimary,
                        },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <AtomicIcon
                        name="close-outline"
                        size="md"
                        customColor={isDark ? tokens.colors.textPrimary : tokens.colors.primary}
                    />
                </TouchableOpacity>

                <View style={styles.content}>
                    <AtomicText
                        type="headlineLarge"
                        style={[styles.title, { color: tokens.colors.onPrimary }]}
                    >
                        {title}
                    </AtomicText>
                    {subtitle && (
                        <AtomicText
                            type="bodyLarge"
                            style={[styles.subtitle, { color: tokens.colors.onPrimary }]}
                        >
                            {subtitle}
                        </AtomicText>
                    )}
                </View>

                <View style={[styles.wave, { backgroundColor: tokens.colors.background }]} />
            </LinearGradient>
        );
    }
);

PaywallHeroHeader.displayName = "PaywallHeroHeader";

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        position: "relative",
        overflow: "hidden",
    },
    decorativeCircle: {
        position: "absolute",
        borderRadius: 9999,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    circle1: {
        width: 200,
        height: 200,
        top: -100,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        bottom: -75,
        left: -40,
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    content: {
        alignItems: "center",
        zIndex: 1,
    },
    title: {
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        textAlign: "center",
        opacity: 0.9,
    },
    wave: {
        position: "absolute",
        bottom: -1,
        left: 0,
        right: 0,
        height: 30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
});
