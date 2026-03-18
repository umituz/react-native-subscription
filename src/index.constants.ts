/**
 * CORE Exports - Constants & Types
 */

// Constants & Types
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

// Domain Events
export { SUBSCRIPTION_EVENTS } from "./domains/subscription/core/events/SubscriptionEvents";
export type { SubscriptionEventType, SyncStatusChangedEvent } from "./domains/subscription/core/events/SubscriptionEvents";
export type { PurchaseCompletedEvent, RenewalDetectedEvent, PremiumStatusChangedEvent } from "./domains/subscription/core/SubscriptionEvents";
export { FLOW_EVENTS } from "./domains/subscription/core/events/FlowEvents";
export type { FlowEventType, OnboardingCompletedEvent, PaywallShownEvent, PaywallClosedEvent } from "./domains/subscription/core/events/FlowEvents";

export type { SubscriptionMetadata } from "./domains/subscription/core/types/SubscriptionMetadata";
export type { PremiumStatus as PremiumStatusMetadata } from "./domains/subscription/core/types/PremiumStatus";
export type { CreditInfo } from "./domains/subscription/core/types/CreditInfo";

// Credits Types
export type {
  CreditType,
  UserCredits,
  CreditsConfig,
  CreditsResult,
  DeductCreditsResult,
} from "./domains/credits/core/Credits";

// Paywall Types
export type { PaywallTranslations, PaywallLegalUrls, SubscriptionFeature } from "./domains/paywall/entities/types";

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
