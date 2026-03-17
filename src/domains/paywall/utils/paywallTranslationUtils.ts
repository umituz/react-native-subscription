import { PaywallTranslations } from "../entities/types";
import { PaywallFeedbackTranslations } from "../../subscription/presentation/components/feedback/PaywallFeedbackScreen.types";

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

/**
 * Creates standardized feedback translations.
 */
export const createFeedbackTranslations = (
  t: (key: string) => string,
  overrides?: Partial<PaywallFeedbackTranslations>
): PaywallFeedbackTranslations => ({
  title: t("feedback.title"),
  subtitle: t("feedback.subtitle"),
  submit: t("feedback.submit"),
  otherPlaceholder: t("feedback.otherPlaceholder"),
  reasons: {
    too_expensive: t("feedback.reasons.too_expensive"),
    no_need: t("feedback.reasons.no_need"),
    trying_out: t("feedback.reasons.trying_out"),
    technical_issues: t("feedback.reasons.technical_issues"),
    other: t("feedback.reasons.other"),
  },
  ...overrides,
});
