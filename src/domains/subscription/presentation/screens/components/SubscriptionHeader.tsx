/**
 * Subscription Header Component
 * Displays status badge and subscription details
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import { PremiumStatusBadge } from "../../components/details/PremiumStatusBadge";
import { DetailRow } from "../../components/details/DetailRow";

export interface SubscriptionHeaderProps {
  statusType: "active" | "expired" | "none" | "canceled";
  showExpirationDate: boolean;
  isLifetime: boolean;
  expirationDate?: string;
  purchaseDate?: string;
  daysRemaining?: number | null;
  translations: {
    title: string;
    statusActive: string;
    statusExpired: string;
    statusFree: string;
    statusCanceled: string;
    statusLabel: string;
    lifetimeLabel: string;
    expiresLabel: string;
    purchasedLabel: string;
  };
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  statusType,
  showExpirationDate,
  isLifetime,
  expirationDate,
  purchaseDate,
  daysRemaining,
  translations,
}) => {
  const tokens = useAppDesignTokens();
  const showExpiring =
    daysRemaining !== null && daysRemaining !== undefined && daysRemaining <= 7;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing.lg,
          gap: tokens.spacing.lg,
          backgroundColor: tokens.colors.surface,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        titleContainer: {
          flex: 1,
          marginRight: tokens.spacing.md,
        },
        title: {
          fontWeight: "700",
        },
        details: {
          gap: tokens.spacing.md,
          paddingTop: tokens.spacing.md,
        },
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: tokens.spacing.lg,
        },
        label: {
          flex: 1,
        },
        value: {
          fontWeight: "600",
          textAlign: "right",
        },
      }),
    [tokens]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AtomicText
            type="headlineSmall"
            style={[styles.title, { color: tokens.colors.textPrimary }]}
          >
            {translations.title}
          </AtomicText>
        </View>
        <PremiumStatusBadge
          status={statusType}
          activeLabel={translations.statusActive}
          expiredLabel={translations.statusExpired}
          noneLabel={translations.statusFree}
          canceledLabel={translations.statusCanceled}
        />
      </View>

      <View style={styles.details}>
        {isLifetime ? (
          <DetailRow
            label={translations.statusLabel}
            value={translations.lifetimeLabel}
            style={styles.row}
            labelStyle={styles.label}
            valueStyle={styles.value}
          />
        ) : (
          <>
            {showExpirationDate && expirationDate && (
              <DetailRow
                label={translations.expiresLabel}
                value={expirationDate}
                highlight={showExpiring}
                style={styles.row}
                labelStyle={styles.label}
                valueStyle={styles.value}
              />
            )}
            {purchaseDate && (
              <DetailRow
                label={translations.purchasedLabel}
                value={purchaseDate}
                style={styles.row}
                labelStyle={styles.label}
                valueStyle={styles.value}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};
