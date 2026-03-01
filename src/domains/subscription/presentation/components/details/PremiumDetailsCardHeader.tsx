import React from "react";
import { View } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { PremiumStatusBadge } from "./PremiumStatusBadge";
import { styles } from "./PremiumDetailsCard.styles";
import type { SubscriptionStatusType } from "../../../core/SubscriptionConstants";
import type { PremiumDetailsTranslations } from "./PremiumDetailsCardTypes";

interface PremiumDetailsCardHeaderProps {
  statusType: SubscriptionStatusType;
  translations: PremiumDetailsTranslations;
}

export const PremiumDetailsCardHeader: React.FC<PremiumDetailsCardHeaderProps> = ({ statusType, translations }) => {
  const tokens = useAppDesignTokens();

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <AtomicText type="titleLarge" style={{ color: tokens.colors.textPrimary }}>
          {translations.title}
        </AtomicText>
      </View>
      <PremiumStatusBadge
        status={statusType}
        activeLabel={translations.statusActive}
        expiredLabel={translations.statusExpired}
        noneLabel={translations.statusInactive}
        canceledLabel={translations.statusCanceled}
      />
    </View>
  );
};
