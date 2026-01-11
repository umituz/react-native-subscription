/**
 * Purchase Loading Overlay
 * Full-screen overlay shown during purchase operations
 * Locks the UI and shows a spinner with optional message
 */

import React from "react";
import { View, Modal, StyleSheet } from "react-native";
import { AtomicSpinner, AtomicText, useAppDesignTokens } from "@umituz/react-native-design-system";
import { usePurchaseLoadingStore, selectIsPurchasing } from "../../stores";

export interface PurchaseLoadingOverlayProps {
  /** Loading message to display */
  loadingText?: string;
}

export const PurchaseLoadingOverlay: React.FC<PurchaseLoadingOverlayProps> = React.memo(
  ({ loadingText }) => {
    const tokens = useAppDesignTokens();
    const isPurchasing = usePurchaseLoadingStore(selectIsPurchasing);

    if (!isPurchasing) return null;

    return (
      <Modal visible transparent animationType="fade" statusBarTranslucent>
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
