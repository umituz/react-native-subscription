/**
 * Base subscription metadata — the single source of truth for subscription state fields.
 *
 * All subscription-related types (RevenueCatData, PremiumStatusChangedEvent,
 * InitializeCreditsMetadata) extend or compose from this base to eliminate
 * field duplication and ensure consistent naming.
 */
export interface SubscriptionMetadata {
  isPremium: boolean;
  willRenew: boolean;
  expirationDate: string | null;
  productId: string;
  periodType: string | null;
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
  store: string | null;
  ownershipType: string | null;
}
