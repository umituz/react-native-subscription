import React, { useMemo } from "react";
import { View } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { PremiumStatusBadge } from "../../components/details/PremiumStatusBadge";
import type { SubscriptionHeaderProps } from "./SubscriptionHeader.types";
import { createSubscriptionHeaderStyles } from "./SubscriptionHeader.styles";
import { EXPIRATION_WARNING_THRESHOLD_DAYS as EXPIRING_SOON_THRESHOLD_DAYS } from "../../../constants/thresholds";
import { SubscriptionHeaderContent } from "./SubscriptionHeaderContent";

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  statusType,
  showExpirationDate,
  expirationDate,
  purchaseDate,
  daysRemaining,
  hideTitle,
  translations,
  willRenew,
  periodType,
  packageType,
  store,
  originalPurchaseDate,
  latestPurchaseDate,
  billingIssuesDetected,
  isSandbox,
}) => {
  const tokens = useAppDesignTokens();
  const showExpiring = daysRemaining !== null && daysRemaining !== undefined && daysRemaining <= EXPIRING_SOON_THRESHOLD_DAYS;
  const styles = useMemo(() => createSubscriptionHeaderStyles(tokens), [tokens]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!hideTitle && (
          <View style={styles.titleContainer}>
            <AtomicText type="headlineSmall" style={[styles.title, { color: tokens.colors.textPrimary }]}>
              {translations.title}
            </AtomicText>
          </View>
        )}
        <PremiumStatusBadge
          status={statusType}
          activeLabel={translations.statusActive}
          expiredLabel={translations.statusExpired}
          noneLabel={translations.statusFree}
          canceledLabel={translations.statusCanceled}
        />
      </View>

      <SubscriptionHeaderContent
        showExpirationDate={showExpirationDate}
        expirationDate={expirationDate}
        purchaseDate={purchaseDate}
        showExpiring={showExpiring}
        translations={translations}
        styles={styles}
        willRenew={willRenew}
        periodType={periodType}
        packageType={packageType}
        store={store}
        originalPurchaseDate={originalPurchaseDate}
        latestPurchaseDate={latestPurchaseDate}
        billingIssuesDetected={billingIssuesDetected}
        isSandbox={isSandbox}
      />
    </View>
  );
};
