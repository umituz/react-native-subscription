import React, { useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { AtomicText, BaseModal, useAppDesignTokens } from "@umituz/react-native-design-system";
import { usePaywallFeedback } from "../../../../../presentation/hooks/feedback/usePaywallFeedback";
import { createPaywallFeedbackStyles } from "./paywallFeedbackStyles";
import { FeedbackOption } from "./FeedbackOption";

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

PaywallFeedbackModal.displayName = "PaywallFeedbackModal";



