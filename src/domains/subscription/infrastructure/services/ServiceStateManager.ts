import type { RevenueCatConfig } from '../../core/RevenueCatConfig';

export class ServiceStateManager {
  private isInitializedFlag = false;
  private currentUserId: string | null = null;
  private config: RevenueCatConfig;

  constructor(config: RevenueCatConfig) {
    this.config = config;
  }

  setInitialized(value: boolean): void {
    this.isInitializedFlag = value;
    if (!value) this.currentUserId = null;
  }

  isInitialized(): boolean {
    return this.isInitializedFlag;
  }

  setCurrentUserId(userId: string | null): void {
    this.currentUserId = userId;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  getConfig(): RevenueCatConfig {
    return this.config;
  }
}
