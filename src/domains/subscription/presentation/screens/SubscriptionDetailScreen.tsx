/**
 * Subscription Detail Screen
 * Composition of subscription components
 * No business logic - pure presentation
 */

import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
    useAppDesignTokens,
    NavigationHeader,
    AtomicIcon,
} from "@umituz/react-native-design-system";
import { Pressable } from "react-native";
import { ScreenLayout } from "../../../../shared/presentation";
import { SubscriptionHeader } from "./components/SubscriptionHeader";
import { CreditsList, type CreditItem } from "./components/CreditsList";
import { UpgradePrompt, type Benefit } from "./components/UpgradePrompt";

export interface SubscriptionDisplayFlags {
  showHeader: boolean;
  showCredits: boolean;
  showUpgradePrompt: boolean;
  showExpirationDate: boolean;
}

export interface SubscriptionDetailTranslations {
  title: string;
  statusActive: string;
  statusExpired: string;
  statusFree: string;
  statusCanceled: string;
  statusLabel: string;
  lifetimeLabel: string;
  expiresLabel: string;
  purchasedLabel: string;
  usageTitle?: string;
  creditsTitle: string;
  creditsResetInfo?: string;
  remainingLabel?: string;
  upgradeButton: string;
}

export interface UpgradePromptConfig {
  title: string;
  subtitle?: string;
  benefits?: readonly Benefit[];
  onUpgrade?: () => void;
}

export interface SubscriptionDetailConfig {
  display: SubscriptionDisplayFlags;
  statusType: "active" | "expired" | "none" | "canceled";
  isLifetime: boolean;
  expirationDate?: string;
  purchaseDate?: string;
  daysRemaining?: number | null;
  credits?: readonly CreditItem[];
  translations: SubscriptionDetailTranslations;
  upgradePrompt?: UpgradePromptConfig;
  onClose?: () => void;
}

export interface SubscriptionDetailScreenProps {
  config: SubscriptionDetailConfig;
}

export const SubscriptionDetailScreen: React.FC<
  SubscriptionDetailScreenProps
> = ({ config }) => {
  const tokens = useAppDesignTokens();
  const { showHeader, showCredits, showUpgradePrompt, showExpirationDate } = config.display;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          flexGrow: 1,
          padding: tokens.spacing.lg,
          gap: tokens.spacing.lg,
        },
        cardsContainer: {
          gap: tokens.spacing.xl,
        },
      }),
    [tokens]
  );

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
                width: 44,
                height: 44,
                justifyContent: "center",
                alignItems: "center",
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
            translations={config.translations}
          />
        )}

        {showCredits && config.credits && (
          <CreditsList
            credits={config.credits}
            title={
              config.translations.usageTitle || config.translations.creditsTitle
            }
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
