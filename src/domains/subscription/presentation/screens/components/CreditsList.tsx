/**
 * Credits List Component
 * Displays list of credit usages
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import { CreditRow } from "../../components/details/CreditRow";

interface CreditItem {
  id: string;
  label: string;
  current: number;
  total: number;
}

interface CreditsListProps {
  credits: readonly CreditItem[];
  title?: string;
  description?: string;
  remainingLabel?: string;
}

export const CreditsList: React.FC<CreditsListProps> = ({
  credits,
  title,
  description,
  remainingLabel,
}) => {
  const tokens = useAppDesignTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing.lg,
          gap: tokens.spacing.lg,
          backgroundColor: tokens.colors.surface,
        },
        title: {
          fontWeight: "700",
        },
        description: {
          marginTop: -tokens.spacing.sm,
        },
        list: {
          gap: tokens.spacing.lg,
        },
      }),
    [tokens]
  );

  if (!credits || credits.length === 0) return null;

  return (
    <View style={styles.container}>
      {title && (
        <AtomicText
          type="titleMedium"
          style={[styles.title, { color: tokens.colors.textPrimary }]}
        >
          {title}
        </AtomicText>
      )}
      {description && (
        <AtomicText
          type="bodySmall"
          style={[styles.description, { color: tokens.colors.textSecondary }]}
        >
          {description}
        </AtomicText>
      )}
      <View style={styles.list}>
        {credits.map((credit) => (
          <CreditRow
            key={credit.id}
            label={credit.label}
            current={credit.current}
            total={credit.total}
            remainingLabel={remainingLabel}
          />
        ))}
      </View>
    </View>
  );
};
