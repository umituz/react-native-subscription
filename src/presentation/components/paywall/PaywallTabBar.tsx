/**
 * Paywall Tab Bar Component
 * Single Responsibility: Display and handle tab selection
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AtomicText } from "@umituz/react-native-design-system";
import { useAppDesignTokens } from "@umituz/react-native-design-system";
import type { PaywallTabType } from "../../../domain/entities/paywall/PaywallTab";

interface PaywallTabBarProps {
  activeTab: PaywallTabType;
  onTabChange: (tab: PaywallTabType) => void;
  creditsLabel?: string;
  subscriptionLabel?: string;
}

export const PaywallTabBar: React.FC<PaywallTabBarProps> = React.memo(
  ({
    activeTab,
    onTabChange,
    creditsLabel = "Credits",
    subscriptionLabel = "Subscription",
  }) => {
    const tokens = useAppDesignTokens();

    const renderTab = (tab: PaywallTabType, label: string) => {
      const isActive = activeTab === tab;

      return (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            {
              backgroundColor: isActive
                ? tokens.colors.primary
                : tokens.colors.surfaceSecondary,
            },
          ]}
          onPress={() => onTabChange(tab)}
          activeOpacity={0.8}
        >
          <AtomicText
            type="labelLarge"
            style={[
              styles.tabText,
              {
                color: isActive
                  ? tokens.colors.onPrimary
                  : tokens.colors.textSecondary,
              },
            ]}
          >
            {label}
          </AtomicText>
        </TouchableOpacity>
      );
    };

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: tokens.colors.surfaceSecondary },
        ]}
      >
        {renderTab("credits", creditsLabel)}
        {renderTab("subscription", subscriptionLabel)}
      </View>
    );
  },
);

PaywallTabBar.displayName = "PaywallTabBar";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontWeight: "600",
  },
});
