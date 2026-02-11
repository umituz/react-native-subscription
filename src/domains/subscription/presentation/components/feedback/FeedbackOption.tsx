import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";
import type { FeedbackOptionProps } from "./FeedbackOption.types";
import { feedbackOptionStyles } from "./FeedbackOption.styles";
import { FEEDBACK_OPTION_OPACITY } from "./feedbackOptionConstants";
import { FeedbackRadioButton } from "./FeedbackRadioButton";
import { FeedbackTextInput } from "./FeedbackTextInput";

export type { FeedbackOptionProps } from "./FeedbackOption.types";

export const FeedbackOption: React.FC<FeedbackOptionProps> = React.memo(({
  isSelected,
  text,
  showInput,
  placeholder,
  inputValue,
  onSelect,
  onChangeText,
}) => {
  const tokens = useAppDesignTokens();

  const containerStyle = {
    marginBottom: tokens.spacing.sm,
    backgroundColor: tokens.colors.surfaceVariant,
    borderRadius: tokens.borderRadius.md,
    overflow: "hidden" as const,
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={[
          feedbackOptionStyles.optionRow,
          {
            borderBottomWidth: showInput ? 1 : 0,
            borderBottomColor: tokens.colors.border,
            paddingVertical: tokens.spacing.md,
            paddingHorizontal: tokens.spacing.md,
          },
        ]}
        onPress={onSelect}
        activeOpacity={FEEDBACK_OPTION_OPACITY}
      >
        <AtomicText
          type="bodyMedium"
          style={[feedbackOptionStyles.optionText, isSelected && { color: tokens.colors.primary, fontWeight: "600" }]}
        >
          {text}
        </AtomicText>

        <FeedbackRadioButton isSelected={isSelected} />
      </TouchableOpacity>

      {showInput && <FeedbackTextInput placeholder={placeholder} value={inputValue} onChangeText={onChangeText} />}
    </View>
  );
});

FeedbackOption.displayName = "FeedbackOption";
