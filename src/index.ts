/**
 * React Native Subscription - Public API
 *
 * Domain-Driven Design (DDD) Architecture
 *
 * This is the SINGLE SOURCE OF TRUTH for all subscription operations.
 * ALL imports from the Subscription package MUST go through this file.
 *
 * Architecture:
 * - domain: Entities, value objects, errors (business logic)
 * - application: Ports (interfaces)
 * - infrastructure: Subscription service implementation
 * - presentation: Hooks (React integration)
 *
 * Usage:
 *   import { initializeSubscriptionService, useSubscription } from '@umituz/react-native-subscription';
 */

// =============================================================================
// DOMAIN LAYER - Business Logic
// =============================================================================

export {
  SubscriptionError,
  SubscriptionRepositoryError,
  SubscriptionValidationError,
  SubscriptionConfigurationError,
} from './domain/errors/SubscriptionError';

export {
  createDefaultSubscriptionStatus,
  isSubscriptionValid,
} from './domain/entities/SubscriptionStatus';
export type { SubscriptionStatus } from './domain/entities/SubscriptionStatus';

export type { SubscriptionConfig } from './domain/value-objects/SubscriptionConfig';

// =============================================================================
// APPLICATION LAYER - Ports
// =============================================================================

export type { ISubscriptionRepository } from './application/ports/ISubscriptionRepository';
export type { ISubscriptionService } from './application/ports/ISubscriptionService';

// =============================================================================
// INFRASTRUCTURE LAYER - Implementation
// =============================================================================

export {
  SubscriptionService,
  initializeSubscriptionService,
  getSubscriptionService,
  resetSubscriptionService,
} from './infrastructure/services/SubscriptionService';

// =============================================================================
// PRESENTATION LAYER - Hooks
// =============================================================================

export { useSubscription } from './presentation/hooks/useSubscription';
export type { UseSubscriptionResult } from './presentation/hooks/useSubscription';

// =============================================================================
// UTILS
// =============================================================================

// Date utilities
export {
  isSubscriptionExpired,
  getDaysUntilExpiration,
  formatExpirationDate,
  calculateExpirationDate,
} from './utils/dateUtils';

// Price utilities
export { formatPrice } from './utils/priceUtils';

// Period utilities
export { getPeriodText } from './utils/periodUtils';

export {
  SUBSCRIPTION_PLAN_TYPES,
  MIN_SUBSCRIPTION_DURATIONS_DAYS,
  SUBSCRIPTION_PERIOD_DAYS,
  DATE_CONSTANTS,
  SUBSCRIPTION_PERIOD_UNITS,
  PRODUCT_ID_KEYWORDS,
  type SubscriptionPlanType,
} from './utils/subscriptionConstants';

