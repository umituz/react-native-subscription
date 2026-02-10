/**
 * React Native Subscription - Public API
 */

// Domain Layer - Constants & Types (Now in domains/subscription/core)
// Domain Layer - Constants & Types
export * from "./domains/subscription/core/SubscriptionConstants";
export {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
  resolveSubscriptionStatus,
} from "./domains/subscription/core/SubscriptionStatus";
export type { SubscriptionStatus, StatusResolverInput } from "./domains/subscription/core/SubscriptionStatus";




// Application Layer - Ports
export type { ISubscriptionRepository } from "./shared/application/ports/ISubscriptionRepository";
export type { IRevenueCatService } from "./shared/application/ports/IRevenueCatService";

// Result Pattern (Now in shared/utils)
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
} from "./shared/utils/Result";
export type { Result, Success, Failure } from "./shared/utils/Result";

// Infrastructure Layer (Services & Repositories)
export { initializeSubscription, type SubscriptionInitConfig, type CreditPackageConfig } from "./domains/subscription/application/SubscriptionInitializer";
export { 
  getDeviceId,
  checkTrialEligibility,
  recordTrialStart,
  recordTrialEnd,
  recordTrialConversion,
  type TrialEligibilityResult 
} from "./domains/trial/application/TrialService";

export { CreditsRepository } from "./domains/credits/infrastructure/CreditsRepository";
export { 
  configureCreditsRepository, 
  getCreditsRepository, 
  getCreditsConfig, 
  isCreditsRepositoryConfigured 
} from "./domains/credits/infrastructure/CreditsRepositoryManager";

// Presentation Layer - Hooks (Point to the bridge)
// Presentation Layer - Hooks
export { useAuthAwarePurchase } from "./domains/subscription/presentation/useAuthAwarePurchase";
export { useCredits } from "./domains/credits/presentation/useCredits";
export { useDeductCredit } from "./domains/credits/presentation/useDeductCredit";
export { useFeatureGate } from "./domains/subscription/presentation/useFeatureGate";
export { usePaywallVisibility } from "./domains/subscription/presentation/usePaywallVisibility";
export { usePremium } from "./domains/subscription/presentation/usePremium";
export { useSubscriptionStatus } from "./domains/subscription/presentation/useSubscriptionStatus";
export * from "./presentation/hooks/feedback/usePaywallFeedback";
export * from "./presentation/hooks/feedback/useFeedbackSubmit";


// Presentation Layer - Components
export * from "./domains/subscription/presentation/components/details/PremiumDetailsCard";
export * from "./domains/subscription/presentation/components/details/PremiumStatusBadge";
export * from "./domains/subscription/presentation/components/sections/SubscriptionSection";
export * from "./domains/subscription/presentation/components/feedback/PaywallFeedbackModal";
export * from "./domains/subscription/presentation/screens/SubscriptionDetailScreen";
export * from "./domains/paywall/components/PaywallContainer";

export type {
  CreditType,
  UserCredits,
  CreditsConfig,
  CreditsResult,
  DeductCreditsResult,
} from "./domains/credits/core/Credits";


// Utils
// Utils
export * from "./utils/creditMapper";
export * from "./utils/packagePeriodUtils";
export * from "./utils/packageTypeDetector";
export * from "./utils/premiumStatusUtils";
export * from "./utils/priceUtils";
export * from "./utils/tierUtils";
export * from "./utils/types";
export * from "./utils/validation";
export * from "./utils/dateUtils";
export * from "./utils/appUtils";


// Init Module Factory
export {
  createSubscriptionInitModule,
  type SubscriptionInitModuleConfig,
} from './init';
