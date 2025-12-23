/**
 * Paywall Legal Footer Styles
 * StyleSheet definitions for paywall legal footer
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    width: "100%",
  },
  termsText: {
    textAlign: "center",
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  legalLinksWrapper: {
    width: "100%",
    alignItems: "center",
  },
  legalLinksContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  linkItem: {
    paddingVertical: 2,
  },
  linkText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 12,
    opacity: 0.3,
  },
});
