/**
 * Premium Details Card
 * Generic component for displaying subscription details
 * Accepts credits via props for app-specific customization
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import {
  PremiumStatusBadge,
  type SubscriptionStatusType,
} from "./PremiumStatusBadge";

export interface CreditInfo {
  id: string;
  label: string;
  current: number;
  total: number;
}

export interface PremiumDetailsTranslations {
  title: string;
  statusLabel: string;
  expiresLabel: string;
  purchasedLabel: string;
  creditsTitle?: string;
  remainingLabel?: string;
  manageButton?: string;
  upgradeButton?: string;
  lifetimeLabel?: string;
  statusActive?: string;
  statusExpired?: string;
  statusFree?: string;
}

export interface PremiumDetailsCardProps {
  statusType: SubscriptionStatusType;
  isPremium: boolean;
  expirationDate?: string | null;
  purchaseDate?: string | null;
  isLifetime?: boolean;
  daysRemaining?: number | null;
  credits?: CreditInfo[];
  translations: PremiumDetailsTranslations;
  onManageSubscription?: () => void;
  onUpgrade?: () => void;
}

export const PremiumDetailsCard: React.FC<PremiumDetailsCardProps> = ({
  statusType,
  isPremium,
  expirationDate,
  purchaseDate,
  isLifetime = false,
  daysRemaining,
  credits,
  translations,
  onManageSubscription,
  onUpgrade,
}) => {
  const tokens = useAppDesignTokens();
  const showCredits = credits && credits.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: tokens.colors.text }]}>
          {translations.title}
        </Text>
        <PremiumStatusBadge
          status={statusType}
          activeLabel={translations.statusActive}
          expiredLabel={translations.statusExpired}
          noneLabel={translations.statusFree}
        />
      </View>

      {isPremium && (
        <View style={styles.detailsSection}>
          {isLifetime ? (
            <DetailRow
              label={translations.statusLabel}
              value={translations.lifetimeLabel || "Lifetime"}
              tokens={tokens}
            />
          ) : (
            <>
              {expirationDate && (
                <DetailRow
                  label={translations.expiresLabel}
                  value={expirationDate}
                  highlight={
                    daysRemaining !== null &&
                    daysRemaining !== undefined &&
                    daysRemaining <= 7
                  }
                  tokens={tokens}
                />
              )}
              {purchaseDate && (
                <DetailRow
                  label={translations.purchasedLabel}
                  value={purchaseDate}
                  tokens={tokens}
                />
              )}
            </>
          )}
        </View>
      )}

      {showCredits && (
        <View
          style={[styles.creditsSection, { borderTopColor: tokens.colors.border }]}
        >
          {translations.creditsTitle && (
            <Text style={[styles.sectionTitle, { color: tokens.colors.text }]}>
              {translations.creditsTitle}
            </Text>
          )}
          {credits.map((credit) => (
            <CreditRow
              key={credit.id}
              label={credit.label}
              current={credit.current}
              total={credit.total}
              remainingLabel={translations.remainingLabel}
              tokens={tokens}
            />
          ))}
        </View>
      )}

      <View style={styles.actionsSection}>
        {isPremium && onManageSubscription && translations.manageButton && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { backgroundColor: tokens.colors.surfaceSecondary },
            ]}
            onPress={onManageSubscription}
          >
            <Text style={[styles.secondaryButtonText, { color: tokens.colors.text }]}>
              {translations.manageButton}
            </Text>
          </TouchableOpacity>
        )}
        {!isPremium && onUpgrade && translations.upgradeButton && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tokens.colors.primary }]}
            onPress={onUpgrade}
          >
            <Text
              style={[styles.primaryButtonText, { color: tokens.colors.onPrimary }]}
            >
              {translations.upgradeButton}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  tokens: ReturnType<typeof useAppDesignTokens>;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  highlight = false,
  tokens,
}) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: tokens.colors.textSecondary }]}>
      {label}
    </Text>
    <Text
      style={[
        styles.detailValue,
        { color: highlight ? tokens.colors.warning : tokens.colors.text },
      ]}
    >
      {value}
    </Text>
  </View>
);

interface CreditRowProps {
  label: string;
  current: number;
  total: number;
  remainingLabel?: string;
  tokens: ReturnType<typeof useAppDesignTokens>;
}

const CreditRow: React.FC<CreditRowProps> = ({
  label,
  current,
  total,
  remainingLabel = "remaining",
  tokens,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const isLow = percentage <= 20;

  return (
    <View style={styles.creditRow}>
      <View style={styles.creditHeader}>
        <Text style={[styles.creditLabel, { color: tokens.colors.text }]}>
          {label}
        </Text>
        <Text
          style={[
            styles.creditCount,
            { color: isLow ? tokens.colors.warning : tokens.colors.textSecondary },
          ]}
        >
          {current} / {total} {remainingLabel}
        </Text>
      </View>
      <View
        style={[styles.progressBar, { backgroundColor: tokens.colors.surfaceSecondary }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: isLow ? tokens.colors.warning : tokens.colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  detailsSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  creditsSection: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  creditRow: {
    gap: 4,
  },
  creditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditLabel: {
    fontSize: 13,
  },
  creditCount: {
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  actionsSection: {
    gap: 8,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
