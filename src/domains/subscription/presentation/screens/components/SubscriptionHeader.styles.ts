import { StyleSheet } from "react-native";
import type { AppDesignTokens } from "@umituz/react-native-design-system";

export const createSubscriptionHeaderStyles = (tokens: AppDesignTokens) =>
  StyleSheet.create({
    container: {
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing.lg,
      gap: tokens.spacing.lg,
      backgroundColor: tokens.colors.surface,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    titleContainer: {
      flex: 1,
      marginRight: tokens.spacing.md,
    },
    title: {
      fontWeight: "700",
    },
    details: {
      gap: tokens.spacing.md,
      paddingTop: tokens.spacing.md,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: tokens.spacing.lg,
    },
    label: {
      flex: 1,
    },
    value: {
      fontWeight: "600",
      textAlign: "right",
    },
  });
