/**
 * Paywall Types
 * All paywall-related type definitions
 */

export type PaywallMode = "subscription" | "credits" | "hybrid";

export type PaywallTabType = "credits" | "subscription";

export interface PaywallTab {
    id: PaywallTabType;
    label: string;
}

export interface CreditsPackage {
    id: string;
    credits: number;
    price: number;
    currency: string;
    bonus?: number;
    badge?: string;
    description?: string;
}

export interface SubscriptionFeature {
    icon: string;
    text: string;
}

export interface PaywallTranslations {
    title: string;
    subtitle?: string;
    creditsTabLabel?: string;
    subscriptionTabLabel?: string;
    purchaseButtonText: string;
    subscribeButtonText?: string;
    restoreButtonText: string;
    loadingText: string;
    emptyText: string;
    processingText: string;
    privacyText?: string;
    termsOfServiceText?: string;
}

export interface PaywallLegalUrls {
    privacyUrl?: string;
    termsUrl?: string;
}
