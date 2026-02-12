import React, { useMemo } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useAppDesignTokens, NavigationHeader, AtomicIcon } from "@umituz/react-native-design-system";
import { ScreenLayout } from "../../../../shared/presentation";
import { SubscriptionHeader } from "./components/SubscriptionHeader";
import { CreditsList } from "./components/CreditsList";
import { UpgradePrompt } from "./components/UpgradePrompt";
import { SubscriptionDetailScreenProps } from "./SubscriptionDetailScreen.types";

export const SubscriptionDetailScreen: React.FC<SubscriptionDetailScreenProps> = ({ config }) => {
  const tokens = useAppDesignTokens();
  const { showHeader, showCredits, showUpgradePrompt, showExpirationDate } = config.display;

  const styles = useMemo(() => StyleSheet.create({
    content: { flexGrow: 1, padding: tokens.spacing.lg, gap: tokens.spacing.lg },
    cardsContainer: { gap: tokens.spacing.xl }
  }), [tokens]);

  return (
    <ScreenLayout
      scrollable={true}
      edges={config.onClose ? ["bottom"] : ["top", "bottom"]}
      backgroundColor={tokens.colors.backgroundPrimary}
      contentContainerStyle={styles.content}
    >
      {config.onClose && (
        <NavigationHeader
          title={config.translations.title}
          rightElement={
            <Pressable
              onPress={config.onClose}
              style={({ pressed }) => ({
                width: 44, height: 44, justifyContent: "center", alignItems: "center",
                backgroundColor: pressed ? tokens.colors.surfaceVariant : tokens.colors.surface,
                borderRadius: tokens.radius.full,
              })}
            >
              <AtomicIcon name="close-outline" customSize={24} color="textPrimary" />
            </Pressable>
          }
        />
      )}
      <View style={styles.cardsContainer}>
        {showHeader && (
          <SubscriptionHeader
            statusType={config.statusType}
            showExpirationDate={showExpirationDate}
            isLifetime={config.isLifetime}
            expirationDate={config.expirationDate}
            purchaseDate={config.purchaseDate}
            daysRemaining={config.daysRemaining}
            hideTitle={!!config.onClose}
            translations={config.translations}
            willRenew={config.willRenew}
            productIdentifier={config.productIdentifier}
            periodType={config.periodType}
            store={config.store}
            originalPurchaseDate={config.originalPurchaseDate}
            latestPurchaseDate={config.latestPurchaseDate}
            billingIssuesDetected={config.billingIssuesDetected}
            isSandbox={config.isSandbox}
          />
        )}
        {showCredits && config.credits && (
          <CreditsList
            credits={config.credits}
            title={config.translations.usageTitle || config.translations.creditsTitle}
            description={config.translations.creditsResetInfo}
            remainingLabel={config.translations.remainingLabel}
          />
        )}
        {showUpgradePrompt && config.upgradePrompt && (
          <UpgradePrompt
            title={config.upgradePrompt.title}
            subtitle={config.upgradePrompt.subtitle}
            benefits={config.upgradePrompt.benefits}
            upgradeButtonLabel={config.translations.upgradeButton}
            onUpgrade={config.upgradePrompt.onUpgrade ?? (() => {})}
          />
        )}
      </View>
    </ScreenLayout>
  );
};
