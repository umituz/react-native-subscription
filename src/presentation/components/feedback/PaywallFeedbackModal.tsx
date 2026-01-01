/**
 * Paywall Feedback Modal
 * Collects user feedback when declining paywall
 */

import React, { useMemo } from "react";
    View,
    Modal,
    TouchableOpacity,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
} from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
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
        handleSkip,
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

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleSkip}
        >
            <Pressable onPress={handleSkip} style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior="padding"
                    style={styles.keyboardView}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View style={styles.container}>
                                <View style={styles.header}>
                                    <AtomicText type="headlineMedium" style={styles.title}>
                                        {displayTitle}
                                    </AtomicText>
                                    <AtomicText type="bodyMedium" style={styles.subtitle}>
                                        {displaySubtitle}
                                    </AtomicText>
                                </View>

                                <View style={styles.optionsContainer}>
                                    {FEEDBACK_OPTION_IDS.map((optionId, index) => {
                                        const isSelected = selectedReason === optionId;
                                        const isLast = index === FEEDBACK_OPTION_IDS.length - 1;
                                        const displayText = t(`paywall.feedback.reasons.${optionId}`);

                                        return (
                                            <View key={optionId}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.optionRow,
                                                        isLast && styles.optionRowLast,
                                                    ]}
                                                    onPress={() => selectReason(optionId)}
                                                    activeOpacity={0.7}
                                                >
                                                    <AtomicText
                                                        type="bodyMedium"
                                                        style={[
                                                            styles.optionText,
                                                            isSelected && styles.optionTextSelected,
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

                                                {isSelected && optionId === "other" && (
                                                    <View style={styles.inputContainer}>
                                                        <TextInput
                                                            style={styles.textInput}
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
                                    style={styles.submitButton}
                                    onPress={handleSubmit}
                                    disabled={!canSubmit}
                                    activeOpacity={0.8}
                                >
                                    <AtomicText type="labelLarge" style={styles.submitText}>
                                        {displaySubmitText}
                                    </AtomicText>
                                </TouchableOpacity>
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
});

PaywallFeedbackModal.displayName = "PaywallFeedbackModal";
