/**
 * Activation Handler
 * Handles subscription activation and deactivation
 */

import type { ISubscriptionRepository } from "../../application/ports/ISubscriptionRepository";
import type { SubscriptionStatus } from "../../domain/entities/SubscriptionStatus";
import { SubscriptionRepositoryError } from "../../domain/errors/SubscriptionError";

export interface ActivationHandlerConfig {
  repository: ISubscriptionRepository;
  onStatusChanged?: (
    userId: string,
    status: SubscriptionStatus
  ) => Promise<void> | void;
  onError?: (error: Error, context: string) => Promise<void> | void;
}

/**
 * Activate subscription for user
 */
export async function activateSubscription(
  config: ActivationHandlerConfig,
  userId: string,
  productId: string,
  expiresAt: string | null
): Promise<SubscriptionStatus> {
  try {
    const updatedStatus = await config.repository.updateSubscriptionStatus(
      userId,
      {
        isPremium: true,
        productId,
        expiresAt,
        purchasedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
      }
    );

    await notifyStatusChange(config, userId, updatedStatus);
    return updatedStatus;
  } catch (error) {
    await handleError(config, error, "activateSubscription");
    throw new SubscriptionRepositoryError("Failed to activate subscription");
  }
}

/**
 * Deactivate subscription for user
 */
export async function deactivateSubscription(
  config: ActivationHandlerConfig,
  userId: string
): Promise<SubscriptionStatus> {
  try {
    const updatedStatus = await config.repository.updateSubscriptionStatus(
      userId,
      {
        isPremium: false,
        expiresAt: null,
        productId: null,
      }
    );

    await notifyStatusChange(config, userId, updatedStatus);
    return updatedStatus;
  } catch (error) {
    await handleError(config, error, "deactivateSubscription");
    throw new SubscriptionRepositoryError("Failed to deactivate subscription");
  }
}

async function notifyStatusChange(
  config: ActivationHandlerConfig,
  userId: string,
  status: SubscriptionStatus
): Promise<void> {
  if (!config.onStatusChanged) return;

  try {
    await config.onStatusChanged(userId, status);
  } catch (error) {
    await handleError(config, error, "onStatusChanged");
  }
}

async function handleError(
  config: ActivationHandlerConfig,
  error: unknown,
  context: string
): Promise<void> {
  if (!config.onError) return;

  try {
    const err = error instanceof Error ? error : new Error("Unknown error");
    await config.onError(err, `ActivationHandler.${context}`);
  } catch {
    // Ignore callback errors
  }
}
