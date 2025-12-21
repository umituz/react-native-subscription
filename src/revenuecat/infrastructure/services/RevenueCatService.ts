/**
 * RevenueCat Service Implementation
 * Main service class for RevenueCat operations
 */

import Purchases from "react-native-purchases";
import type { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import type {
  IRevenueCatService,
  InitializeResult,
  PurchaseResult,
  RestoreResult,
} from "../../application/ports/IRevenueCatService";
import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { resolveApiKey } from "../utils/ApiKeyResolver";
import { initializeSDK } from "./RevenueCatInitializer";
import { fetchOfferings } from "./OfferingsFetcher";
import { handlePurchase } from "./PurchaseHandler";
import { handleRestore } from "./RestoreHandler";
import { CustomerInfoListenerManager } from "./CustomerInfoListenerManager";
import { ServiceStateManager } from "./ServiceStateManager";
import {
  trackPackageError,
  addPackageBreadcrumb,
  trackPackageWarning,
} from "@umituz/react-native-sentry";

export class RevenueCatService implements IRevenueCatService {
  private stateManager: ServiceStateManager;
  private listenerManager: CustomerInfoListenerManager;

  constructor(config: RevenueCatConfig) {
    this.stateManager = new ServiceStateManager(config);
    this.listenerManager = new CustomerInfoListenerManager(
      config.entitlementIdentifier
    );
  }

  getRevenueCatKey(): string | null {
    return resolveApiKey(this.stateManager.getConfig());
  }

  isInitialized(): boolean {
    return this.stateManager.isInitialized();
  }

  isUsingTestStore(): boolean {
    return this.stateManager.isUsingTestStore();
  }

  getCurrentUserId(): string | null {
    return this.stateManager.getCurrentUserId();
  }

  async initialize(userId: string, apiKey?: string): Promise<InitializeResult> {
    if (this.isInitialized() && this.getCurrentUserId() === userId) {
      if (__DEV__) console.log("[RevenueCat] Already initialized for user:", userId);
      addPackageBreadcrumb("subscription", "Already initialized", { userId });
      return { success: true, offering: (await this.fetchOfferings()), hasPremium: false };
    }

    if (__DEV__) console.log("[RevenueCat] Initializing for user:", userId, "API Key:", apiKey ? "provided" : "from config");
    addPackageBreadcrumb("subscription", "Initialization started", { userId });

    try {
      const result = await initializeSDK(
        {
          config: this.stateManager.getConfig(),
          isUsingTestStore: () => this.isUsingTestStore(),
          isInitialized: () => this.isInitialized(),
          getCurrentUserId: () => this.stateManager.getCurrentUserId(),
          setInitialized: (value) => this.stateManager.setInitialized(value),
          setCurrentUserId: (id) => this.stateManager.setCurrentUserId(id),
        },
        userId,
        apiKey
      );

      if (result.success) {
        if (__DEV__) console.log("[RevenueCat] Initialization successful. Offering:", result.offering?.identifier, "Packages:", result.offering?.availablePackages.length);
        this.listenerManager.setUserId(userId);
        this.listenerManager.setupListener(this.stateManager.getConfig());
        addPackageBreadcrumb("subscription", "Initialization successful", { userId });
      } else {
        if (__DEV__) console.warn("[RevenueCat] Initialization failed for user:", userId);
        trackPackageWarning("subscription", "Initialization failed", {
          userId,
          hasOffering: !!result.offering,
        });
      }

      return result;
    } catch (error) {
      if (__DEV__) console.error("[RevenueCat] Initialization error:", error);
      trackPackageError(error instanceof Error ? error : new Error(String(error)), {
        packageName: "subscription",
        operation: "initialize",
        userId,
      });
      throw error;
    }
  }

  async fetchOfferings(): Promise<PurchasesOffering | null> {
    return fetchOfferings({
      isInitialized: () => this.isInitialized(),
      isUsingTestStore: () => this.isUsingTestStore(),
    });
  }

  async purchasePackage(
    pkg: PurchasesPackage,
    userId: string
  ): Promise<PurchaseResult> {
    return handlePurchase(
      {
        config: this.stateManager.getConfig(),
        isInitialized: () => this.isInitialized(),
        isUsingTestStore: () => this.isUsingTestStore(),
      },
      pkg,
      userId
    );
  }

  async restorePurchases(userId: string): Promise<RestoreResult> {
    return handleRestore(
      {
        config: this.stateManager.getConfig(),
        isInitialized: () => this.isInitialized(),
        isUsingTestStore: () => this.isUsingTestStore(),
      },
      userId
    );
  }

  async reset(): Promise<void> {
    if (!this.isInitialized()) {
      if (__DEV__) console.log("[RevenueCat] Reset called but not initialized");
      return;
    }

    if (__DEV__) console.log("[RevenueCat] Resetting for user:", this.getCurrentUserId());
    addPackageBreadcrumb("subscription", "Reset started", {
      userId: this.getCurrentUserId(),
    });

    this.listenerManager.destroy();

    try {
      await Purchases.logOut();
      this.stateManager.setInitialized(false);
      if (__DEV__) console.log("[RevenueCat] Reset successful");
      addPackageBreadcrumb("subscription", "Reset successful", {});
    } catch (error) {
      if (__DEV__) console.warn("[RevenueCat] Reset failed (non-critical):", error);
      trackPackageWarning("subscription", "Reset failed (non-critical)", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

let revenueCatServiceInstance: RevenueCatService | null = null;

export function initializeRevenueCatService(
  config: RevenueCatConfig
): RevenueCatService {
  if (!revenueCatServiceInstance) {
    revenueCatServiceInstance = new RevenueCatService(config);
  }
  return revenueCatServiceInstance;
}

export function getRevenueCatService(): RevenueCatService | null {
  return revenueCatServiceInstance;
}

export function resetRevenueCatService(): void {
  revenueCatServiceInstance = null;
}
