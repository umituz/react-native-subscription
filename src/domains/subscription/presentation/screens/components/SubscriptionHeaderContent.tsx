import React from "react";
import { View } from "react-native";
import { DetailRow } from "../../components/details/DetailRow";
import type { SubscriptionHeaderProps } from "./SubscriptionHeader.types";

interface SubscriptionHeaderContentProps {
  isLifetime: boolean;
  showExpirationDate: boolean;
  expirationDate?: string;
  purchaseDate?: string;
  showExpiring: boolean;
  translations: SubscriptionHeaderProps["translations"];
  styles: any;
}

export const SubscriptionHeaderContent: React.FC<SubscriptionHeaderContentProps> = ({
  isLifetime,
  showExpirationDate,
  expirationDate,
  purchaseDate,
  showExpiring,
  translations,
  styles,
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
      </>
    )}
  </View>
);
