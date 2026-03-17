import { PaywallTranslations } from "../entities/types";

/**
 * Creates standardized paywall translations from a translation function.
 * Matches the structure used across the App Factory ecosystem.
 */
export const createPaywallTranslations = (
  t: (key: string) => string,
  overrides?: Partial<PaywallTranslations>
): PaywallTranslations => ({
  title: t("premium.title"),
  subtitle: t("premium.subtitle"),
  loadingText: t("paywall.loading"),
  emptyText: t("paywall.empty"),
  purchaseButtonText: t("paywall.purchase"),
  restoreButtonText: t("paywall.restore"),
  processingText: t("paywall.processing"),
  privacyText: t("auth.privacyPolicy"),
  termsOfServiceText: t("auth.termsOfService"),
  bestValueBadgeText: t("paywall.bestValue"),
  featuresTitle: t("paywall.featuresTitle"),
  plansTitle: t("paywall.plansTitle"),
  ...overrides,
});
