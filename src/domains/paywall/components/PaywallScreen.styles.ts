import { StyleSheet, Platform } from "react-native";

export const paywallScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header / Hero
  heroContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
    height: 140,
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 30, // More modern rounded corners
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.8,
    paddingHorizontal: 12,
  },

  // Sections
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 13,
    opacity: 0.6,
  },

  // Features
  featuresContainer: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  featureText: {
    flex: 1,
    fontWeight: "500",
    fontSize: 15,
  },

  // Fixed Footer
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cta: {
    borderRadius: 18,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Footer Links
  footer: {
    marginTop: 16,
    alignItems: "center",
    gap: 12,
  },
  restoreButton: {
    paddingVertical: 4,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: "500",
    textDecorationLine: "underline",
    opacity: 0.7,
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 8,
  },

  // Close Button
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  
  // List
  listContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
