/**
 * Purchase Loading Overlay
 * Full-screen overlay shown during purchase operations
 * Locks the UI and shows a spinner with optional message
 *
 * This is now a props-based component. Pass isLoading from parent component.
 */

import React from "react";
import { View, Modal, StyleSheet } from "react-native";
import { AtomicSpinner, AtomicText } from "@umituz/react-native-design-system/atoms";
import { useAppDesignTokens } from "@umituz/react-native-design-system/theme";
import type { PurchaseLoadingOverlayProps } from "./PurchaseLoadingOverlay.types";

export type { PurchaseLoadingOverlayProps };

export const PurchaseLoadingOverlay: React.FC<PurchaseLoadingOverlayProps> = React.memo(
  ({ loadingText, isLoading }) => {
    const tokens = useAppDesignTokens();

    return (
      <Modal visible={isLoading} transparent animationType="none" statusBarTranslucent>
        <View style={[styles.container, { backgroundColor: "rgba(0, 0, 0, 0.7)" }]}>
          <View style={[styles.content, { backgroundColor: tokens.colors.surface }]}>
            <AtomicSpinner size="lg" color="primary" />
            {loadingText && (
              <AtomicText
                type="bodyLarge"
                style={[styles.text, { color: tokens.colors.textPrimary }]}
              >
                {loadingText}
              </AtomicText>
            )}
          </View>
        </View>
      </Modal>
    );
  }
);

PurchaseLoadingOverlay.displayName = "PurchaseLoadingOverlay";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  text: {
    marginTop: 16,
    textAlign: "center",
  },
});
