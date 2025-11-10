/**
 * Subscription Configuration Value Object
 * Configuration for subscription service
 */

import type { SubscriptionStatus } from '../entities/SubscriptionStatus';
import type { ISubscriptionRepository } from '../../application/ports/ISubscriptionRepository';

export interface SubscriptionConfig {
  /** Repository implementation for database operations */
  repository: ISubscriptionRepository;

  /** Optional callback when subscription status changes */
  onStatusChanged?: (
    userId: string,
    status: SubscriptionStatus,
  ) => Promise<void> | void;

  /** Optional callback for error logging */
  onError?: (error: Error, context: string) => Promise<void> | void;
}

