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
import { initializationState } from "../state/initializationState";

class SubscriptionManagerImpl {
  private managerConfig: SubscriptionManagerConfig | null = null;
  private serviceInstance: IRevenueCatService | null = null;
  private state = new SubscriptionInternalState();
  private packageHandler: PackageHandler | null = null;

  configure(config: SubscriptionManagerConfig): void {
    this.managerConfig = config;
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

    const actualUserId: string = (userId && userId.length > 0) ? userId : '';

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[SubscriptionManager] initialize called:', {
        providedUserId: userId,
        actualUserId: actualUserId || '(empty - RevenueCat will generate anonymous ID)',
      });
    }

    const cacheKey = actualUserId || '__anonymous__';
    const { shouldInit, existingPromise } = this.state.initCache.tryAcquireInitialization(cacheKey);

    if (!shouldInit && existingPromise) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[SubscriptionManager] Using cached initialization for:', cacheKey);
      }
      return existingPromise;
    }

    // Mark pending so React components know to wait
    initializationState.markPending();

    const promise = this.performInitialization(actualUserId);
    this.state.initCache.setPromise(promise, cacheKey);
    return promise;
  }

  private async performInitialization(userId: string): Promise<boolean> {
    this.ensureConfigured();

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[SubscriptionManager] performInitialization:', {
        userId: userId || '(empty - anonymous)',
      });
    }

    const { service, success } = await performServiceInitialization(this.managerConfig!.config, userId);
    this.serviceInstance = service ?? null;
    this.ensurePackageHandlerInitialized();

    if (success) {
      // Notify reactive state so React components re-render and enable their queries
      const notifyUserId = (userId && userId.length > 0) ? userId : null;
      initializationState.markInitialized(notifyUserId);
    }

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[SubscriptionManager] Initialization completed:', { success });
    }

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
    const result = await purchasePackageOperation(pkg, this.managerConfig, this.state, this.packageHandler!);
    return result;
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
    initializationState.reset();
  }

  isConfigured = (): boolean => this.managerConfig !== null;

  isInitialized = (): boolean => this.serviceInstance?.isInitialized() ?? false;

  getEntitlementId(): string {
    this.ensureConfigured();
    return this.managerConfig!.config.entitlementIdentifier ?? '';
  }
}

export const SubscriptionManager = new SubscriptionManagerImpl();

