/**
 * Paywall Feedback Screen Component
 *
 * Full-screen feedback form (not modal). Use when you want the feedback
 * form to be a standalone screen instead of a modal overlay.
 * Collects user feedback after they decline the paywall.
 */

import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "@umituz/react-native-design-system/safe-area";
import { usePaywallFeedback } from "../../../../../presentation/hooks/feedback/usePaywallFeedback";
import type { PaywallFeedbackScreenProps, PaywallFeedbackTranslations } from "./PaywallFeedbackScreen.types";
import {
  FeedbackCloseButton,
  FeedbackHeader,
  FeedbackOptionsList,
  FeedbackSubmitButton,
} from "./PaywallFeedbackScreen.parts";

// Re-export types for convenience
export type { PaywallFeedbackTranslations, PaywallFeedbackScreenProps };

export const PaywallFeedbackScreen: React.FC<PaywallFeedbackScreenProps> = React.memo(({
  translations,
  onClose,
  onSubmit,
}) => {
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

  const screenStyles = useMemo(() => createScreenStyles(insets), [insets]);

  return (
    <View style={[screenStyles.container, { backgroundColor: 'white', opacity: 1 }]}>
      {/* Close button */}
      <FeedbackCloseButton
        onPress={handleSkip}
        topInset={insets.top}
        backgroundColor="rgba(0,0,0,0.05)"
        iconColor="#000"
      />

      {/* Scrollable content */}
      <ScrollView
        style={screenStyles.scrollContainer}
        contentContainerStyle={screenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FeedbackHeader
          title={translations.title}
          subtitle={translations.subtitle}
          titleColor="#000"
          subtitleColor="#666"
          style={screenStyles.header}
        />

        {/* Feedback options */}
        <View style={screenStyles.optionsContainer}>
          <FeedbackOptionsList
            translations={translations}
            selectedReason={selectedReason}
            otherText={otherText}
            onSelectReason={selectReason}
            onSetOtherText={setOtherText}
          />
        </View>
      </ScrollView>

      {/* Submit button */}
      <FeedbackSubmitButton
        title={translations.submit}
        canSubmit={canSubmit}
        backgroundColor="#007AFF"
        textColor="#FFF"
        onPress={handleSubmit}
        bottomInset={insets.bottom}
      />
    </View>
  );
});

PaywallFeedbackScreen.displayName = "PaywallFeedbackScreen";

// ============================================================================
// STYLES
// ============================================================================

const createScreenStyles = (insets: { top: number; bottom: number }) => ({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  optionsContainer: {
    paddingHorizontal: 24,
  },
});
