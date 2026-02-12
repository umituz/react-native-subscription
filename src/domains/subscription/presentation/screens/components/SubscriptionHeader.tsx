import React, { useMemo } from "react";
import { View } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import { PremiumStatusBadge } from "../../components/details/PremiumStatusBadge";
import type { SubscriptionHeaderProps } from "./SubscriptionHeader.types";
import { createSubscriptionHeaderStyles } from "./SubscriptionHeader.styles";
import { EXPIRING_SOON_THRESHOLD_DAYS } from "./SubscriptionHeader.constants";
import { SubscriptionHeaderContent } from "./SubscriptionHeaderContent";

export type { SubscriptionHeaderProps } from "./SubscriptionHeader.types";

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  statusType,
  showExpirationDate,
  isLifetime,
  expirationDate,
  purchaseDate,
  daysRemaining,
  hideTitle,
  translations,
  willRenew,
  periodType,
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
        isLifetime={isLifetime}
        showExpirationDate={showExpirationDate}
        expirationDate={expirationDate}
        purchaseDate={purchaseDate}
        showExpiring={showExpiring}
        translations={translations}
        styles={styles}
        willRenew={willRenew}
        periodType={periodType}
        store={store}
        originalPurchaseDate={originalPurchaseDate}
        latestPurchaseDate={latestPurchaseDate}
        billingIssuesDetected={billingIssuesDetected}
        isSandbox={isSandbox}
      />
    </View>
  );
};
