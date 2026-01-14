/**
 * Paywall Feedback Modal
 * Collects user feedback when declining paywall
 */

import React, { useMemo } from "react";
import {
    View,
    Modal,
    TouchableOpacity,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
} from "react-native";
import { AtomicText, BaseModal } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { useLocalization } from "@umituz/react-native-localization";
import { usePaywallFeedback } from "../../hooks/feedback/usePaywallFeedback";
import { createPaywallFeedbackStyles } from "./paywallFeedbackStyles";

const FEEDBACK_OPTION_IDS = [
    "too_expensive",
    "no_need",
    "trying_out",
    "technical_issues",
    "other",
] as const;

export interface PaywallFeedbackModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    title?: string;
    subtitle?: string;
    submitText?: string;
    otherPlaceholder?: string;
}

export const PaywallFeedbackModal: React.FC<PaywallFeedbackModalProps> = React.memo(({
    visible,
    onClose,
    onSubmit,
    title,
    subtitle,
    submitText,
    otherPlaceholder,
}) => {
    const { t } = useLocalization();
    const tokens = useAppDesignTokens();

    const {
        selectedReason,
        otherText,
        setOtherText,
        selectReason,
        handleSubmit,
        handleSkip, // BaseModal's onClose will handle skipping
        canSubmit,
    } = usePaywallFeedback({ onSubmit, onClose });

    const styles = useMemo(
        () => createPaywallFeedbackStyles(tokens, canSubmit),
        [tokens, canSubmit],
    );

    const displayTitle = title || t("paywall.feedback.title");
    const displaySubtitle = subtitle || t("paywall.feedback.subtitle");
    const displaySubmitText = submitText || t("paywall.feedback.submit");
    const displayOtherPlaceholder = otherPlaceholder || t("paywall.feedback.otherPlaceholder");

    // BaseModal from design system handles animations, safe areas, keyboard avoiding, and overlay backdrop
    return (
        <BaseModal
            visible={visible}
            onClose={handleSkip}
            title={displayTitle}
            swipeToClose={true}
        >
            <View style={{ paddingBottom: tokens.spacing.lg }}>
                <AtomicText type="bodyMedium" style={[styles.subtitle, { marginBottom: tokens.spacing.md }]}>
                    {displaySubtitle}
                </AtomicText>

                <View style={[styles.optionsContainer, { backgroundColor: 'transparent', padding: 0 }]}>
                    {FEEDBACK_OPTION_IDS.map((optionId, index) => {
                        const isSelected = selectedReason === optionId;
                        const isOther = optionId === "other";
                        const showInput = isSelected && isOther;
                        const displayText = t(`paywall.feedback.reasons.${optionId}`);
                        
                        // Dynamic styles for the container
                        const containerStyle = {
                            marginBottom: tokens.spacing.sm,
                            backgroundColor: tokens.colors.surfaceVariant,
                            borderRadius: tokens.borderRadius.md,
                            overflow: 'hidden' as const, // Ensure children don't bleed out
                        };

                        return (
                            <View key={optionId} style={containerStyle}>
                                <TouchableOpacity
                                    style={{
                                        borderBottomWidth: showInput ? 1 : 0,
                                        borderBottomColor: tokens.colors.surface, // Subtle separator
                                        paddingVertical: tokens.spacing.md,
                                        paddingHorizontal: tokens.spacing.md,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                    onPress={() => selectReason(optionId)}
                                    activeOpacity={0.7}
                                >
                                    <AtomicText
                                        type="bodyMedium"
                                        style={[
                                            styles.optionText,
                                            isSelected && { color: tokens.colors.primary, fontWeight: '600' },
                                        ]}
                                    >
                                        {displayText}
                                    </AtomicText>

                                    <View
                                        style={[
                                            styles.radioButton,
                                            isSelected && styles.radioButtonSelected,
                                        ]}
                                    >
                                        {isSelected && (
                                            <View style={styles.radioButtonInner} />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                {showInput && (
                                    <View style={[styles.inputContainer, { backgroundColor: 'transparent', marginTop: 0, padding: tokens.spacing.sm }]}>
                                        <TextInput
                                            style={[
                                                styles.textInput, 
                                                { 
                                                    minHeight: 80, 
                                                    textAlignVertical: 'top',
                                                    backgroundColor: tokens.colors.surface, // Slightly different background for input
                                                    borderRadius: tokens.borderRadius.sm,
                                                    padding: tokens.spacing.sm,
                                                }
                                            ]}
                                            placeholder={displayOtherPlaceholder}
                                            placeholderTextColor={tokens.colors.textTertiary}
                                            multiline
                                            maxLength={200}
                                            value={otherText}
                                            onChangeText={setOtherText}
                                            autoFocus
                                        />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, { marginTop: tokens.spacing.lg }]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.8}
                >
                    <AtomicText type="labelLarge" style={styles.submitText}>
                        {displaySubmitText}
                    </AtomicText>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
});


