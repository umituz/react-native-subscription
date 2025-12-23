/**
 * Premium Details Card
 * Generic component for displaying subscription details
 * Accepts credits via props for app-specific customization
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { PremiumStatusBadge } from "./PremiumStatusBadge";
import { DetailRow } from "./DetailRow";
import { CreditRow } from "./CreditRow";
import type { PremiumDetailsCardProps } from "./PremiumDetailsCardTypes";

export type { CreditInfo, PremiumDetailsTranslations, PremiumDetailsCardProps } from "./PremiumDetailsCardTypes";

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
      {(isPremium || showCredits) && (
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
      )}

      {!isPremium && !showCredits && (
        <View style={styles.freeUserHeader}>
          <View style={styles.freeUserTextContainer}>
            <Text style={[styles.freeUserTitle, { color: tokens.colors.text }]}>
              {translations.title}
            </Text>
            <Text style={[styles.freeUserDescription, { color: tokens.colors.textSecondary }]}>
              Unlock all features and create unlimited magic
            </Text>
          </View>
        </View>
      )}

      {isPremium && (
        <View style={styles.detailsSection}>
          {isLifetime ? (
            <DetailRow
              label={translations.statusLabel}
              value={translations.lifetimeLabel || "Lifetime"}
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
                />
              )}
              {purchaseDate && (
                <DetailRow
                  label={translations.purchasedLabel}
                  value={purchaseDate}
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
            style={[styles.premiumButton, { backgroundColor: tokens.colors.primary }]}
            onPress={onUpgrade}
          >
            <Text
              style={[styles.premiumButtonText, { color: tokens.colors.onPrimary }]}
            >
              {translations.upgradeButton}
            </Text>
          </TouchableOpacity>
        )}
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
  freeUserHeader: {
    marginBottom: 4,
  },
  freeUserTextContainer: {
    gap: 6,
  },
  freeUserTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  freeUserDescription: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
  },
  premiumButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  detailsSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  creditsSection: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
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
