import React, { useMemo, useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { AtomicIcon, AtomicText } from "@umituz/react-native-design-system/atoms";
import { NavigationHeader } from "@umituz/react-native-design-system/molecules";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import { ScreenLayout } from "../../../../shared/presentation";
import { SubscriptionHeader } from "./components/SubscriptionHeader";
import { CreditsList } from "./components/CreditsList";
import { UpgradePrompt } from "./components/UpgradePrompt";
import { SubscriptionDetailScreenProps } from "./SubscriptionDetailScreen.types";

const IS_DEV = typeof __DEV__ !== "undefined" && __DEV__;

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
            expirationDate={config.expirationDate}
            purchaseDate={config.purchaseDate}
            daysRemaining={config.daysRemaining}
            hideTitle={!!config.onClose}
            translations={config.translations}
            willRenew={config.willRenew}
            productIdentifier={config.productIdentifier}
            productName={config.productName}
            periodType={config.periodType}
            packageType={config.packageType}
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
        {IS_DEV && <DevTestPanel statusType={config.statusType} />}
      </View>
    </ScreenLayout>
  );
};

/* ─── DEV TEST PANEL ─── Only rendered in __DEV__ ─── */

const DevTestPanel: React.FC<{ statusType: string }> = ({ statusType }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const isPremium = statusType === "active";

  const run = useCallback(async (label: string, fn: () => Promise<void>) => {
    if (loading) return;
    setLoading(label);
    try {
      await fn();
      Alert.alert("DEV", `${label} OK`);
    } catch (e) {
      Alert.alert("DEV Error", e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  }, [loading]);

  const handleCancel = useCallback(() => run("Cancel", async () => {
    const { useAuthStore, selectUserId } = require("@umituz/react-native-auth");
    const { handleExpiredSubscription } = require("../../application/statusChangeHandlers");
    const userId = selectUserId(useAuthStore.getState());
    if (!userId) throw new Error("No userId found");
    await handleExpiredSubscription(userId);
  }), [run]);

  const handleRestore = useCallback(() => run("Restore", async () => {
    const Purchases = require("react-native-purchases").default;
    await Purchases.restorePurchases();
  }), [run]);

  return (
    <View style={{ marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: "#1a1a2e", borderWidth: 1, borderColor: "#e94560" }}>
      <AtomicText type="labelLarge" style={{ color: "#e94560", marginBottom: 12, textAlign: "center" }}>
        DEV TEST PANEL
      </AtomicText>
      <View style={{ gap: 8 }}>
        {isPremium && <DevButton label="Cancel" color="#e94560" loading={loading} onPress={handleCancel} />}
        {!isPremium && <DevButton label="Restore" color="#0f3460" loading={loading} onPress={handleRestore} />}
      </View>
    </View>
  );
};

const DevButton: React.FC<{ label: string; color: string; loading: string | null; onPress: () => void }> = ({ label, color, loading, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={!!loading}
    style={{ backgroundColor: loading === label ? "#555" : color, padding: 12, borderRadius: 8, alignItems: "center" }}
  >
    <AtomicText type="labelMedium" style={{ color: "#fff" }}>
      {loading === label ? `${label}...` : label}
    </AtomicText>
  </Pressable>
);
