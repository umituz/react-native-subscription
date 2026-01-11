/**
 * React Native Subscription - Public API
 */

export * from "./domains/wallet";
export * from "./domains/paywall";
export * from "./domains/config";

// Domain Layer
export { createDefaultSubscriptionStatus, isSubscriptionValid } from "./domain/entities/SubscriptionStatus";
export type { SubscriptionStatus, SubscriptionStatusType } from "./domain/entities/SubscriptionStatus";
export type { SubscriptionConfig } from "./domain/value-objects/SubscriptionConfig";
export type { ISubscriptionRepository } from "./application/ports/ISubscriptionRepository";

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
} from "./domain/entities/Credits";
export { DEFAULT_CREDITS_CONFIG } from "./domain/entities/Credits";
export { InsufficientCreditsError } from "./domain/errors/InsufficientCreditsError";

// Utils
export * from "./utils";

// RevenueCat
export * from "./revenuecat";
