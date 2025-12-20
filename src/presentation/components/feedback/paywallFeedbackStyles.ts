/**
 * Paywall Feedback Styles
 * Generates styles based on design tokens
 */

import { StyleSheet } from "react-native";
import type { DesignTokens } from "@umituz/react-native-design-system";

export const createPaywallFeedbackStyles = (
    tokens: DesignTokens,
    canSubmit: boolean
) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },
        keyboardView: {
            width: "100%",
            alignItems: "center",
        },
        container: {
            width: "100%",
            maxWidth: 360,
            backgroundColor: tokens.colors.surface,
            borderRadius: 24,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
        },
        header: {
            alignItems: "center",
            marginBottom: 20,
        },
        title: {
            color: tokens.colors.textPrimary,
            marginBottom: 8,
            textAlign: "center",
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
        },
        optionsContainer: {
            backgroundColor: tokens.colors.surfaceSecondary,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 20,
        },
        optionRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: tokens.colors.border,
        },
        optionRowLast: {
            borderBottomWidth: 0,
        },
        optionText: {
            color: tokens.colors.textSecondary,
            flex: 1,
            marginRight: 12,
        },
        optionTextSelected: {
            color: tokens.colors.textPrimary,
            fontWeight: "600",
        },
        radioButton: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: tokens.colors.border,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
        },
        radioButtonSelected: {
            borderColor: tokens.colors.primary,
            borderWidth: 2,
        },
        radioButtonInner: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: tokens.colors.primary,
        },
        inputContainer: {
            paddingHorizontal: 16,
            paddingBottom: 16,
        },
        textInput: {
            backgroundColor: tokens.colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            padding: 12,
            fontSize: 15,
            color: tokens.colors.textPrimary,
            minHeight: 80,
            textAlignVertical: "top",
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
