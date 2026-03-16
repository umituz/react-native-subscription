/**
 * Paywall Feedback Screen Component
 *
 * Full-screen feedback form (not modal). Use when you want the feedback
 * form to be a standalone screen instead of a modal overlay.
 * Collects user feedback after they decline the paywall.
 */

import React, { useMemo, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system/atoms";
import { useSafeAreaInsets } from "@umituz/react-native-design-system/safe-area";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { usePaywallFeedback } from "../../../../../presentation/hooks/feedback/usePaywallFeedback";
import { FeedbackOption } from "./FeedbackOption";
import type { PaywallFeedbackScreenProps } from "./PaywallFeedbackScreen.types";
import type { PaywallFeedbackTranslations } from "./PaywallFeedbackModal.types";

// Re-export translations type for convenience
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
                            backgroundColor: canSubmit ? tokens.colors.primary : tokens.colors.surfaceVariant,
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

const createScreenStyles = (tokens: any, insets: any) => ({
    container: {
        flex: 1,
    },
    closeBtn: {
        position: 'absolute' as const,
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        zIndex: 1000,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: tokens.spacing.xl,
        marginBottom: tokens.spacing.xl,
    },
    title: {
        marginBottom: tokens.spacing.sm,
    },
    subtitle: {
        lineHeight: 22,
    },
    optionsContainer: {
        paddingHorizontal: tokens.spacing.xl,
    },
    footer: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: tokens.spacing.xl,
        paddingTop: tokens.spacing.md,
        backgroundColor: tokens.colors.backgroundPrimary,
        borderTopWidth: 1,
        borderTopColor: tokens.colors.border,
    },
    submitButton: {
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center' as const,
    },
    submitText: {
        fontWeight: 600,
    },
});
