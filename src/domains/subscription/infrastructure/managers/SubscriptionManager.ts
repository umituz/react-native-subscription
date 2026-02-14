import type { PurchasesPackage } from "react-native-purchases";
import type { IRevenueCatService } from "../../../../shared/application/ports/IRevenueCatService";
import type { PackageHandler } from "../handlers/PackageHandler";
import { SubscriptionInternalState } from "./SubscriptionInternalState";
import { ensureServiceAvailable } from "./subscriptionManagerUtils";
import type { SubscriptionManagerConfig, PremiumStatus, RestoreResultInfo } from "./SubscriptionManager.types";
import { createPackageHandler } from "./packageHandlerFactory";
import { checkPremiumStatusFromService } from "./premiumStatusChecker";
import { getPackagesOperation, purchasePackageOperation, restoreOperation } from "./managerOperations";
import { performServiceInitialization } from "./initializationHandler";

class SubscriptionManagerImpl {
  private managerConfig: SubscriptionManagerConfig | null = null;
  private serviceInstance: IRevenueCatService | null = null;
  private state = new SubscriptionInternalState();
  private packageHandler: PackageHandler | null = null;

  configure(config: SubscriptionManagerConfig): void {
    this.managerConfig = config;
    this.state.userIdProvider.configure(config.getAnonymousUserId);
  }

  private ensureConfigured(): void {
    if (!this.managerConfig) {
      throw new Error('[SubscriptionManager] Not configured. Call configure() first.');
    }
  }

  private ensurePackageHandlerInitialized(): void {
    if (this.packageHandler) return;
    this.packageHandler = createPackageHandler(this.serviceInstance, this.managerConfig);
  }

  async initialize(userId?: string): Promise<boolean> {
    this.ensureConfigured();

    let actualUserId: string | null = null;

    if (userId && userId.length > 0) {
      actualUserId = userId;
    } else {
      const anonymousId = await this.managerConfig.getAnonymousUserId();
      actualUserId = (anonymousId && anonymousId.length > 0) ? anonymousId : null;
    }

    const cacheKey = actualUserId ?? '__anonymous__';
    const { shouldInit, existingPromise } = this.state.initCache.tryAcquireInitialization(cacheKey);

    if (!shouldInit && existingPromise) {
      return existingPromise;
    }

    const promise = this.performInitialization(actualUserId);
    this.state.initCache.setPromise(promise, cacheKey);
    return promise;
  }

  private async performInitialization(userId: string | null): Promise<boolean> {
    this.ensureConfigured();
    const { service, success } = await performServiceInitialization(this.managerConfig.config, userId ?? '');
    this.serviceInstance = service ?? null;
    this.ensurePackageHandlerInitialized();
    return success;
  }

  isInitializedForUser = (userId: string): boolean =>
    !!(this.serviceInstance?.isInitialized() && this.state.initCache.getCurrentUserId() === userId);

  async getPackages(): Promise<PurchasesPackage[]> {
    this.ensureConfigured();
    this.ensurePackageHandlerInitialized();
    return getPackagesOperation(this.managerConfig, this.serviceInstance, this.packageHandler!);
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    this.ensureConfigured();
    this.ensurePackageHandlerInitialized();
    return purchasePackageOperation(pkg, this.managerConfig, this.state, this.packageHandler!);
  }

  async restore(): Promise<RestoreResultInfo> {
    this.ensureConfigured();
    this.ensurePackageHandlerInitialized();
    return restoreOperation(this.managerConfig, this.state, this.packageHandler!);
  }

  async checkPremiumStatus(): Promise<PremiumStatus> {
    this.ensureConfigured();
    ensureServiceAvailable(this.serviceInstance);
    this.ensurePackageHandlerInitialized();
    return checkPremiumStatusFromService(this.serviceInstance!, this.packageHandler!);
  }

  async reset(): Promise<void> {
    await this.serviceInstance?.reset();
    this.state.reset();
    this.serviceInstance = null;
    this.packageHandler = null;
  }

  isConfigured = (): boolean => this.managerConfig !== null;

  isInitialized = (): boolean => this.serviceInstance?.isInitialized() ?? false;

  getEntitlementId(): string {
    this.ensureConfigured();
    return this.managerConfig.config.entitlementIdentifier ?? '';
  }
}

export const SubscriptionManager = new SubscriptionManagerImpl();

