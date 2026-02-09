/**
 * Paywall Feedback Styles
 * Generates styles based on design tokens
 */

import { StyleSheet } from "react-native";
import type { DesignTokens } from "@umituz/react-native-design-system";

export const createPaywallFeedbackStyles = (
    tokens: DesignTokens,
    canSubmit: boolean
) => {
    return StyleSheet.create({
        optionsContainer: {
            backgroundColor: tokens.colors.surfaceSecondary,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 20,
        },
        submitButton: {
            backgroundColor: canSubmit ? tokens.colors.primary : tokens.colors.surfaceSecondary,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            opacity: canSubmit ? 1 : 0.6,
        },
        submitText: {
            color: canSubmit ? tokens.colors.onPrimary : tokens.colors.textDisabled,
            fontWeight: "600",
        },
    });
};
