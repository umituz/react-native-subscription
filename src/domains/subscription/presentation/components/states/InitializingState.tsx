/**
 * Initializing State Component
 *
 * Displays splash screen during initialization.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { ManagedSubscriptionFlowProps } from "../ManagedSubscriptionFlow.types";

interface InitializingStateProps {
  tokens: any;
  splash?: ManagedSubscriptionFlowProps["splash"];
}

export const InitializingState: React.FC<InitializingStateProps> = ({ tokens, splash }) => {
  if (!splash) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.background }]}>
      <Text style={[styles.appName, { color: tokens.colors.text }]}>
        {splash.appName}
      </Text>
      <Text style={[styles.tagline, { color: tokens.colors.textSecondary }]}>
        {splash.tagline}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
  },
});
