export const USER_TIER = {
  ANONYMOUS: 'anonymous',
  FREEMIUM: 'freemium',
  PREMIUM: 'premium',
} as const;

export type UserTierType = (typeof USER_TIER)[keyof typeof USER_TIER];

export const DEFAULT_ENTITLEMENT_ID = 'premium';

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  TRIAL_CANCELED: 'trial_canceled',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
  NONE: 'none',
} as const;

export type SubscriptionStatusType = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export const PERIOD_TYPE = {
  NORMAL: 'NORMAL',
  INTRO: 'INTRO',
  TRIAL: 'TRIAL',
} as const;

export type PeriodType = (typeof PERIOD_TYPE)[keyof typeof PERIOD_TYPE];

export const PACKAGE_TYPE = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
  UNKNOWN: 'unknown',
} as const;

export type PackageType = (typeof PACKAGE_TYPE)[keyof typeof PACKAGE_TYPE];

export const PLATFORM = {
  IOS: 'ios',
  ANDROID: 'android',
} as const;

export type Platform = (typeof PLATFORM)[keyof typeof PLATFORM];

export const PURCHASE_SOURCE = {
  ONBOARDING: 'onboarding',
  SETTINGS: 'settings',
  UPGRADE_PROMPT: 'upgrade_prompt',
  HOME_SCREEN: 'home_screen',
  FEATURE_GATE: 'feature_gate',
  CREDITS_EXHAUSTED: 'credits_exhausted',
  RENEWAL: 'renewal',
} as const;

export type PurchaseSource = (typeof PURCHASE_SOURCE)[keyof typeof PURCHASE_SOURCE];

export const PURCHASE_TYPE = {
  INITIAL: 'initial',
  RENEWAL: 'renewal',
  UPGRADE: 'upgrade',
} as const;

export type PurchaseType = (typeof PURCHASE_TYPE)[keyof typeof PURCHASE_TYPE];


