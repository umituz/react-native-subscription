/**
 * React Native Subscription - Public API
 *
 * Subscription management and paywall UI for React Native apps
 * Domain-Driven Design (DDD) Architecture
 */

// =============================================================================
// DOMAIN LAYER - Errors
// =============================================================================

// =============================================================================
// DOMAIN LAYER - Subscription Status
// =============================================================================

export {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
} from "./domain/entities/SubscriptionStatus";
export type { SubscriptionStatus, SubscriptionStatusType } from "./domain/entities/SubscriptionStatus";

export type { SubscriptionConfig } from "./domain/value-objects/SubscriptionConfig";

export type { ISubscriptionRepository } from "./application/ports/ISubscriptionRepository";

export {
  SubscriptionService,
  initializeSubscriptionService,
} from "./infrastructure/services/SubscriptionService";

export { useSubscription } from "./presentation/hooks/useSubscription";
export type { UseSubscriptionResult } from "./presentation/hooks/useSubscription";

export {
  useSubscriptionDetails,
  type SubscriptionDetails,
} from "./presentation/hooks/useSubscriptionDetails";

// Feedback
export * from "./presentation/components/feedback/PaywallFeedbackModal";
export * from "./presentation/hooks/feedback/usePaywallFeedback";

export {
  usePremiumGate,
  type UsePremiumGateParams,
  type UsePremiumGateResult,
} from "./presentation/hooks/usePremiumGate";

export {
  useFeatureGate,
  type UseFeatureGateParams,
  type UseFeatureGateResult,
} from "./presentation/hooks/useFeatureGate";

export {
  useUserTierWithRepository,
  type UseUserTierWithRepositoryParams,
  type UseUserTierWithRepositoryResult,
  type AuthProvider,
} from "./presentation/hooks/useUserTierWithRepository";

// =============================================================================
// PAYWALL DOMAIN
// =============================================================================

export {
  PaywallModal,
  type PaywallModalProps,
  PaywallHeader,
  PaywallTabBar,
  PaywallFooter,
  FeatureList,
  FeatureItem,
  PlanCard,
  CreditCard,
  usePaywall,
  useSubscriptionModal,
  type PaywallMode,
  type PaywallTabType,
  type CreditsPackage,
  type SubscriptionFeature,
  type PaywallTranslations,
  type PaywallLegalUrls,
} from "./domains/paywall";

// =============================================================================
// PRESENTATION LAYER - Premium Details Components
// =============================================================================

export {
  PremiumDetailsCard,
  type PremiumDetailsCardProps,
  type PremiumDetailsTranslations,
  type CreditInfo,
} from "./presentation/components/details/PremiumDetailsCard";

export {
  PremiumStatusBadge,
  type PremiumStatusBadgeProps,
} from "./presentation/components/details/PremiumStatusBadge";

// =============================================================================
// PRESENTATION LAYER - Settings Section Component
// =============================================================================

export {
  SubscriptionSection,
  type SubscriptionSectionProps,
  type SubscriptionSectionConfig,
} from "./presentation/components/sections/SubscriptionSection";

// =============================================================================
// PRESENTATION LAYER - Subscription Detail Screen
// =============================================================================

export {
  SubscriptionDetailScreen,
  type SubscriptionDetailScreenProps,
  type SubscriptionDetailConfig,
  type SubscriptionDetailTranslations,
} from "./presentation/screens/SubscriptionDetailScreen";

export { type DevTestActions } from "./presentation/screens/components/DevTestSection";


// =============================================================================
// UTILS - Date & Price
// =============================================================================

export { formatPrice } from "./utils/priceUtils";

// =============================================================================
// UTILS - User Tier
// =============================================================================

export type {
  UserTier,
  UserTierInfo,
  PremiumStatusFetcher,
} from "./utils/types";

export {
  getUserTierInfo,
  checkPremiumAccess,
} from "./utils/tierUtils";

export {
  hasTierAccess,
  isTierPremium,
  isTierFreemium,
  isTierGuest,
} from "./utils/userTierUtils";

export {
  isAuthenticated,
  isGuest,
} from "./utils/authUtils";

export {
  isValidUserTier,
  isUserTierInfo,
  validateUserId,
  validateIsGuest,
  validateIsPremium,
  validateFetcher,
} from "./utils/validation";

// =============================================================================
// CREDITS SYSTEM - Domain Entities
// =============================================================================

export type {
  CreditType,
  UserCredits,
  CreditsConfig,
  CreditsResult,
  DeductCreditsResult,
} from "./domain/entities/Credits";

export { DEFAULT_CREDITS_CONFIG } from "./domain/entities/Credits";

// =============================================================================
// CREDITS SYSTEM - Repository
// =============================================================================

export {
  CreditsRepository,
  createCreditsRepository,
} from "./infrastructure/repositories/CreditsRepository";

