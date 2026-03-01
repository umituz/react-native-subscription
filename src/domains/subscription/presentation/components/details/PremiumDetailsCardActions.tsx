import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { styles } from "./PremiumDetailsCard.styles";
import type { PremiumDetailsTranslations } from "./PremiumDetailsCardTypes";

interface PremiumDetailsCardActionsProps {
  isPremium: boolean;
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
  translations: PremiumDetailsTranslations;
}

export const PremiumDetailsCardActions: React.FC<PremiumDetailsCardActionsProps> = ({
  isPremium,
  onManageSubscription,
  onUpgrade,
  translations,
}) => {
  const tokens = useAppDesignTokens();

  return (
    <View style={styles.actionsSection}>
      {isPremium && onManageSubscription && translations.manageButton && (
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: tokens.colors.surfaceSecondary }]}
          onPress={onManageSubscription}
        >
          <AtomicText type="labelLarge" style={{ color: tokens.colors.textPrimary }}>
            {translations.manageButton}
          </AtomicText>
        </TouchableOpacity>
      )}
      {!isPremium && onUpgrade && translations.upgradeButton && (
        <TouchableOpacity
          style={[styles.premiumButton, { backgroundColor: tokens.colors.primary }]}
          onPress={onUpgrade}
        >
          <AtomicText type="titleMedium" style={{ color: tokens.colors.onPrimary, fontWeight: "700" }}>
            {translations.upgradeButton}
          </AtomicText>
        </TouchableOpacity>
      )}
    </View>
  );
};
