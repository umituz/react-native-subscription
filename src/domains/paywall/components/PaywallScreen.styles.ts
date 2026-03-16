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
    backgroundColor: "#000",
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
});
