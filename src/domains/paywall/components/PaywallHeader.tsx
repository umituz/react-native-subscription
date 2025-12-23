/**
 * Paywall Header
 * Header with gradient, close button, title and subtitle
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

interface PaywallHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
}

export const PaywallHeader: React.FC<PaywallHeaderProps> = React.memo(
    ({ title, subtitle, onClose }) => {
        const tokens = useAppDesignTokens();
        const { themeMode } = useDesignSystemTheme();
        const isDark = themeMode === "dark";

        const gradientColors: readonly [string, string] = isDark
            ? [tokens.colors.surface, tokens.colors.surfaceSecondary]
            : [tokens.colors.primary, tokens.colors.primaryDark];

        return (
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeButton, { backgroundColor: tokens.colors.onPrimary }]}
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

PaywallHeader.displayName = "PaywallHeader";

const styles = StyleSheet.create({
    container: {
        paddingTop: 56,
        paddingBottom: 36,
        paddingHorizontal: 24,
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        top: 48,
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
        height: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
});
