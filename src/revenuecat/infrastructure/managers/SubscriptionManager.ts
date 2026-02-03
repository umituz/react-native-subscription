/**
 * Subscription Manager
 * Facade for subscription operations
 * Coordinates UserIdProvider, InitializationCache, and PackageHandler
 */

declare const __DEV__: boolean;

import type { PurchasesPackage } from "react-native-purchases";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import type { IRevenueCatService } from "../../application/ports/IRevenueCatService";
import { initializeRevenueCatService, getRevenueCatService } from "../services/RevenueCatService";
import { UserIdProvider } from "../utils/UserIdProvider";
import { InitializationCache } from "../utils/InitializationCache";
import { PackageHandler } from "../handlers/PackageHandler";
import type { PremiumStatus, RestoreResultInfo } from "../handlers/PackageHandler";

export interface SubscriptionManagerConfig {
  config: RevenueCatConfig;
  apiKey: string;
  getAnonymousUserId?: () => Promise<string>;
}

class SubscriptionManagerImpl {
  private managerConfig: SubscriptionManagerConfig | null = null;
  private serviceInstance: IRevenueCatService | null = null;
  private userIdProvider = new UserIdProvider();
  private initCache = new InitializationCache();
  private packageHandler: PackageHandler | null = null;

  configure(config: SubscriptionManagerConfig): void {
    this.managerConfig = config;
    this.packageHandler = new PackageHandler(null, config.config.entitlementIdentifier);

    if (config.getAnonymousUserId) {
      this.userIdProvider.configure(config.getAnonymousUserId);
    }
  }

  private ensureConfigured(): void {
    if (!this.managerConfig || !this.packageHandler) {
      throw new Error("SubscriptionManager not configured");
    }
  }

  private async performInitialization(userId: string): Promise<boolean> {
    this.ensureConfigured();

    await initializeRevenueCatService(this.managerConfig!.config);
    this.serviceInstance = getRevenueCatService();

    if (!this.serviceInstance) {
      return false;
    }

    this.packageHandler!.setService(this.serviceInstance);

    const result = await this.serviceInstance.initialize(userId);
    return result.success;
  }

  async initialize(userId?: string): Promise<boolean> {
    this.ensureConfigured();

    const effectiveUserId = userId || (await this.userIdProvider.getOrCreateAnonymousUserId());

    // Atomic check-and-acquire to prevent race conditions
    const { shouldInit, existingPromise } = this.initCache.tryAcquireInitialization(effectiveUserId);

    if (!shouldInit && existingPromise) {
      return existingPromise;
    }

    const promise = this.performInitialization(effectiveUserId);
    this.initCache.setPromise(promise, effectiveUserId);

    return promise;
  }

  isConfigured(): boolean {
    return this.managerConfig !== null && this.packageHandler !== null;
  }

  isInitialized(): boolean {
    return this.serviceInstance?.isInitialized() ?? false;
  }

  isInitializedForUser(userId: string): boolean {
    return this.serviceInstance?.isInitialized() === true &&
      this.initCache.getCurrentUserId() === userId;
  }

  getEntitlementId(): string | null {
    return this.managerConfig?.config.entitlementIdentifier || null;
  }

  async getPackages(): Promise<PurchasesPackage[]> {
    if (__DEV__) {
      console.log('[DEBUG SubscriptionManager] getPackages called', {
        isConfigured: this.isConfigured(),
        isInitialized: this.isInitialized(),
        hasServiceInstance: !!this.serviceInstance,
      });
    }
    this.ensureConfigured();
    if (!this.serviceInstance) {
      this.serviceInstance = getRevenueCatService();
      this.packageHandler!.setService(this.serviceInstance);
    }
    return this.packageHandler!.fetchPackages();
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    if (__DEV__) {
      console.log('[DEBUG SubscriptionManager] purchasePackage called', {
        productId: pkg.product.identifier,
        isConfigured: this.isConfigured(),
        isInitialized: this.isInitialized(),
      });
    }
    this.ensureConfigured();
    const userId = this.initCache.getCurrentUserId();
    if (__DEV__) {
      console.log('[DEBUG SubscriptionManager] userId from cache:', userId);
    }
    if (!userId) {
      if (__DEV__) {
        console.log('[DEBUG SubscriptionManager] No userId, returning false');
      }
      return false;
    }
    return this.packageHandler!.purchase(pkg, userId);
  }

  async restore(): Promise<RestoreResultInfo> {
    this.ensureConfigured();
    const userId = this.initCache.getCurrentUserId();
    if (!userId) return { success: false, productId: null };
    return this.packageHandler!.restore(userId);
  }

  async checkPremiumStatus(): Promise<PremiumStatus> {
    this.ensureConfigured();
    const userId = this.initCache.getCurrentUserId();
    if (!userId) return { isPremium: false, expirationDate: null };

    const customerInfo = await this.serviceInstance?.getCustomerInfo();
    if (customerInfo) {
      return this.packageHandler!.checkPremiumStatusFromInfo(customerInfo);
    }

    return { isPremium: false, expirationDate: null };
  }

  async reset(): Promise<void> {
    if (this.serviceInstance) {
      await this.serviceInstance.reset();
    }
    this.initCache.reset();
    this.userIdProvider.reset();
    this.serviceInstance = null;
  }
}

export const SubscriptionManager = new SubscriptionManagerImpl();

export type { PremiumStatus };
