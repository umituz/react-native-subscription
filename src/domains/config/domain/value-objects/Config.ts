/**
 * Subscription Configuration Value Object
 * Defines app-specific subscription plans and settings
 */

import type { Plan } from "../entities";

export interface ConfigTranslations {
    readonly title: string;
    readonly subtitle?: string;
    readonly creditsLabel: string;
    readonly creditsRemaining: string;
    readonly creditsTotal: string;
    readonly upgradeButton: string;
    readonly manageButton: string;
    readonly restoreButton: string;
}

export interface Config {
    readonly plans: readonly Plan[];
    readonly collectionName: string;
    readonly entitlementId: string;
    readonly translations: ConfigTranslations;
    readonly showCreditDetails?: boolean;
    readonly allowRestore?: boolean;
    readonly costPerCredit?: number;
    readonly commissionRate?: number;
}

export const DEFAULT_TRANSLATIONS: ConfigTranslations = {
    title: "subscription.title",
    subtitle: "subscription.subtitle",
    creditsLabel: "subscription.credits",
    creditsRemaining: "subscription.creditsRemaining",
    creditsTotal: "subscription.creditsTotal",
    upgradeButton: "subscription.upgrade",
    manageButton: "subscription.manage",
    restoreButton: "subscription.restore",
};

export const DEFAULT_CONFIG: Partial<Config> = {
    collectionName: "credits",
    entitlementId: "premium",
    translations: DEFAULT_TRANSLATIONS,
    showCreditDetails: true,
    allowRestore: true,
    costPerCredit: 0.04,
    commissionRate: 0.30,
};
