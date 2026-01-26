/**
 * React Native Subscription - Public API
 */

export * from "./domains/wallet";
export * from "./domains/paywall";
export * from "./domains/config";

// Domain Layer
export {
  SUBSCRIPTION_STATUS,
  PERIOD_TYPE,
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
  resolveSubscriptionStatus,
} from "./domain/entities/SubscriptionStatus";
export type { SubscriptionStatus, SubscriptionStatusType, PeriodType, StatusResolverInput } from "./domain/entities/SubscriptionStatus";
export type { SubscriptionConfig } from "./domain/value-objects/SubscriptionConfig";
export type { ISubscriptionRepository } from "./application/ports/ISubscriptionRepository";

// Result Pattern (Functional Error Handling)
export {
  success,
  failure,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  map,
  flatMap,
  tryCatch,
  tryCatchSync,
  combine,
} from "./domain/value-objects/Result";
export type { Result, Success, Failure } from "./domain/value-objects/Result";

// Infrastructure Layer
export { SubscriptionService, initializeSubscriptionService } from "./infrastructure/services/SubscriptionService";
export {
  submitFeedback,
  submitPaywallFeedback,
  submitSettingsFeedback,
  type FeedbackData,
  type FeedbackSubmitResult,
} from "./infrastructure/services/FeedbackService";
export { initializeSubscription, type SubscriptionInitConfig, type CreditPackageConfig } from "./infrastructure/services/SubscriptionInitializer";
export {
  getDeviceId,
  checkTrialEligibility,
  recordTrialStart,
  recordTrialEnd,
  recordTrialConversion,
  TRIAL_CONFIG,
  type DeviceTrialRecord,
  type TrialEligibilityResult,
} from "./infrastructure/services/TrialService";
export { CreditsRepository, createCreditsRepository } from "./infrastructure/repositories/CreditsRepository";
export { configureCreditsRepository, getCreditsRepository, getCreditsConfig, resetCreditsRepository, isCreditsRepositoryConfigured } from "./infrastructure/repositories/CreditsRepositoryProvider";
export {
  getSavedPurchase,
  clearSavedPurchase,
  configureAuthProvider,
  type PurchaseAuthProvider,
} from "./presentation/hooks/useAuthAwarePurchase";

// Presentation Layer - Hooks
export * from "./presentation/hooks";

// Presentation Layer - Components
export * from "./presentation/components/details/PremiumDetailsCard";
export * from "./presentation/components/details/PremiumStatusBadge";
export * from "./presentation/components/sections/SubscriptionSection";
export * from "./presentation/components/feedback/PaywallFeedbackModal";
export * from "./presentation/components/overlay";
export * from "./presentation/screens/SubscriptionDetailScreen";
export * from "./presentation/types/SubscriptionDetailTypes";

// Presentation Layer - Stores
export * from "./presentation/stores";

// Credits Domain
export type {
  CreditType,
  UserCredits,
  CreditsConfig,
  CreditsResult,
  DeductCreditsResult,
  PurchaseSource,
  PurchaseType,
  CreditAllocation,
  PackageAllocationMap,
} from "./domain/entities/Credits";
export { DEFAULT_CREDITS_CONFIG } from "./domain/entities/Credits";
export { InsufficientCreditsError } from "./domain/errors/InsufficientCreditsError";

// Utils
export * from "./utils";

// RevenueCat
export * from "./revenuecat";

// App Service Helpers (for configureAppServices)
export {
  createCreditService,
  createPaywallService,
  type CreditServiceConfig,
  type ICreditService,
  type IPaywallService,
} from "./infrastructure/services/app-service-helpers";

// Init Module Factory
export {
  createSubscriptionInitModule,
  type SubscriptionInitModuleConfig,
} from './init';
