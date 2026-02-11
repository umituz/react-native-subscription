import React from "react";
import { View } from "react-native";
import { useAppDesignTokens, AtomicText } from "@umituz/react-native-design-system";
import { DetailRow } from "./DetailRow";
import { CreditRow } from "./CreditRow";
import { styles } from "./PremiumDetailsCard.styles";
import type { PremiumDetailsCardProps } from "./PremiumDetailsCardTypes";
import { PremiumDetailsCardHeader } from "./PremiumDetailsCardHeader";
import { PremiumDetailsCardActions } from "./PremiumDetailsCardActions";
import { shouldHighlightExpiration } from "./premiumDetailsHelpers";

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
  const showCredits = isPremium && credits && credits.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface }]}>
      {(isPremium || showCredits) && <PremiumDetailsCardHeader statusType={statusType} translations={translations} />}


      {isPremium && (
        <View style={styles.detailsSection}>
          {isLifetime && translations.lifetimeLabel ? (
            <DetailRow label={translations.statusLabel} value={translations.lifetimeLabel} />
          ) : (
            <>
              {expirationDate && (
                <DetailRow label={translations.expiresLabel} value={expirationDate} highlight={shouldHighlightExpiration(daysRemaining)} />
              )}
              {purchaseDate && <DetailRow label={translations.purchasedLabel} value={purchaseDate} />}
            </>
          )}
        </View>
      )}

      {showCredits && (
        <View style={[styles.creditsSection, { borderTopColor: tokens.colors.border }]}>
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

      <PremiumDetailsCardActions
        isPremium={isPremium}
        onManageSubscription={onManageSubscription}
        onUpgrade={onUpgrade}
        translations={translations}
      />
    </View>
  );
};
