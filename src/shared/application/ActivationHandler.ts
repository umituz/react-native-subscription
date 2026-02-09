import { timezoneService } from "@umituz/react-native-design-system";
import type { ISubscriptionRepository } from "../application/ports/ISubscriptionRepository";
import type { SubscriptionStatus } from "../../domains/subscription/core/SubscriptionStatus";
import { SubscriptionRepositoryError } from "../utils/SubscriptionError";

export interface ActivationHandlerConfig {
  repository: ISubscriptionRepository;
  onStatusChanged?: (
    userId: string,
    status: SubscriptionStatus
  ) => Promise<void> | void;
  onError?: (error: Error, operation: string) => Promise<void> | void;
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
        purchasedAt: timezoneService.getCurrentISOString(),
        syncedAt: timezoneService.getCurrentISOString(),
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

/**
 * Safe error handler - wraps error callbacks to prevent secondary failures
 */
export async function safeHandleError(
  onError: ((error: Error, operation: string) => Promise<void> | void) | undefined,
  error: unknown,
  operation: string
): Promise<void> {
  if (!onError) return;

  try {
    const err = error instanceof Error ? error : new Error("Unknown error");
    await onError(err, operation);
  } catch {
    // Ignore callback errors
  }
}

async function handleError(
  config: ActivationHandlerConfig,
  error: unknown,
  operation: string
): Promise<void> {
  await safeHandleError(config.onError, error, `ActivationHandler.${operation}`);
}
