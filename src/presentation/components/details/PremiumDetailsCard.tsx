/**
 * Premium Details Card
 * Generic component for displaying subscription details
 * Accepts credits via props for app-specific customization
 */

import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import { PremiumStatusBadge } from "./PremiumStatusBadge";
import { DetailRow } from "./DetailRow";
import { CreditRow } from "./CreditRow";
import { styles } from "./PremiumDetailsCard.styles";
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
          <View style={styles.headerTitleContainer}>
            <AtomicText type="titleLarge" style={{ color: tokens.colors.textPrimary }}>
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
      )}

      {!isPremium && !showCredits && (
        <View style={styles.freeUserHeader}>
          <View style={styles.freeUserTextContainer}>
            <AtomicText type="headlineSmall" style={{ color: tokens.colors.textPrimary, fontWeight: "700" }}>
              {translations.title}
            </AtomicText>
            <AtomicText type="bodyMedium" style={{ color: tokens.colors.textSecondary }}>
              {translations.freeDescription}
            </AtomicText>
          </View>
        </View>
      )}

      {isPremium && (
        <View style={styles.detailsSection}>
          {isLifetime && translations.lifetimeLabel ? (
            <DetailRow
              label={translations.statusLabel}
              value={translations.lifetimeLabel}
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
            <AtomicText type="labelMedium" style={[styles.sectionTitle, { color: tokens.colors.textPrimary }]}>
              {translations.creditsTitle}
            </AtomicText>
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
            <AtomicText type="labelLarge" style={{ color: tokens.colors.textPrimary }}>
              {translations.manageButton}
            </AtomicText>
          </TouchableOpacity>
        )}
        {!isPremium && onUpgrade && translations.upgradeButton && (
          <TouchableOpacity
            style={[styles.premiumButton, { backgroundColor: tokens.colors.primary }]}
            onPress={onUpgrade}
          >
            <AtomicText
              type="titleMedium"
              style={{ color: tokens.colors.onPrimary, fontWeight: "700" }}
            >
              {translations.upgradeButton}
            </AtomicText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
