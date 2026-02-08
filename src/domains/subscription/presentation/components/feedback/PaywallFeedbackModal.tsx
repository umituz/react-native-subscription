import React, { useMemo } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { AtomicText, BaseModal, useAppDesignTokens } from "@umituz/react-native-design-system";
import { usePaywallFeedback } from "../../../../../presentation/hooks/feedback/usePaywallFeedback";
import { createPaywallFeedbackStyles } from "./paywallFeedbackStyles";

const FEEDBACK_OPTION_IDS = [
    "too_expensive",
    "no_need",
    "trying_out",
    "technical_issues",
    "other",
] as const;

export interface PaywallFeedbackTranslations {
    title: string;
    subtitle: string;
    submit: string;
    otherPlaceholder: string;
    reasons: {
        too_expensive: string;
        no_need: string;
        trying_out: string;
        technical_issues: string;
        other: string;
    };
}

export interface PaywallFeedbackModalProps {
    translations: PaywallFeedbackTranslations;
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

export const PaywallFeedbackModal: React.FC<PaywallFeedbackModalProps> = React.memo(({
    translations,
    visible,
    onClose,
    onSubmit,
}) => {
    const tokens = useAppDesignTokens();

    const {
        selectedReason,
        otherText,
        setOtherText,
        selectReason,
        handleSubmit,
        handleSkip,
        canSubmit,
    } = usePaywallFeedback({ onSubmit, onClose });

    const styles = useMemo(
        () => createPaywallFeedbackStyles(tokens, canSubmit),
        [tokens, canSubmit],
    );

    return (
        <BaseModal
            visible={visible}
            onClose={handleSkip}
            title={translations.title}
            subtitle={translations.subtitle}
        >
            <View style={{ paddingHorizontal: tokens.spacing.md, paddingBottom: tokens.spacing.lg }}>
                <View style={[styles.optionsContainer, { backgroundColor: 'transparent', padding: 0 }]}>
                    {FEEDBACK_OPTION_IDS.map((optionId) => {
                        const isSelected = selectedReason === optionId;
                        const isOther = optionId === "other";
                        const showInput = isSelected && isOther;
                        const displayText = translations.reasons[optionId];
                        
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
                                            placeholder={translations.otherPlaceholder}
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
                        {translations.submit}
                    </AtomicText>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
});


