import React from "react";
import { View } from "react-native";
import { DetailRow } from "../../components/details/DetailRow";
import type { SubscriptionHeaderProps } from "./SubscriptionHeader.types";

declare const __DEV__: boolean;

function formatSubscriptionPeriod(packageType: string | null | undefined, periodType: string | null | undefined): string {
  if (packageType) {
    const formatted = packageType.toLowerCase().replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  if (periodType === "NORMAL") {
    return "Standard";
  }

  return periodType || "Unknown";
}

interface SubscriptionHeaderContentProps {
  isLifetime: boolean;
  showExpirationDate: boolean;
  expirationDate?: string;
  purchaseDate?: string;
  showExpiring: boolean;
  translations: SubscriptionHeaderProps["translations"];
  styles: any;
  willRenew?: boolean | null;
  periodType?: string | null;
  packageType?: string | null;
  store?: string | null;
  originalPurchaseDate?: string | null;
  latestPurchaseDate?: string | null;
  billingIssuesDetected?: boolean;
  isSandbox?: boolean;
}

export const SubscriptionHeaderContent: React.FC<SubscriptionHeaderContentProps> = ({
  isLifetime,
  showExpirationDate,
  expirationDate,
  purchaseDate,
  showExpiring,
  translations,
  styles,
  willRenew,
  periodType,
  packageType,
  store,
  originalPurchaseDate,
  latestPurchaseDate,
  billingIssuesDetected,
  isSandbox,
}) => (
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
        {willRenew !== null && willRenew !== undefined && translations.willRenewLabel && (
          <DetailRow
            label={translations.willRenewLabel}
            value={willRenew ? "Yes" : "No"}
            highlight={!willRenew}
            style={styles.row}
            labelStyle={styles.label}
            valueStyle={styles.value}
          />
        )}
        {(packageType || periodType) && translations.periodTypeLabel && (
          <DetailRow
            label={translations.periodTypeLabel}
            value={formatSubscriptionPeriod(packageType, periodType)}
            style={styles.row}
            labelStyle={styles.label}
            valueStyle={styles.value}
          />
        )}
        {store && translations.storeLabel && (
          <DetailRow
            label={translations.storeLabel}
            value={store}
            style={styles.row}
            labelStyle={styles.label}
            valueStyle={styles.value}
          />
        )}
        {originalPurchaseDate && translations.originalPurchaseDateLabel && (
          <DetailRow
            label={translations.originalPurchaseDateLabel}
            value={originalPurchaseDate}
            style={styles.row}
            labelStyle={styles.label}
            valueStyle={styles.value}
          />
        )}
        {latestPurchaseDate && translations.latestPurchaseDateLabel && (
          <DetailRow
            label={translations.latestPurchaseDateLabel}
            value={latestPurchaseDate}
            style={styles.row}
            labelStyle={styles.label}
            valueStyle={styles.value}
          />
        )}
        {billingIssuesDetected && translations.billingIssuesLabel && (
          <DetailRow
            label={translations.billingIssuesLabel}
            value="Detected"
            highlight={true}
            style={styles.row}
            labelStyle={styles.label}
            valueStyle={styles.value}
          />
        )}
        {typeof __DEV__ !== 'undefined' && __DEV__ && isSandbox && translations.sandboxLabel && (
          <DetailRow
            label={translations.sandboxLabel}
            value="Test Mode"
            style={styles.row}
            labelStyle={styles.label}
            valueStyle={styles.value}
          />
        )}
      </>
    )}
  </View>
);
