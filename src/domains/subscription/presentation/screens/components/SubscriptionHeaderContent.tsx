import React from "react";
import { View, type ViewStyle, type TextStyle } from "react-native";
import { DetailRow } from "../../components/details/DetailRow";
import type { SubscriptionHeaderProps } from "./SubscriptionHeader.types";
import { formatPackageTypeForDisplay } from "../../../../subscription/utils/packageTypeFormatter";

interface SubscriptionHeaderContentStyles {
  details: ViewStyle;
  row: ViewStyle;
  label: TextStyle;
  value: TextStyle;
}

interface DetailInfo {
  label?: string;
  value: string;
  highlight?: boolean;
}

interface SubscriptionHeaderContentProps {
  showExpirationDate: boolean;
  expirationDate?: string;
  purchaseDate?: string;
  showExpiring: boolean;
  translations: SubscriptionHeaderProps["translations"];
  styles: SubscriptionHeaderContentStyles;
  willRenew?: boolean | null;
  periodType?: string | null;
  packageType?: string | null;
  store?: string | null;
  originalPurchaseDate?: string | null;
  latestPurchaseDate?: string | null;
  billingIssuesDetected?: boolean;
  isSandbox?: boolean;
}

/**
 * Helper to build detail row data array.
 * Reduces code duplication by centralizing detail row creation logic.
 */
function buildDetails(
  props: SubscriptionHeaderContentProps
): DetailInfo[] {
  const {
    showExpirationDate,
    expirationDate,
    purchaseDate,
    showExpiring,
    translations,
    willRenew,
    packageType,
    store,
    originalPurchaseDate,
    latestPurchaseDate,
    billingIssuesDetected,
    isSandbox,
  } = props;

  const details: DetailInfo[] = [];

  if (showExpirationDate && expirationDate) {
    details.push({
      label: translations.expiresLabel,
      value: expirationDate,
      highlight: showExpiring,
    });
  }

  if (purchaseDate) {
    details.push({
      label: translations.purchasedLabel,
      value: purchaseDate,
    });
  }

  if (willRenew !== null && willRenew !== undefined && translations.willRenewLabel) {
    details.push({
      label: translations.willRenewLabel,
      value: willRenew ? (translations.willRenewYes ?? "Yes") : (translations.willRenewNo ?? "No"),
      highlight: !willRenew,
    });
  }

  if (packageType && translations.periodTypeLabel) {
    details.push({
      label: translations.periodTypeLabel,
      value: formatPackageTypeForDisplay(packageType),
    });
  }

  if (store && translations.storeLabel) {
    details.push({
      label: translations.storeLabel,
      value: store,
    });
  }

  if (originalPurchaseDate && translations.originalPurchaseDateLabel) {
    details.push({
      label: translations.originalPurchaseDateLabel,
      value: originalPurchaseDate,
    });
  }

  if (latestPurchaseDate && translations.latestPurchaseDateLabel) {
    details.push({
      label: translations.latestPurchaseDateLabel,
      value: latestPurchaseDate,
    });
  }

  if (billingIssuesDetected && translations.billingIssuesLabel) {
    details.push({
      label: translations.billingIssuesLabel,
      value: translations.billingIssuesDetected ?? "Detected",
      highlight: true,
    });
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__ && isSandbox && translations.sandboxLabel) {
    details.push({
      label: translations.sandboxLabel,
      value: translations.sandboxTestMode ?? "Test Mode",
    });
  }

  return details;
}

export const SubscriptionHeaderContent: React.FC<SubscriptionHeaderContentProps> = (props) => {
  const { styles } = props;
  const details = buildDetails(props);

  return (
    <View style={styles.details}>
      {details.map((detail) => (
        <DetailRow
          key={detail.label}
          label={detail.label!}
          value={detail.value}
          highlight={detail.highlight}
          style={styles.row}
          labelStyle={styles.label}
          valueStyle={styles.value}
        />
      ))}
    </View>
  );
};
