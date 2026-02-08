/**
 * Subscription Manager
 * Facade for subscription operations. Coordinates state and operations.
 */

import type { PurchasesPackage } from "react-native-purchases";
import type { RevenueCatConfig } from "../../core/RevenueCatConfig";
import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { initializeRevenueCatService, getRevenueCatService } from "../services/RevenueCatService";
import { PackageHandler } from "../handlers/PackageHandler";
import type { PremiumStatus, RestoreResultInfo } from "../handlers/PackageHandler";
import { SubscriptionInternalState } from "./SubscriptionInternalState";

export interface SubscriptionManagerConfig {
  config: RevenueCatConfig;
  apiKey: string;
  getAnonymousUserId: () => Promise<string>;
}

class SubscriptionManagerImpl {
  private managerConfig: SubscriptionManagerConfig | null = null;
  private serviceInstance: IRevenueCatService | null = null;
  private state = new SubscriptionInternalState();
  private packageHandler: PackageHandler | null = null;

  configure(config: SubscriptionManagerConfig): void {
    this.managerConfig = config;
    this.state.userIdProvider.configure(config.getAnonymousUserId);
  }

  private ensurePackageHandlerInitialized(): void {
    if (this.packageHandler) {
      return;
    }

    if (!this.serviceInstance) {
      throw new Error("Service instance not available");
    }

    if (!this.managerConfig) {
      throw new Error("Manager not configured");
    }

    this.packageHandler = new PackageHandler(
      this.serviceInstance,
      this.managerConfig.config.entitlementIdentifier
    );
  }

  private ensureConfigured(): void {
    if (!this.managerConfig) {
      throw new Error("SubscriptionManager not configured");
    }
  }

  async initialize(userId?: string): Promise<boolean> {
    this.ensureConfigured();

    const actualUserId = userId ?? (await this.managerConfig!.getAnonymousUserId());
    const { shouldInit, existingPromise } = this.state.initCache.tryAcquireInitialization(actualUserId);

    if (!shouldInit && existingPromise) {
      return existingPromise;
    }

    const promise = (async () => {
        await initializeRevenueCatService(this.managerConfig!.config);
        this.serviceInstance = getRevenueCatService();

        if (!this.serviceInstance) {
          throw new Error("Service instance not available after initialization");
        }

        this.ensurePackageHandlerInitialized();
        const result = await this.serviceInstance.initialize(actualUserId);
        return result.success;
    })();

    this.state.initCache.setPromise(promise, actualUserId);
    return promise;
  }

  isInitializedForUser(userId: string): boolean {
    if (!this.serviceInstance) {
      return false;
    }

    if (!this.serviceInstance.isInitialized()) {
      return false;
    }

    return this.state.initCache.getCurrentUserId() === userId;
  }

  async getPackages(): Promise<PurchasesPackage[]> {
    this.ensureConfigured();

    if (!this.serviceInstance) {
      this.serviceInstance = getRevenueCatService();
    }

    if (!this.serviceInstance) {
      throw new Error("Service instance not available");
    }

    this.ensurePackageHandlerInitialized();
    return this.packageHandler!.fetchPackages();
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    this.ensureConfigured();

    const userId = this.state.initCache.getCurrentUserId();
    if (!userId) {
      throw new Error("No current user found");
    }

    this.ensurePackageHandlerInitialized();
    return this.packageHandler!.purchase(pkg, userId);
  }

  async restore(): Promise<RestoreResultInfo> {
    this.ensureConfigured();

    const userId = this.state.initCache.getCurrentUserId();
    if (!userId) {
      throw new Error("No current user found");
    }

    this.ensurePackageHandlerInitialized();
    return this.packageHandler!.restore(userId);
  }

  async checkPremiumStatus(): Promise<PremiumStatus> {
    this.ensureConfigured();

    const userId = this.state.initCache.getCurrentUserId();
    if (!userId) {
      throw new Error("No current user found");
    }

    if (!this.serviceInstance) {
      throw new Error("Service instance not available");
    }

    const customerInfo = await this.serviceInstance.getCustomerInfo();

    if (!customerInfo) {
      throw new Error("Customer info not available");
    }

    this.ensurePackageHandlerInitialized();
    return this.packageHandler!.checkPremiumStatusFromInfo(customerInfo);
  }

  async reset(): Promise<void> {
    if (this.serviceInstance) {
      await this.serviceInstance.reset();
    }

    this.state.reset();
    this.serviceInstance = null;
  }

  isConfigured(): boolean {
    return this.managerConfig !== null;
  }

  isInitialized(): boolean {
    if (!this.serviceInstance) {
      return false;
    }

    return this.serviceInstance.isInitialized();
  }

  getEntitlementId(): string {
    if (!this.managerConfig) {
      throw new Error("SubscriptionManager not configured");
    }

    return this.managerConfig.config.entitlementIdentifier;
  }
}

export const SubscriptionManager = new SubscriptionManagerImpl();
export type { PremiumStatus };
