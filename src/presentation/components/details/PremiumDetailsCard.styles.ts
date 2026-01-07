/**
 * Premium Details Card Styles
 * StyleSheet for PremiumDetailsCard component
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  freeUserHeader: {
    marginBottom: 4,
  },
  freeUserTextContainer: {
    gap: 6,
  },
  premiumButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  detailsSection: {
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 4,
    fontWeight: "600",
  },
  creditsSection: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionsSection: {
    gap: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
