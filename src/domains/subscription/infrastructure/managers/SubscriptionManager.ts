import type { PurchasesPackage } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import { initializeRevenueCatService, getRevenueCatService } from "../services/RevenueCatService";
import { PackageHandler } from "../handlers/PackageHandler";
import { SubscriptionInternalState } from "./SubscriptionInternalState";
import {
    ensureConfigured,
    getCurrentUserIdOrThrow,
    getOrCreateService,
    ensureServiceAvailable,
} from "./subscriptionManagerUtils";

import type { 
    SubscriptionManagerConfig, 
    PremiumStatus, 
    RestoreResultInfo 
} from "./SubscriptionManager.types";


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

    ensureServiceAvailable(this.serviceInstance);
    ensureConfigured(this.managerConfig);

    this.packageHandler = new PackageHandler(
      this.serviceInstance!,
      this.managerConfig!.config.entitlementIdentifier
    );
  }

  async initialize(userId?: string): Promise<boolean> {
    ensureConfigured(this.managerConfig);

    const actualUserId = userId ?? (await this.managerConfig!.getAnonymousUserId());
    const { shouldInit, existingPromise } = this.state.initCache.tryAcquireInitialization(actualUserId);

    if (!shouldInit && existingPromise) {
      return existingPromise;
    }

    const promise = (async () => {
        await initializeRevenueCatService(this.managerConfig!.config);
        this.serviceInstance = getRevenueCatService();

        ensureServiceAvailable(this.serviceInstance);
        this.ensurePackageHandlerInitialized();

        const result = await this.serviceInstance!.initialize(actualUserId);
        return result.success;
    })();

    this.state.initCache.setPromise(promise, actualUserId);
    return promise;
  }

  isInitializedForUser(userId: string): boolean {
    if (!this.serviceInstance?.isInitialized()) {
      return false;
    }

    return this.state.initCache.getCurrentUserId() === userId;
  }

  async getPackages(): Promise<PurchasesPackage[]> {
    ensureConfigured(this.managerConfig);
    this.serviceInstance = getOrCreateService(this.serviceInstance);
    this.ensurePackageHandlerInitialized();

    return this.packageHandler!.fetchPackages();
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    ensureConfigured(this.managerConfig);
    const userId = getCurrentUserIdOrThrow(this.state);
    this.ensurePackageHandlerInitialized();

    return this.packageHandler!.purchase(pkg, userId);
  }

  async restore(): Promise<RestoreResultInfo> {
    ensureConfigured(this.managerConfig);
    const userId = getCurrentUserIdOrThrow(this.state);
    this.ensurePackageHandlerInitialized();

    return this.packageHandler!.restore(userId);
  }

  async checkPremiumStatus(): Promise<PremiumStatus> {
    ensureConfigured(this.managerConfig);
    getCurrentUserIdOrThrow(this.state);
    ensureServiceAvailable(this.serviceInstance);

    const customerInfo = await this.serviceInstance!.getCustomerInfo();

    if (!customerInfo) {
      throw new Error("Customer info not available");
    }

    this.ensurePackageHandlerInitialized();
    return this.packageHandler!.checkPremiumStatusFromInfo(customerInfo);
  }

  async reset(): Promise<void> {
    await this.serviceInstance?.reset();
    this.state.reset();
    this.serviceInstance = null;
    this.packageHandler = null;
  }

  isConfigured(): boolean {
    return this.managerConfig !== null;
  }

  isInitialized(): boolean {
    return this.serviceInstance?.isInitialized() ?? false;
  }

  getEntitlementId(): string {
    ensureConfigured(this.managerConfig);
    return this.managerConfig!.config.entitlementIdentifier;
  }
}

export const SubscriptionManager = new SubscriptionManagerImpl();

