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
  getAnonymousUserId?: () => Promise<string>;
}

class SubscriptionManagerImpl {
  private managerConfig: SubscriptionManagerConfig | null = null;
  private serviceInstance: IRevenueCatService | null = null;
  private state = new SubscriptionInternalState();
  private packageHandler: PackageHandler | null = null;

  configure(config: SubscriptionManagerConfig): void {
    this.managerConfig = config;
    this.packageHandler = new PackageHandler(null, config.config.entitlementIdentifier);
    if (config.getAnonymousUserId) this.state.userIdProvider.configure(config.getAnonymousUserId);
  }

  private ensureConfigured(): void {
    if (!this.managerConfig || !this.packageHandler) throw new Error("SubscriptionManager not configured");
  }

  async initialize(userId?: string): Promise<boolean> {
    this.ensureConfigured();
    const effectiveUserId = userId || (await this.state.userIdProvider.getOrCreateAnonymousUserId());
    const { shouldInit, existingPromise } = this.state.initCache.tryAcquireInitialization(effectiveUserId);

    if (!shouldInit && existingPromise) return existingPromise;

    const promise = (async () => {
        await initializeRevenueCatService(this.managerConfig!.config);
        this.serviceInstance = getRevenueCatService();
        if (!this.serviceInstance) return false;
        this.packageHandler!.setService(this.serviceInstance);
        const result = await this.serviceInstance.initialize(effectiveUserId);
        return result.success;
    })();

    this.state.initCache.setPromise(promise, effectiveUserId);
    return promise;
  }

  isInitializedForUser(userId: string): boolean {
    return this.serviceInstance?.isInitialized() === true && this.state.initCache.getCurrentUserId() === userId;
  }

  async getPackages(): Promise<PurchasesPackage[]> {
    this.ensureConfigured();
    if (!this.serviceInstance) {
      this.serviceInstance = getRevenueCatService();
      this.packageHandler!.setService(this.serviceInstance);
    }
    return this.packageHandler!.fetchPackages();
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    this.ensureConfigured();
    const userId = this.state.initCache.getCurrentUserId();
    if (!userId) return false;
    return this.packageHandler!.purchase(pkg, userId);
  }

  async restore(): Promise<RestoreResultInfo> {
    this.ensureConfigured();
    const userId = this.state.initCache.getCurrentUserId();
    if (!userId) return { success: false, productId: null };
    return this.packageHandler!.restore(userId);
  }

  async checkPremiumStatus(): Promise<PremiumStatus> {
    this.ensureConfigured();
    const userId = this.state.initCache.getCurrentUserId();
    if (!userId) return { isPremium: false, expirationDate: null };

    try {
      const customerInfo = await this.serviceInstance?.getCustomerInfo();
      if (customerInfo) return this.packageHandler!.checkPremiumStatusFromInfo(customerInfo);
    } catch (error) {
      throw error;
    }
    return { isPremium: false, expirationDate: null };
  }

  async reset(): Promise<void> {
    if (this.serviceInstance) await this.serviceInstance.reset();
    this.state.reset();
    this.serviceInstance = null;
  }

  // Helper status checks
  isConfigured = () => !!this.managerConfig;
  isInitialized = () => this.serviceInstance?.isInitialized() ?? false;
  getEntitlementId = () => this.managerConfig?.config.entitlementIdentifier || null;
}

export const SubscriptionManager = new SubscriptionManagerImpl();
export type { PremiumStatus };
