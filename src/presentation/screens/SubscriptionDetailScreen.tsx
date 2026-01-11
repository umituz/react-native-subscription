/**
 * Subscription Detail Screen
 * Composition of subscription components
 * No business logic - pure presentation
 */

import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
    useAppDesignTokens,
    ScreenLayout,
} from "@umituz/react-native-design-system";
import { SubscriptionHeader } from "./components/SubscriptionHeader";
import { CreditsList } from "./components/CreditsList";
import { UpgradePrompt } from "./components/UpgradePrompt";
import { DevTestSection } from "./components/DevTestSection";
import type { SubscriptionDetailScreenProps } from "../types/SubscriptionDetailTypes";

export type {
  SubscriptionDetailTranslations,
  SubscriptionDetailConfig,
  SubscriptionDetailScreenProps,
  DevTestActions,
  DevToolsConfig,
  UpgradeBenefit,
  UpgradePromptConfig,
  UpgradePromptProps,
} from "../types/SubscriptionDetailTypes";

export const SubscriptionDetailScreen: React.FC<
  SubscriptionDetailScreenProps
> = ({ config }) => {
  const tokens = useAppDesignTokens();
  const showCredits = config.credits && config.credits.length > 0;
  const showUpgradePrompt = !config.isPremium && config.upgradePrompt;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          flexGrow: 1,
          padding: tokens.spacing.lg,
          gap: tokens.spacing.lg,
        },
        cardsContainer: {
          gap: tokens.spacing.lg,
        },
        spacer: {
          flex: 1,
          minHeight: tokens.spacing.xl,
        },
      }),
    [tokens]
  );

  return (
    <ScreenLayout
      scrollable={true}
      edges={["bottom"]}
      backgroundColor={tokens.colors.backgroundPrimary}
      contentContainerStyle={styles.content}
      footer={
        config.devTools ? (
          <DevTestSection
            actions={config.devTools.actions}
            title={config.devTools.title}
          />
        ) : undefined
      }
    >
      <View style={styles.cardsContainer}>
        {config.isPremium && (
          <SubscriptionHeader
            statusType={config.statusType}
            isPremium={config.isPremium}
            isLifetime={config.isLifetime}
            expirationDate={config.expirationDate}
            purchaseDate={config.purchaseDate}
            daysRemaining={config.daysRemaining}
            translations={config.translations}
          />
        )}

        {showCredits && (
          <CreditsList
            credits={config.credits!}
            title={
              config.translations.usageTitle || config.translations.creditsTitle
            }
            description={config.translations.creditsResetInfo}
            remainingLabel={config.translations.remainingLabel}
          />
        )}

        {showUpgradePrompt && (
          <UpgradePrompt
            title={config.upgradePrompt!.title}
            subtitle={config.upgradePrompt!.subtitle}
            benefits={config.upgradePrompt!.benefits}
            upgradeButtonLabel={config.translations.upgradeButton}
            onUpgrade={config.onUpgrade}
          />
        )}
      </View>

      <View style={styles.spacer} />
    </ScreenLayout>
  );
};
