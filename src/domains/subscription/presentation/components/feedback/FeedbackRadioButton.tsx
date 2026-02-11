import React from "react";
import { View } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { feedbackOptionStyles } from "./FeedbackOption.styles";

interface FeedbackRadioButtonProps {
  isSelected: boolean;
}

export const FeedbackRadioButton: React.FC<FeedbackRadioButtonProps> = ({ isSelected }) => {
  const tokens = useAppDesignTokens();

  return (
    <View
      style={[
        feedbackOptionStyles.radioButton,
        {
          borderColor: isSelected ? tokens.colors.primary : tokens.colors.border,
          backgroundColor: isSelected ? tokens.colors.primary : "transparent",
        },
      ]}
    >
      {isSelected && (
        <View style={[feedbackOptionStyles.radioButtonInner, { backgroundColor: tokens.colors.primary }]} />
      )}
    </View>
  );
};
