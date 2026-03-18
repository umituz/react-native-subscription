/**
 * Paywall Feedback Screen Component
 *
 * Full-screen feedback form (not modal). Use when you want the feedback
 * form to be a standalone screen instead of a modal overlay.
 * Collects user feedback after they decline the paywall.
 */

import React, { useMemo, useCallback } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system/atoms";
import { useSafeAreaInsets } from "@umituz/react-native-design-system/safe-area";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { usePaywallFeedback } from "../../../../../presentation/hooks/feedback/usePaywallFeedback";
import { FeedbackOption } from "./FeedbackOption";
import type { PaywallFeedbackScreenProps, PaywallFeedbackTranslations } from "./PaywallFeedbackScreen.types";

// Re-export types for convenience
export type { PaywallFeedbackTranslations, PaywallFeedbackScreenProps };

const FEEDBACK_OPTION_IDS = [
    "too_expensive",
    "no_need",
    "trying_out",
    "technical_issues",
    "other",
] as const;

export const PaywallFeedbackScreen: React.FC<PaywallFeedbackScreenProps> = React.memo(({
    translations,
    onClose,
    onSubmit,
}) => {
    const tokens = useAppDesignTokens();
    const insets = useSafeAreaInsets();

    const {
        selectedReason,
        otherText,
        setOtherText,
        selectReason,
        handleSubmit,
        handleSkip,
        canSubmit,
    } = usePaywallFeedback({ onSubmit, onClose });

    const screenStyles = useMemo(() => createScreenStyles(tokens, insets), [tokens, insets]);

    const handleSkipPress = useCallback(() => {
        handleSkip();
    }, [handleSkip]);

    return (
        <View style={[screenStyles.container, { backgroundColor: tokens.colors.backgroundPrimary }]}>
            {/* Close button */}
            <TouchableOpacity
                onPress={handleSkipPress}
                style={[screenStyles.closeBtn, { backgroundColor: tokens.colors.surfaceSecondary, top: Math.max(insets.top, 12) }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <AtomicIcon name="close-outline" size="md" customColor={tokens.colors.textPrimary} />
            </TouchableOpacity>

            {/* Scrollable content */}
            <ScrollView
                style={screenStyles.scrollContainer}
                contentContainerStyle={screenStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={screenStyles.header}>
                    <AtomicText
                        type="headlineMedium"
                        style={[screenStyles.title, { color: tokens.colors.textPrimary }]}
                    >
                        {translations.title}
                    </AtomicText>
                    {translations.subtitle && (
                        <AtomicText
                            type="bodyMedium"
                            style={[screenStyles.subtitle, { color: tokens.colors.textSecondary }]}
                        >
                            {translations.subtitle}
                        </AtomicText>
                    )}
                </View>

                {/* Feedback options */}
                <View style={screenStyles.optionsContainer}>
                    {FEEDBACK_OPTION_IDS.map((optionId) => {
                        const isSelected = selectedReason === optionId;
                        const isOther = optionId === "other";
                        const showInput = isSelected && isOther;

                        return (
                            <FeedbackOption
                                key={optionId}
                                isSelected={isSelected}
                                text={translations.reasons[optionId]}
                                showInput={showInput}
                                placeholder={translations.otherPlaceholder}
                                inputValue={otherText}
                                onSelect={() => selectReason(optionId)}
                                onChangeText={setOtherText}
                            />
                        );
                    })}
                </View>
            </ScrollView>

            {/* Sticky footer - Submit button */}
            <View style={[screenStyles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity
                    style={[
                        screenStyles.submitButton,
                        {
                            backgroundColor: canSubmit ? tokens.colors.primary : tokens.colors.surfaceSecondary,
                            opacity: canSubmit ? 1 : 0.6,
                        }
                    ]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.8}
                >
                    <AtomicText
                        type="titleLarge"
                        style={[
                            screenStyles.submitText,
                            { color: canSubmit ? tokens.colors.onPrimary : tokens.colors.textDisabled }
                        ]}
                    >
                        {translations.submit}
                    </AtomicText>
                </TouchableOpacity>
            </View>
        </View>
    );
});

PaywallFeedbackScreen.displayName = "PaywallFeedbackScreen";

const createScreenStyles = (
    tokens: {
        colors: { backgroundPrimary: string; border: string; onPrimary: string; textDisabled: string; surfaceSecondary: string; primary: string };
        spacing: { xl: number; sm: number; md: number; lg: number };
    },
    _insets: { top: number; bottom: number }
) => ({
    container: {
        flex: 1,
        opacity: 1,
    },
    closeBtn: {
        position: 'absolute' as const,
        top: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        zIndex: 1000,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 80,
        paddingBottom: 120,
    },
    header: {
        paddingHorizontal: tokens.spacing.xl,
        marginBottom: tokens.spacing.xl + 8,
    },
    title: {
        marginBottom: tokens.spacing.md + 4,
    },
    subtitle: {
        lineHeight: 24,
    },
    optionsContainer: {
        paddingHorizontal: tokens.spacing.xl,
        gap: tokens.spacing.md,
    },
    footer: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: tokens.spacing.xl,
        paddingTop: tokens.spacing.lg,
        paddingBottom: tokens.spacing.lg,
        backgroundColor: tokens.colors.backgroundPrimary,
        borderTopWidth: 1,
        borderTopColor: tokens.colors.border,
        opacity: 1,
    },
    submitButton: {
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center' as const,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    submitText: {
        fontWeight: "700" as const,
        fontSize: 17,
        letterSpacing: 0.3,
    },
});
