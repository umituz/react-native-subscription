/**
 * Service State Manager
 * Manages RevenueCat service state
 */

import type { RevenueCatConfig } from "../../domain/value-objects/RevenueCatConfig";
import { isExpoGo, isDevelopment } from "../utils/ExpoGoDetector";

export class ServiceStateManager {
  private isInitializedFlag: boolean = false;
  private usingTestStore: boolean = false;
  private currentUserId: string | null = null;
  private config: RevenueCatConfig;

  constructor(config: RevenueCatConfig) {
    this.config = config;
    this.usingTestStore = this.shouldUseTestStore();

    if (__DEV__) {
      console.log("[RevenueCat] Config", {
        hasTestKey: !!this.config.testStoreKey,
        usingTestStore: this.usingTestStore,
        entitlementIdentifier: this.config.entitlementIdentifier,
      });
    }
  }

  private shouldUseTestStore(): boolean {
    const testKey = this.config.testStoreKey;
    return !!(testKey && (isExpoGo() || isDevelopment()));
  }

  setInitialized(value: boolean): void {
    this.isInitializedFlag = value;
    if (!value) {
      this.currentUserId = null;
    }
  }

  isInitialized(): boolean {
    return this.isInitializedFlag;
  }

  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  isUsingTestStore(): boolean {
    return this.usingTestStore;
  }

  getConfig(): RevenueCatConfig {
    return this.config;
  }

  updateConfig(config: RevenueCatConfig): void {
    this.config = config;
    this.usingTestStore = this.shouldUseTestStore();

    if (__DEV__) {
      console.log("[RevenueCat] Config updated", {
        hasTestKey: !!this.config.testStoreKey,
        usingTestStore: this.usingTestStore,
      });
    }
  }
}
