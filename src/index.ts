/**
 * CORE Exports
 *
 * Essential subscription & paywall features - all apps need these
 * No optional features to keep bundle size minimal
 */

// ============================================================================
// DOMAIN LAYER - Constants & Types
// ============================================================================

export {
  USER_TIER,
  SUBSCRIPTION_STATUS,
  PERIOD_TYPE,
  PACKAGE_TYPE,
  PLATFORM,
  PURCHASE_SOURCE,
  PURCHASE_TYPE,
  ANONYMOUS_CACHE_KEY,
} from "./domains/subscription/core/SubscriptionConstants";

export type {
  UserTierType,
  SubscriptionStatusType,
  PeriodType,
  PackageType,
  Platform,
  PurchaseSource,
  PurchaseType,
} from "./domains/subscription/core/SubscriptionConstants";

export {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
  resolveSubscriptionStatus,
} from "./domains/subscription/core/SubscriptionStatus";
export type { SubscriptionStatus, StatusResolverInput } from "./domains/subscription/core/SubscriptionStatus";

// ============================================================================
// DOMAIN EVENTS
// ============================================================================

export { SUBSCRIPTION_EVENTS } from "./domains/subscription/core/events/SubscriptionEvents";
export type { SubscriptionEventType, SyncStatusChangedEvent } from "./domains/subscription/core/events/SubscriptionEvents";
export type { PurchaseCompletedEvent, RenewalDetectedEvent, PremiumStatusChangedEvent } from "./domains/subscription/core/SubscriptionEvents";
export { FLOW_EVENTS } from "./domains/subscription/core/events/FlowEvents";
export type { FlowEventType, OnboardingCompletedEvent, PaywallShownEvent, PaywallClosedEvent } from "./domains/subscription/core/events/FlowEvents";

export type { SubscriptionMetadata } from "./domains/subscription/core/types/SubscriptionMetadata";
export type { PremiumStatus as PremiumStatusMetadata } from "./domains/subscription/core/types/PremiumStatus";
export type { CreditInfo } from "./domains/subscription/core/types/CreditInfo";

// ============================================================================
// CREDITS TYPES (Core credits, wallet is separate)
// ============================================================================

export type {
  CreditType,
  UserCredits,
  CreditsConfig,
  CreditsResult,
  DeductCreditsResult,
} from "./domains/credits/core/Credits";

// ============================================================================
// PAYWALL TYPES
// ============================================================================

