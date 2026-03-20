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
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
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

  const screenStyles = useMemo(() => createScreenStyles(), []);

  return (
    <View style={[screenStyles.container, { backgroundColor: tokens.colors.backgroundPrimary }]}>
      {/* Close button */}
      <FeedbackCloseButton
        onPress={handleSkip}
        topInset={insets.top}
        backgroundColor={tokens.colors.surfaceSecondary}
        iconColor={tokens.colors.textPrimary}
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
          titleColor={tokens.colors.textPrimary}
          subtitleColor={tokens.colors.textSecondary}
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
        backgroundColor={tokens.colors.primary}
        textColor={tokens.colors.textPrimary}
        containerBackgroundColor={tokens.colors.backgroundPrimary}
        borderColor="rgba(255, 255, 255, 0.1)"
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

const createScreenStyles = () => ({
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
