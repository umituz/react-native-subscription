import { StyleSheet } from "react-native";

export const paywallScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  plans: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  loading: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  cta: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontWeight: "600",
  },
  features: {
    padding: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  restoreButton: {
    paddingVertical: 8,
  },
  restoreButtonDisabled: {
    opacity: 0.5,
  },
  footerLink: {
    fontSize: 12,
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
});
