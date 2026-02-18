/**
 * Screen Layout Component
 * Centralized layout with safe area handling and consistent styling.
 */
import React from "react";
import { StyleSheet, View, ScrollView, type ViewStyle, type ColorValue } from "react-native";
import { useSafeAreaInsets, type Edge } from "react-native-safe-area-context";
import { useAppDesignTokens } from "@umituz/react-native-design-system";

interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  edges?: Edge[];
  backgroundColor?: ColorValue;
  contentContainerStyle?: ViewStyle;
  footer?: React.ReactNode;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  scrollable = false,
  edges = ["top", "bottom", "left", "right"],
  backgroundColor,
  contentContainerStyle,
  footer,
}) => {
  const tokens = useAppDesignTokens();
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: backgroundColor ?? tokens.colors.backgroundPrimary,
      paddingTop: edges.includes("top") ? insets.top : 0,
      paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
      paddingLeft: edges.includes("left") ? insets.left : 0,
      paddingRight: edges.includes("right") ? insets.right : 0,
    },
  ];

  const content = (
    <>
      <View style={[styles.flex, contentContainerStyle]}>
        {children}
      </View>
      {footer}
    </>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={[styles.scrollContent]}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
});
