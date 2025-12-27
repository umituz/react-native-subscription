/**
 * Subscription Manager
 * Facade for subscription operations
 * Coordinates UserIdProvider, InitializationCache, and PackageHandler
 */

import type { PurchasesPackage } from "react-native-purchases";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import type { IRevenueCatService } from "../../application/ports/IRevenueCatService";
import { initializeRevenueCatService, getRevenueCatService } from "../services/RevenueCatService";
import { UserIdProvider } from "../utils/UserIdProvider";
import { InitializationCache } from "../utils/InitializationCache";
import { PackageHandler } from "../handlers/PackageHandler";
import type { PremiumStatus, RestoreResultInfo } from "../handlers/PackageHandler";
import {
  trackPackageError,
  addPackageBreadcrumb,
  trackPackageWarning,
} from "@umituz/react-native-sentry";

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

    addPackageBreadcrumb("subscription", "Manager configured", {
      entitlementId: config.config.entitlementIdentifier,
    });
  }

  private ensureConfigured(): void {
    if (!this.managerConfig || !this.packageHandler) {
      const error = new Error("SubscriptionManager not configured");
      trackPackageError(error, {
        packageName: "subscription",
        operation: "ensure_configured",
      });
      throw error;
    }
  }

  private async performInitialization(userId: string): Promise<boolean> {
    this.ensureConfigured();

    try {
      await initializeRevenueCatService(this.managerConfig!.config);
      this.serviceInstance = getRevenueCatService();

      if (!this.serviceInstance) {
        trackPackageWarning("subscription", "Service instance not created", { userId });
        return false;
      }

      this.packageHandler!.setService(this.serviceInstance);

      // Don't pass apiKey - let resolveApiKey decide based on environment (Expo Go = test store key)
      const result = await this.serviceInstance.initialize(userId);
      return result.success;
    } catch (error) {
      trackPackageError(error instanceof Error ? error : new Error(String(error)), {
        packageName: "subscription",
        operation: "initialize",
        userId,
      });
      throw error;
    }
  }

  async initialize(userId?: string): Promise<boolean> {
    this.ensureConfigured();

    const effectiveUserId = userId || (await this.userIdProvider.getOrCreateAnonymousUserId());

    if (!this.initCache.shouldReinitialize(effectiveUserId)) {
      const existingPromise = this.initCache.getExistingPromise();
      if (existingPromise) return existingPromise;
    }

    const promise = this.performInitialization(effectiveUserId);
    this.initCache.setPromise(promise, effectiveUserId);

    return promise;
  }

  isInitialized(): boolean {
    return this.serviceInstance?.isInitialized() ?? false;
  }

  isInitializedForUser(userId: string): boolean {
    return this.serviceInstance?.isInitialized() === true &&
      this.initCache.getCurrentUserId() === userId;
  }

  async getPackages(): Promise<PurchasesPackage[]> {
    this.ensureConfigured();
    if (__DEV__) {
      console.log('[DEBUG SubscriptionManager] getPackages called', {
        hasServiceInstance: !!this.serviceInstance,
        hasPackageHandler: !!this.packageHandler,
      });
    }
    if (!this.serviceInstance) {
      if (__DEV__) {
        console.log('[DEBUG SubscriptionManager] Creating service instance...');
      }
      this.serviceInstance = getRevenueCatService();
      this.packageHandler!.setService(this.serviceInstance);
    }
    const packages = await this.packageHandler!.fetchPackages();
    if (__DEV__) {
      console.log('[DEBUG SubscriptionManager] fetchPackages returned', {
        count: packages.length,
        packages: packages.map(p => ({ id: p.identifier, type: p.packageType })),
      });
    }
    return packages;
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    this.ensureConfigured();
    const userId = this.initCache.getCurrentUserId();
    if (!userId) return false;
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
    return this.packageHandler!.checkPremiumStatus(userId);
  }

  async reset(): Promise<void> {
    if (this.serviceInstance) {
      await this.serviceInstance.reset();
    }
    this.initCache.reset();
    this.userIdProvider.reset();
    this.serviceInstance = null;
    addPackageBreadcrumb("subscription", "Manager reset completed", {});
  }
}

export const SubscriptionManager = new SubscriptionManagerImpl();

// Re-export types
export type { PremiumStatus };
