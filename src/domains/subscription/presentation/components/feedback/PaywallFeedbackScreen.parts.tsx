/**
 * Paywall Feedback Screen Parts
 * Sub-components extracted for better maintainability
 */

import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AtomicText, AtomicIcon } from "@umituz/react-native-design-system/atoms";
import { FeedbackOption } from "./FeedbackOption";
import type { PaywallFeedbackTranslations } from "./PaywallFeedbackScreen.types";

// ============================================================================
// CLOSE BUTTON
// ============================================================================

interface FeedbackCloseButtonProps {
  onPress: () => void;
  topInset: number;
  backgroundColor: string;
  iconColor: string;
}

export const FeedbackCloseButton: React.FC<FeedbackCloseButtonProps> = ({
  onPress,
  topInset,
  backgroundColor,
  iconColor,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[{
      position: 'absolute',
      top: Math.max(topInset, 12),
      right: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
    }, { backgroundColor }]}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <AtomicIcon name="close-outline" size="md" customColor={iconColor} />
  </TouchableOpacity>
);

// ============================================================================
// HEADER
// ============================================================================

interface FeedbackHeaderProps {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  style: any;
}

export const FeedbackHeader: React.FC<FeedbackHeaderProps> = ({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  style,
}) => (
  <View style={style}>
    <AtomicText
      type="headlineMedium"
      style={[{
        marginBottom: 12,
      }, { color: titleColor }]}
    >
      {title}
    </AtomicText>
    {subtitle && (
      <AtomicText
        type="bodyMedium"
        style={[{
          lineHeight: 24,
        }, { color: subtitleColor }]}
      >
        {subtitle}
      </AtomicText>
    )}
  </View>
);

// ============================================================================
// OPTIONS LIST
// ============================================================================

const FEEDBACK_OPTION_IDS = [
  "too_expensive",
  "no_need",
  "trying_out",
  "technical_issues",
  "other",
] as const;

interface FeedbackOptionsListProps {
  translations: PaywallFeedbackTranslations;
  selectedReason: string | null;
  otherText: string;
  onSelectReason: (reason: string) => void;
  onSetOtherText: (text: string) => void;
}

export const FeedbackOptionsList: React.FC<FeedbackOptionsListProps> = ({
  translations,
  selectedReason,
  otherText,
  onSelectReason,
  onSetOtherText,
}) => (
  <View style={{ gap: 12 }}>
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
          onSelect={() => onSelectReason(optionId)}
          onChangeText={onSetOtherText}
        />
      );
    })}
  </View>
);

// ============================================================================
// SUBMIT BUTTON
// ============================================================================

interface FeedbackSubmitButtonProps {
  title: string;
  canSubmit: boolean;
  backgroundColor: string;
  textColor: string;
  containerBackgroundColor?: string;
  borderColor?: string;
  onPress: () => void;
  bottomInset: number;
}

export const FeedbackSubmitButton: React.FC<FeedbackSubmitButtonProps> = ({
  title,
  canSubmit,
  backgroundColor,
  textColor,
  containerBackgroundColor = 'rgba(255,255,255,0.98)',
  borderColor = 'rgba(0,0,0,0.1)',
  onPress,
  bottomInset,
}) => (
  <View style={[{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: Math.max(bottomInset, 18),
    borderTopWidth: 1,
    borderTopColor: borderColor,
  }, { backgroundColor: containerBackgroundColor }]}>
    <TouchableOpacity
      style={[{
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }, {
        backgroundColor: canSubmit ? backgroundColor : 'rgba(255,255,255,0.1)',
        opacity: canSubmit ? 1 : 0.6,
      }]}
      onPress={onPress}
      disabled={!canSubmit}
      activeOpacity={0.8}
    >
      <AtomicText
        type="titleLarge"
        style={[{
          fontWeight: "700",
          fontSize: 17,
          letterSpacing: 0.3,
        }, { color: canSubmit ? textColor : 'rgba(255,255,255,0.4)' }]}
      >
        {title}
      </AtomicText>
    </TouchableOpacity>
  </View>
);
