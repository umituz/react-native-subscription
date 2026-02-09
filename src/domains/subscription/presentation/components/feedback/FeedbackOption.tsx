/**
 * Feedback Option Component
 * Single feedback option with radio button and optional text input
 */

import React from "react";
import { View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";

interface FeedbackOptionProps {
  isSelected: boolean;
  text: string;
  showInput: boolean;
  placeholder: string;
  inputValue: string;
  onSelect: () => void;
  onChangeText: (text: string) => void;
}

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
          styles.optionRow,
          {
            borderBottomWidth: showInput ? 1 : 0,
            borderBottomColor: tokens.colors.border,
            paddingVertical: tokens.spacing.md,
            paddingHorizontal: tokens.spacing.md,
          },
        ]}
        onPress={onSelect}
        activeOpacity={0.7}
      >
        <AtomicText
          type="bodyMedium"
          style={[
            styles.optionText,
            isSelected && { color: tokens.colors.primary, fontWeight: "600" },
          ]}
        >
          {text}
        </AtomicText>

        <View
          style={[
            styles.radioButton,
            {
              borderColor: isSelected ? tokens.colors.primary : tokens.colors.border,
              backgroundColor: isSelected ? tokens.colors.primary : "transparent",
            },
          ]}
        >
          {isSelected && (
            <View style={[styles.radioButtonInner, { backgroundColor: tokens.colors.primary }]} />
          )}
        </View>
      </TouchableOpacity>

      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: tokens.colors.surface,
                borderRadius: tokens.borderRadius.sm,
                padding: tokens.spacing.sm,
                color: tokens.colors.textPrimary,
                minHeight: 80,
                textAlignVertical: "top",
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={tokens.colors.textTertiary}
            multiline
            maxLength={200}
            value={inputValue}
            onChangeText={onChangeText}
            autoFocus
          />
        </View>
      )}
    </View>
  );
});

FeedbackOption.displayName = "FeedbackOption";

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    flex: 1,
    marginRight: 12,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inputContainer: {
    padding: 12,
  },
  textInput: {
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
