/**
 * Feature Item
 * Single feature row with icon
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon, useAppDesignTokens } from "@umituz/react-native-design-system";

interface FeatureItemProps {
    icon: string;
    text: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = React.memo(({ icon, text }) => {
    const tokens = useAppDesignTokens();

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: tokens.colors.primaryLight }]}>
                <AtomicIcon
                    name={icon || "checkmark-circle"}
                    customSize={16}
                    customColor={tokens.colors.primary}
                />
            </View>
            <AtomicText type="bodyMedium" style={{ color: tokens.colors.textPrimary, flex: 1 }}>
                {text}
            </AtomicText>
        </View>
    );
});

FeatureItem.displayName = "FeatureItem";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
});
