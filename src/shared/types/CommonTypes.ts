/**
 * Common Type Definitions
 * Shared types used across multiple domains
 */

import type { Platform as SubscriptionPlatform } from "../../domains/subscription/core/SubscriptionConstants";

/**
 * Purchase result from any purchase operation
 */
export interface PurchaseResult {
  success: boolean;
  productId?: string;
  error?: Error;
}

/**
 * Transaction result for repository operations
 */
export interface TransactionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Subscription status information
 */
export interface SubscriptionStatusInfo {
  isActive: boolean;
  isExpired: boolean;
  isTrial: boolean;
  willRenew: boolean;
  expirationDate?: Date;
  productId?: string;
}

/**
 * Credits information
 */
export interface CreditsInfo {
  credits: number;
  creditLimit: number;
  isPremium: boolean;
  status: string;
}

/**
 * Transaction metadata for any transaction type
 */
export interface TransactionMetadata {
  productId: string;
  amount: number;
  currency?: string;
  timestamp: Date;
  type: 'purchase' | 'renewal' | 'restore' | 'credit_purchase';
}

/**
 * Platform information
 */
export type Platform = SubscriptionPlatform;

/**
 * Purchase source tracking
 */
export type PurchaseSource = 'settings' | 'paywall' | 'upgrade_prompt' | 'auto-execution' | 'manual';

// Re-export from SubscriptionConstants to maintain compatibility
export { PLATFORM, PURCHASE_SOURCE, type Platform as SubscriptionPlatformType, type PurchaseSource as PurchaseSourceType } from "../../domains/subscription/core/SubscriptionConstants";