// =============================================================================
// CREDITS SYSTEM - Configuration (Module-Level Provider)
// =============================================================================

export {
  configureCreditsRepository,
  getCreditsRepository,
  getCreditsConfig,
  resetCreditsRepository,
} from "./infrastructure/repositories/CreditsRepositoryProvider";

// =============================================================================
// CREDITS SYSTEM - Hooks
// =============================================================================

export {
  useCredits,
  useHasCredits,
  creditsQueryKeys,
  type UseCreditsParams,
  type UseCreditsResult,
} from "./presentation/hooks/useCredits";

export {
  useDeductCredit,
  useInitializeCredits,
  type UseDeductCreditParams,
  type UseDeductCreditResult,
  type UseInitializeCreditsParams,
  type UseInitializeCreditsResult,
  type InitializeCreditsOptions,
} from "./presentation/hooks/useDeductCredit";

export {
  usePremiumWithCredits,
  type UsePremiumWithCreditsParams,
  type UsePremiumWithCreditsResult,
} from "./presentation/hooks/usePremiumWithCredits";

export {
  useCreditChecker,
  type UseCreditCheckerParams,
  type UseCreditCheckerResult,
} from "./presentation/hooks/useCreditChecker";

export {
  usePaywallVisibility,
  type UsePaywallVisibilityResult,
} from "./presentation/hooks/usePaywallVisibility";

export {
  usePremium,
  type UsePremiumResult,
} from "./presentation/hooks/usePremium";

export {
  useAuthSubscriptionSync,
  type AuthSubscriptionSyncConfig,
} from "./presentation/hooks/useAuthSubscriptionSync";

export { useDevTestCallbacks } from "./presentation/hooks/useDevTestCallbacks";

// =============================================================================
// CREDITS SYSTEM - Utilities
// =============================================================================

export {
  createCreditChecker,
  type CreditCheckResult,
  type CreditCheckerConfig,
  type CreditChecker,
} from "./utils/creditChecker";

export {
  createAICreditHelpers,
  type AICreditHelpersConfig,
  type AICreditHelpers,
} from "./utils/aiCreditHelpers";

export {
  detectPackageType,
  type SubscriptionPackageType,
} from "./utils/packageTypeDetector";

export {
  getCreditAllocation,
  getImageCreditsForPackage,
  getTextCreditsForPackage,
  CREDIT_ALLOCATIONS,
  type CreditAllocation,
} from "./utils/creditMapper";

// =============================================================================
// REVENUECAT - Errors
// =============================================================================

export {
  RevenueCatError,
  RevenueCatInitializationError,
  RevenueCatConfigurationError,
  RevenueCatPurchaseError,
  RevenueCatRestoreError,
  RevenueCatNetworkError,
  RevenueCatExpoGoError,
} from "./revenuecat/domain/errors/RevenueCatError";

// =============================================================================
// REVENUECAT - Types & Config
// =============================================================================

export type { RevenueCatConfig } from "./revenuecat/domain/value-objects/RevenueCatConfig";

export type {
  RevenueCatEntitlement,
  RevenueCatPurchaseErrorInfo,
} from "./revenuecat/domain/types/RevenueCatTypes";

export { REVENUECAT_LOG_PREFIX } from "./revenuecat/domain/constants/RevenueCatConstants";

export {
  getPremiumEntitlement,
  isUserCancelledError,
  getErrorMessage,
} from "./revenuecat/domain/types/RevenueCatTypes";

// =============================================================================
// REVENUECAT - Ports
// =============================================================================

export type {
  IRevenueCatService,
  InitializeResult,
  PurchaseResult,
  RestoreResult,
} from "./revenuecat/application/ports/IRevenueCatService";

// =============================================================================
// REVENUECAT - Service
// =============================================================================

export {
  RevenueCatService,
  initializeRevenueCatService,
  getRevenueCatService,
  resetRevenueCatService,
} from "./revenuecat/infrastructure/services/RevenueCatService";

export {
  SubscriptionManager,
  type SubscriptionManagerConfig,
  type PremiumStatus,
} from "./revenuecat/infrastructure/managers/SubscriptionManager";

// =============================================================================
// REVENUECAT - Hooks
// =============================================================================

export { useRevenueCat } from "./revenuecat/presentation/hooks/useRevenueCat";
export type { UseRevenueCatResult } from "./revenuecat/presentation/hooks/useRevenueCat";

export { useCustomerInfo } from "./revenuecat/presentation/hooks/useCustomerInfo";
export type { UseCustomerInfoResult } from "./revenuecat/presentation/hooks/useCustomerInfo";

export {
  useInitializeSubscription,
  useSubscriptionPackages,
  usePurchasePackage,
  useRestorePurchase,
  SUBSCRIPTION_QUERY_KEYS,
} from "./revenuecat/presentation/hooks/useSubscriptionQueries";
