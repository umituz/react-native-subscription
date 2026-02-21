export interface SubscriptionFeature {
    icon: string;
    text: string;
}

export interface PaywallTranslations {
    title: string;
    subtitle?: string;
    purchaseButtonText: string;
    restoreButtonText: string;
    loadingText: string;
    emptyText: string;
    processingText: string;
    privacyText?: string;
    termsOfServiceText?: string;
    bestValueBadgeText?: string;
}

export interface PaywallLegalUrls {
    privacyUrl?: string;
    termsUrl?: string;
}