export type { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "./domains/paywall/entities/types";

// ============================================================================
// APPLICATION LAYER - Ports
// ============================================================================

export type { ISubscriptionRepository } from "./shared/application/ports/ISubscriptionRepository";
export type { IRevenueCatService } from "./shared/application/ports/IRevenueCatService";

// ============================================================================
// RESULT PATTERN
// ============================================================================

export {
  success,
  failure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  tryCatch,
} from "./shared/utils/Result";
export type { Result, Success, Failure } from "./shared/utils/Result";

// ============================================================================
// INFRASTRUCTURE LAYER - Core Services (No wallet)
// ============================================================================

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

// ============================================================================
// PRESENTATION LAYER - Hooks (Core)
// ============================================================================

export { useAuthAwarePurchase } from "./domains/subscription/presentation/useAuthAwarePurchase";
export { useCredits } from "./domains/credits/presentation/useCredits";
export { useDeductCredit } from "./domains/credits/presentation/deduct-credit/useDeductCredit";
export { useFeatureGate } from "./domains/subscription/presentation/useFeatureGate";
export { usePaywallVisibility, paywallControl } from "./domains/subscription/presentation/usePaywallVisibility";
export { usePremiumStatus } from "./domains/subscription/presentation/usePremiumStatus";
export { usePremiumPackages } from "./domains/subscription/presentation/usePremiumPackages";
export { usePremiumActions } from "./domains/subscription/presentation/usePremiumActions";
export { useSubscriptionFlowStore } from "./domains/subscription/presentation/useSubscriptionFlow";
export type { SubscriptionFlowState, SubscriptionFlowActions, SubscriptionFlowStore } from "./domains/subscription/presentation/useSubscriptionFlow";
export { useSubscriptionStatus } from "./domains/subscription/presentation/useSubscriptionStatus";
export type { SubscriptionStatusResult } from "./domains/subscription/presentation/useSubscriptionStatus.types";

export type { PremiumStatus } from "./domains/subscription/presentation/usePremiumStatus";
export type { PremiumPackages } from "./domains/subscription/presentation/usePremiumPackages";
export type { PremiumActions } from "./domains/subscription/presentation/usePremiumActions";

export { usePaywallFeedback } from "./presentation/hooks/feedback/usePaywallFeedback";
export {
  usePaywallFeedbackSubmit,
  useSettingsFeedbackSubmit,
} from "./presentation/hooks/feedback/useFeedbackSubmit";

export type {
  UsePaywallFeedbackSubmitOptions,
  SettingsFeedbackData,
  UseSettingsFeedbackSubmitOptions,
} from "./presentation/hooks/feedback/useFeedbackSubmit";

// ============================================================================
// PRESENTATION LAYER - Components (Core - No wallet)
// ============================================================================

export { PremiumDetailsCard } from "./domains/subscription/presentation/components/details/PremiumDetailsCard";
export type {
  PremiumDetailsTranslations,
  PremiumDetailsCardProps,
} from "./domains/subscription/presentation/components/details/PremiumDetailsCardTypes";

export { PremiumStatusBadge } from "./domains/subscription/presentation/components/details/PremiumStatusBadge";
export type { PremiumStatusBadgeProps } from "./domains/subscription/presentation/components/details/PremiumStatusBadge.types";

export { SubscriptionSection } from "./domains/subscription/presentation/components/sections/SubscriptionSection";
export type { SubscriptionSectionProps } from "./domains/subscription/presentation/components/sections/SubscriptionSection.types";

export { PaywallFeedbackScreen } from "./domains/subscription/presentation/components/feedback/PaywallFeedbackScreen";
export type { PaywallFeedbackScreenProps } from "./domains/subscription/presentation/components/feedback/PaywallFeedbackScreen.types";

export type {
  SubscriptionDetailConfig,
  SubscriptionDetailTranslations,
  SubscriptionDisplayFlags,
  UpgradePromptConfig,
} from "./domains/subscription/presentation/screens/SubscriptionDetailScreen.types";

export { SubscriptionDetailScreen } from "./domains/subscription/presentation/screens/SubscriptionDetailScreen";
export type { SubscriptionDetailScreenProps } from "./domains/subscription/presentation/screens/SubscriptionDetailScreen.types";

export { PaywallScreen } from "./domains/paywall/components/PaywallScreen";
export type { PaywallScreenProps } from "./domains/paywall/components/PaywallScreen.types";

export { usePaywallOrchestrator } from "./domains/paywall/hooks/usePaywallOrchestrator";
export type { PaywallOrchestratorOptions } from "./domains/paywall/hooks/usePaywallOrchestrator";

// ============================================================================
// ROOT FLOW COMPONENTS
// ============================================================================

export { ManagedSubscriptionFlow } from "./domains/subscription/presentation/components/ManagedSubscriptionFlow";
export type { ManagedSubscriptionFlowProps } from "./domains/subscription/presentation/components/ManagedSubscriptionFlow";
export { SubscriptionFlowStatus } from "./domains/subscription/presentation/useSubscriptionFlow";
export { SubscriptionFlowProvider, useSubscriptionFlowStatus } from "./domains/subscription/presentation/providers/SubscriptionFlowProvider";

// ============================================================================
// UTILS (Core)
// ============================================================================

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

// ============================================================================
// INIT MODULE
// ============================================================================

export {
  createSubscriptionInitModule,
  cleanupSubscriptionModule,
  type SubscriptionInitModuleConfig,
} from './init';
