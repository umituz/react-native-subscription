import { useMemo } from "react";
import type { PaywallTranslations, PaywallLegalUrls } from "../entities";

type TranslationFunction = (key: string) => string;

interface PaywallTranslationKeys {
  title: string;
  subtitle: string;
  loadingText: string;
  emptyText: string;
  purchaseButtonText: string;
  restoreButtonText: string;
  processingText: string;
  privacyText: string;
  termsOfServiceText: string;
}

interface UsePaywallTranslationsParams {
  t: TranslationFunction;
  keys?: Partial<PaywallTranslationKeys>;
  legalUrls: PaywallLegalUrls;
  creditsLabel?: string;
}

interface UsePaywallTranslationsResult {
  translations: PaywallTranslations;
  legalUrls: PaywallLegalUrls;
  creditsLabel: string;
}

const DEFAULT_KEYS: PaywallTranslationKeys = {
  title: "premium.title",
  subtitle: "premium.subtitle",
  loadingText: "paywall.loading",
  emptyText: "paywall.empty",
  purchaseButtonText: "paywall.subscribe",
  restoreButtonText: "paywall.restore",
  processingText: "paywall.processing",
  privacyText: "auth.privacyPolicy",
  termsOfServiceText: "auth.termsOfService",
};

export const usePaywallTranslations = ({
  t,
  keys,
  legalUrls,
  creditsLabel,
}: UsePaywallTranslationsParams): UsePaywallTranslationsResult => {
  const mergedKeys = useMemo(
    () => ({ ...DEFAULT_KEYS, ...keys }),
    [keys],
  );

  const translations: PaywallTranslations = useMemo(
    () => ({
      title: t(mergedKeys.title),
      subtitle: t(mergedKeys.subtitle),
      loadingText: t(mergedKeys.loadingText),
      emptyText: t(mergedKeys.emptyText),
      purchaseButtonText: t(mergedKeys.purchaseButtonText),
      restoreButtonText: t(mergedKeys.restoreButtonText),
      processingText: t(mergedKeys.processingText),
      privacyText: t(mergedKeys.privacyText),
      termsOfServiceText: t(mergedKeys.termsOfServiceText),
    }),
    [t, mergedKeys],
  );

  const finalCreditsLabel = creditsLabel ?? t("paywall.credits");

  return {
    translations,
    legalUrls,
    creditsLabel: finalCreditsLabel,
  };
};

export type { UsePaywallTranslationsParams, UsePaywallTranslationsResult };
