// Domain Layer - Constants & Types
export * from "./domains/subscription/core/SubscriptionConstants";
export type { SubscriptionMetadata } from "./domains/subscription/core/types/SubscriptionMetadata";
export type { PremiumStatus } from "./domains/subscription/core/types/PremiumStatus";
export type { CreditInfo } from "./domains/subscription/core/types/CreditInfo";
export {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
  resolveSubscriptionStatus,
} from "./domains/subscription/core/SubscriptionStatus";
export type { SubscriptionStatus, StatusResolverInput } from "./domains/subscription/core/SubscriptionStatus";

// Application Layer - Ports
export type { ISubscriptionRepository } from "./shared/application/ports/ISubscriptionRepository";
export type { IRevenueCatService } from "./shared/application/ports/IRevenueCatService";

// Result Pattern
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

// Infrastructure Layer (Services & Repositories)
export { initializeSubscription } from "./domains/subscription/application/initializer/SubscriptionInitializer";
export type { SubscriptionInitConfig, CreditPackageConfig } from "./domains/subscription/application/SubscriptionInitializerTypes";

export { CreditsRepository } from "./domains/credits/infrastructure/CreditsRepository";
export { 
  configureCreditsRepository, 
  getCreditsRepository, 
  getCreditsConfig, 
  isCreditsRepositoryConfigured 
} from "./domains/credits/infrastructure/CreditsRepositoryManager";

// Presentation Layer - Hooks
export { useAuthAwarePurchase } from "./domains/subscription/presentation/useAuthAwarePurchase";
export { useCredits } from "./domains/credits/presentation/useCredits";
export { useDeductCredit } from "./domains/credits/presentation/deduct-credit/useDeductCredit";
export { useFeatureGate } from "./domains/subscription/presentation/useFeatureGate";
export { usePaywallVisibility, paywallControl } from "./domains/subscription/presentation/usePaywallVisibility";
export { usePremium } from "./domains/subscription/presentation/usePremium";
export { useSubscriptionFlow, useSubscriptionFlowStore } from "./domains/subscription/presentation/useSubscriptionFlow";
export type { SubscriptionFlowState, SubscriptionFlowActions, SubscriptionFlowStore } from "./domains/subscription/presentation/useSubscriptionFlow";
export { useSubscriptionStatus } from "./domains/subscription/presentation/useSubscriptionStatus";
export * from "./domains/subscription/presentation/useSubscriptionStatus.types";
export * from "./presentation/hooks/feedback/usePaywallFeedback";
export * from "./presentation/hooks/feedback/useFeedbackSubmit";

// Presentation Layer - Components
export * from "./domains/subscription/presentation/components/details/PremiumDetailsCard";
export { PremiumStatusBadge } from "./domains/subscription/presentation/components/details/PremiumStatusBadge";
export type { PremiumStatusBadgeProps } from "./domains/subscription/presentation/components/details/PremiumStatusBadge.types";
export * from "./domains/subscription/presentation/components/sections/SubscriptionSection";
export * from "./domains/subscription/presentation/components/feedback/PaywallFeedbackScreen";
export * from "./domains/subscription/presentation/screens/SubscriptionDetailScreen";
export type {
  SubscriptionDetailConfig,
  SubscriptionDetailTranslations,
  SubscriptionDisplayFlags,
  UpgradePromptConfig,
} from "./domains/subscription/presentation/screens/SubscriptionDetailScreen.types";
export { PaywallScreen } from "./domains/paywall/components/PaywallScreen";
export type { PaywallScreenProps } from "./domains/paywall/components/PaywallScreen.types";
export { usePaywallOrchestrator } from "./domains/paywall/hooks/usePaywallOrchestrator";
export type { PaywallOrchestratorOptions } from "./domains/paywall/hooks/usePaywallOrchestrator";

export type {
  CreditType,
  UserCredits,
  CreditsConfig,
  CreditsResult,
  DeductCreditsResult,
} from "./domains/credits/core/Credits";

// Utils
export * from "./utils/creditMapper";
export * from "./utils/packageTypeDetector";
export * from "./utils/priceUtils";
export * from "./utils/types";
export * from "./utils/dateUtils";
export { getAppVersion, validatePlatform } from "./utils/appUtils";
export { toDate, toISOString, toTimestamp, getCurrentISOString } from "./shared/utils/dateConverter";

// Credits Query Keys
export { creditsQueryKeys } from "./domains/credits/presentation/creditsQueryKeys";

// Paywall Types & Utils
export type { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "./domains/paywall/entities/types";
export { createPaywallTranslations, createFeedbackTranslations } from "./domains/paywall/utils/paywallTranslationUtils";

// Root Flow Components
export { ManagedSubscriptionFlow } from "./domains/subscription/presentation/components/ManagedSubscriptionFlow";
export type { ManagedSubscriptionFlowProps } from "./domains/subscription/presentation/components/ManagedSubscriptionFlow";

// Purchase Loading Overlay
export { PurchaseLoadingOverlay } from "./domains/subscription/presentation/components/overlay/PurchaseLoadingOverlay";
export type { PurchaseLoadingOverlayProps } from "./domains/subscription/presentation/components/overlay/PurchaseLoadingOverlay";

// Init Module Factory
export {
  createSubscriptionInitModule,
  cleanupSubscriptionModule,
  type SubscriptionInitModuleConfig,
} from './init';

// Wallet Domain
export {
  WalletScreen as WalletScreenContainer,
} from './domains/wallet/presentation/screens/WalletScreen';
export type {
  WalletScreenProps,
  WalletScreenTranslations,
} from './domains/wallet/presentation/screens/WalletScreen.types';
