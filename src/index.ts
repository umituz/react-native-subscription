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
// BROKEN EXPORTS - Files missing
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
// PRESENTATION LAYER - Paywall Components
// =============================================================================

export {
  SubscriptionModal,
  type SubscriptionModalProps,
} from "./presentation/components/paywall/SubscriptionModal";

export { SubscriptionModalHeader } from "./presentation/components/paywall/SubscriptionModalHeader";

export { SubscriptionPlanCard } from "./presentation/components/paywall/SubscriptionPlanCard";
export { PaywallFeaturesList } from "./presentation/components/paywall/PaywallFeaturesList";
export { PaywallFeatureItem } from "./presentation/components/paywall/PaywallFeatureItem";
export { PaywallLegalFooter } from "./presentation/components/paywall/PaywallLegalFooter";
export {
  PaywallModal,
  type PaywallModalProps,
} from "./presentation/components/paywall/PaywallModal";

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


// =============================================================================
// UTILS - Date & Price
// =============================================================================

/*
export {
  isSubscriptionExpired,
  getDaysUntilExpiration,
} from "./utils/dateValidationUtils";
*/

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
// CREDITS SYSTEM - Context & Provider
// =============================================================================

export {
  CreditsContext,
  useCreditsContext,
  useCreditsConfig,
  useCreditsRepository,
  type CreditsContextValue,
} from "./presentation/context/CreditsContext";

export {
  CreditsProvider,
  type CreditsProviderProps,
} from "./presentation/providers/CreditsProvider";

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

// =============================================================================
// CREDITS SYSTEM - Utilities
// =============================================================================

export {
  createCreditChecker,
  type CreditCheckResult,
  type CreditCheckerConfig,
  type CreditChecker,
} from "./utils/creditChecker";

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

export {
  useInitializeSubscription,
  useSubscriptionPackages,
  usePurchasePackage,
  useRestorePurchase,
  SUBSCRIPTION_QUERY_KEYS,
} from "./revenuecat/presentation/hooks/useSubscriptionQueries";
