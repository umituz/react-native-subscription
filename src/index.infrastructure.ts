/**
 * CORE Exports - Infrastructure & Utils
 */

// Infrastructure Layer - Core Services
export { initializeSubscription } from "./domains/subscription/application/initializer/SubscriptionInitializer";
export type { SubscriptionInitConfig, CreditPackageConfig } from "./domains/subscription/application/SubscriptionInitializerTypes";

export { CreditsRepository } from "./domains/credits/infrastructure/CreditsRepository";
export {
  configureCreditsRepository,
  getCreditsRepository,
  getCreditsConfig,
  isCreditsRepositoryConfigured
} from "./domains/credits/infrastructure/CreditsRepositoryManager";

export { CreditLimitService, calculateCreditLimit } from "./domains/credits/domain/services/CreditLimitService";

// Utils
export {
  getCreditAllocation,
  createCreditAmountsFromPackages,
} from "./utils/creditMapper";

export {
  isCreditPackage,
  detectPackageType,
} from "./utils/packageTypeDetector";
export type { SubscriptionPackageType } from "./utils/packageTypeDetector";

export {
  formatPrice,
  getBillingPeriodSuffix,
  formatPriceWithPeriod,
} from "./utils/priceUtils";

export type { UserTierInfo, PremiumStatusFetcher } from "./utils/types";

export type { DateLike } from "./utils/dateUtils.core";

export {
  isNow,
  isPast,
  isFuture,
  isValidDate,
  toSafeDate,
  formatISO,
  now,
} from "./utils/dateUtils.core";

export {
  daysBetween,
  daysUntil,
  isSameDay,
  isToday,
} from "./utils/dateUtils.compare";

export {
  formatRelative,
  formatShort,
  formatMedium,
  formatLong,
} from "./utils/dateUtils.format";

export {
  addDays,
  addMonths,
  addYears,
} from "./utils/dateUtils.math";

export { getAppVersion, validatePlatform } from "./utils/appUtils";

export { toDate, toISOString, toTimestamp, getCurrentISOString } from "./shared/utils/dateConverter";

export { createPaywallTranslations, createFeedbackTranslations } from "./domains/paywall/utils/paywallTranslationUtils";

// Init Module
export {
  createSubscriptionInitModule,
  cleanupSubscriptionModule,
  type SubscriptionInitModuleConfig,
} from './init';
