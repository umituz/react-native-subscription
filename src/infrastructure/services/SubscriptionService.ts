/**
 * Subscription Service Implementation
 * Database-first subscription management
 */

import type { ISubscriptionService } from "@application/ports/ISubscriptionService";
import type { ISubscriptionRepository } from "@application/ports/ISubscriptionRepository";
import type { SubscriptionStatus } from "@domain/entities/SubscriptionStatus";
import { createDefaultSubscriptionStatus } from "@domain/entities/SubscriptionStatus";
import {
  SubscriptionRepositoryError,
  SubscriptionValidationError,
} from "@domain/errors/SubscriptionError";
import type { SubscriptionConfig } from "@domain/value-objects/SubscriptionConfig";
import {
  activateSubscription,
  deactivateSubscription,
  type ActivationHandlerConfig,
} from "./ActivationHandler";

export class SubscriptionService implements ISubscriptionService {
  private repository: ISubscriptionRepository;
  private handlerConfig: ActivationHandlerConfig;

  constructor(config: SubscriptionConfig) {
    if (!config.repository) {
      throw new SubscriptionValidationError("Repository is required");
    }

    this.repository = config.repository;
    this.handlerConfig = {
      repository: config.repository,
      onStatusChanged: config.onStatusChanged,
      onError: config.onError,
    };
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const status = await this.repository.getSubscriptionStatus(userId);
      if (!status) {
        return createDefaultSubscriptionStatus();
      }

      const isValid = this.repository.isSubscriptionValid(status);
      if (!isValid && status.isPremium) {
        return await this.deactivateSubscription(userId);
      }

      return status;
    } catch (error) {
      await this.handleError(error, "getSubscriptionStatus");
      return createDefaultSubscriptionStatus();
    }
  }

  // Alias for ISubscriptionService interface compliance
  async getStatus(userId: string): Promise<SubscriptionStatus | null> {
    const status = await this.getSubscriptionStatus(userId);
    return status.isPremium ? status : null;
  }

  async isPremium(userId: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userId);
    return this.repository.isSubscriptionValid(status);
  }

  async activateSubscription(
    userId: string,
    productId: string,
    expiresAt: string | null
  ): Promise<SubscriptionStatus> {
    return activateSubscription(
      this.handlerConfig,
      userId,
      productId,
      expiresAt
    );
  }

  async deactivateSubscription(userId: string): Promise<SubscriptionStatus> {
    return deactivateSubscription(this.handlerConfig, userId);
  }

  async updateSubscriptionStatus(
    userId: string,
    updates: Partial<SubscriptionStatus>
  ): Promise<SubscriptionStatus> {
    try {
      const updatesWithSync = {
        ...updates,
        syncedAt: new Date().toISOString(),
      };

      const updatedStatus = await this.repository.updateSubscriptionStatus(
        userId,
        updatesWithSync
      );

      if (this.handlerConfig.onStatusChanged) {
        try {
          await this.handlerConfig.onStatusChanged(userId, updatedStatus);
        } catch (error) {
          await this.handleError(error, "updateSubscriptionStatus.callback");
        }
      }

      return updatedStatus;
    } catch (error) {
      await this.handleError(error, "updateSubscriptionStatus");
      throw new SubscriptionRepositoryError("Failed to update subscription");
    }
  }

  private async handleError(error: unknown, context: string): Promise<void> {
    if (!this.handlerConfig.onError) return;

    try {
      const err = error instanceof Error ? error : new Error("Unknown error");
      await this.handlerConfig.onError(err, `SubscriptionService.${context}`);
    } catch {
      // Ignore callback errors
    }
  }
}

let subscriptionServiceInstance: SubscriptionService | null = null;

export function initializeSubscriptionService(
  config: SubscriptionConfig
): SubscriptionService {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = new SubscriptionService(config);
  }
  return subscriptionServiceInstance;
}

export function getSubscriptionService(): SubscriptionService | null {
  return subscriptionServiceInstance;
}

export function resetSubscriptionService(): void {
  subscriptionServiceInstance = null;
}
