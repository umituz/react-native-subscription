/**
 * Subscription Detail Screen
 * Composition of subscription components
 * No business logic - pure presentation
 */

import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import { SubscriptionHeader } from "./components/SubscriptionHeader";
import { CreditsList } from "./components/CreditsList";
import { SubscriptionActions } from "./components/SubscriptionActions";
import type { SubscriptionStatusType } from "../components/details/PremiumStatusBadge";
import type { CreditInfo } from "../components/details/PremiumDetailsCard";

export interface SubscriptionDetailTranslations {
    title: string;
    statusLabel?: string;
    statusActive?: string;
    statusExpired?: string;
    statusFree?: string;
    expiresLabel?: string;
    purchasedLabel?: string;
    lifetimeLabel?: string;
    creditsTitle?: string;
    remainingLabel?: string;
    usageTitle?: string;
    manageButton?: string;
    upgradeButton?: string;
    creditsResetInfo?: string;
}

export interface SubscriptionDetailConfig {
    statusType: SubscriptionStatusType;
    isPremium: boolean;
    expirationDate?: string | null;
    purchaseDate?: string | null;
    isLifetime?: boolean;
    daysRemaining?: number | null;
    credits?: CreditInfo[];
    translations: SubscriptionDetailTranslations;
    onManageSubscription?: () => void;
    onUpgrade?: () => void;
}

export interface SubscriptionDetailScreenProps {
    config: SubscriptionDetailConfig;
}

export const SubscriptionDetailScreen: React.FC<
    SubscriptionDetailScreenProps
> = ({ config }) => {
    const tokens = useAppDesignTokens();
    const showCredits = config.credits && config.credits.length > 0;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: tokens.colors.backgroundPrimary }]}
            contentContainerStyle={styles.content}
        >
            <SubscriptionHeader
                statusType={config.statusType}
                isPremium={config.isPremium}
                isLifetime={config.isLifetime}
                expirationDate={config.expirationDate}
                purchaseDate={config.purchaseDate}
                daysRemaining={config.daysRemaining}
                translations={config.translations}
            />

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

            <SubscriptionActions
                isPremium={config.isPremium}
                manageButtonLabel={config.translations.manageButton}
                upgradeButtonLabel={config.translations.upgradeButton}
                onManage={config.onManageSubscription}
                onUpgrade={config.onUpgrade}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 16,
    },
});
