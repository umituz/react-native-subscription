import React from "react";
import { View } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { DetailRow } from "./DetailRow";
import { CreditRow } from "./CreditRow";
import { styles } from "./PremiumDetailsCard.styles";
import type { PremiumDetailsCardProps } from "./PremiumDetailsCardTypes";
import { PremiumDetailsCardHeader } from "./PremiumDetailsCardHeader";
import { PremiumDetailsCardActions } from "./PremiumDetailsCardActions";
import { shouldHighlightExpiration } from "../../../../subscription/utils/expirationHelpers";
import { hasItems } from "../../../../../shared/utils/arrayUtils";

export type { CreditInfo, PremiumDetailsTranslations, PremiumDetailsCardProps } from "./PremiumDetailsCardTypes";

export const PremiumDetailsCard: React.FC<PremiumDetailsCardProps> = React.memo(({
  statusType,
  isPremium,
  expirationDate,
  purchaseDate,
  daysRemaining,
  credits,
  translations,
  onManageSubscription,
  onUpgrade,
}) => {
  const tokens = useAppDesignTokens();
  const showCredits = isPremium && hasItems(credits);

  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface }]}>
      {(isPremium || showCredits) && <PremiumDetailsCardHeader statusType={statusType} translations={translations} />}


      {isPremium && (
        <View style={styles.detailsSection}>
          {expirationDate && (
            <DetailRow label={translations.expiresLabel} value={expirationDate} highlight={shouldHighlightExpiration(daysRemaining)} />
          )}
          {purchaseDate && <DetailRow label={translations.purchasedLabel} value={purchaseDate} />}
        </View>
      )}

      {showCredits && credits && (
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
}, (prevProps, nextProps) => {
  // PERFORMANCE: Custom comparison to prevent unnecessary re-renders
  // Deep comparison for credits array since it's frequently updated
  const creditsEqual: boolean = prevProps.credits === nextProps.credits ||
    (!!prevProps.credits && !!nextProps.credits &&
      prevProps.credits.length === nextProps.credits.length &&
      prevProps.credits.every((credit, i) => {
        const nextCredit = nextProps.credits[i];
        return nextCredit !== undefined &&
          credit.id === nextCredit.id &&
          credit.current === nextCredit.current &&
          credit.total === nextCredit.total &&
          credit.label === nextCredit.label;
      });

  return (
    prevProps.statusType === nextProps.statusType &&
    prevProps.isPremium === nextProps.isPremium &&
    prevProps.expirationDate === nextProps.expirationDate &&
    prevProps.purchaseDate === nextProps.purchaseDate &&
    prevProps.daysRemaining === nextProps.daysRemaining &&
    creditsEqual &&
    prevProps.translations === nextProps.translations &&
    prevProps.onManageSubscription === nextProps.onManageSubscription &&
    prevProps.onUpgrade === nextProps.onUpgrade
  );
});
