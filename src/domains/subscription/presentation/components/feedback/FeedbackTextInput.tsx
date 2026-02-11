import React from "react";
import { View, TextInput } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { feedbackOptionStyles } from "./FeedbackOption.styles";
import { FEEDBACK_INPUT_MAX_LENGTH, FEEDBACK_INPUT_MIN_HEIGHT } from "./feedbackOptionConstants";

interface FeedbackTextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const FeedbackTextInput: React.FC<FeedbackTextInputProps> = ({ placeholder, value, onChangeText }) => {
  const tokens = useAppDesignTokens();

  return (
    <View style={feedbackOptionStyles.inputContainer}>
      <TextInput
        style={[
          feedbackOptionStyles.textInput,
          {
            backgroundColor: tokens.colors.surface,
            borderRadius: tokens.borderRadius.sm,
            padding: tokens.spacing.sm,
            color: tokens.colors.textPrimary,
            minHeight: FEEDBACK_INPUT_MIN_HEIGHT,
            textAlignVertical: "top",
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.textTertiary}
        multiline
        maxLength={FEEDBACK_INPUT_MAX_LENGTH}
        value={value}
        onChangeText={onChangeText}
        autoFocus
      />
    </View>
  );
};
